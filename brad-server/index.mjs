// AI Brad for Subscription Plus. POST /brad for replies, POST /report when a
// player flags one of Brad's replies.
// The game falls back to scripted Brad Lite whenever this says no.
import http from "node:http";
import Anthropic from "@anthropic-ai/sdk";
import { buildPrompt, PHASES } from "./prompt.mjs";

const PORT = Number(process.env.PORT || 8080);
const MODEL = process.env.BRAD_MODEL || "claude-haiku-5-5";
// Brad's own spending bucket, in dollars per day (resets at midnight UTC)
const DAILY_BUDGET_USD = Number(process.env.DAILY_BUDGET_USD || 0.5);
// Haiku 5.5 prices per million tokens (prompts under 100K tokens)
const INPUT_PRICE = Number(process.env.INPUT_PRICE_PER_M || 0.1);
const OUTPUT_PRICE = Number(process.env.OUTPUT_PRICE_PER_M || 0.5);
const MAX_CALLS_PER_RUN = 40;
const MAX_CALLS_PER_IP_PER_HOUR = 120;
const MAX_MESSAGE_CHARS = 300;
const MAX_HISTORY = 24;
const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ||
  // The two "localhost" entries are the iOS and Android apps (Capacitor)
  "https://ceymer-studios.com,https://www.ceymer-studios.com,https://ceymer-studios-site.web.app,https://subscriptionplusgame.com,https://www.subscriptionplusgame.com,https://subscriptionplus-game.web.app,https://subscriptionplus-game.firebaseapp.com,http://localhost:5173,capacitor://localhost,https://localhost"
).split(",");
const INTENTS = ["greeting", "cancel", "insult", "transfer", "askBot", "other", "accepted"];
// Intents where Brad may pitch a made-up plan the player can say yes to
const OFFER_INTENTS = ["greeting", "insult", "askBot", "other"];
const MIN_PRICE = 0.99;
const MAX_PRICE = 49.99;

const anthropic = process.env.MOCK_BRAD ? null : new Anthropic(); // reads ANTHROPIC_API_KEY

// Counters live in memory. Deploy with --max-instances=1 so there's one copy.
// Nothing the player types is stored or logged. The only thing ever logged is
// a Brad reply a player reports, so it can be reviewed.
let day = today();
let spentToday = 0;
const callsPerRun = new Map();
const callsPerIp = new Map();
const reportsPerIp = new Map();
const MAX_REPORTS_PER_IP_PER_HOUR = 20;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function rollOver() {
  if (day !== today()) {
    day = today();
    spentToday = 0;
    callsPerRun.clear();
  }
}

// IP addresses are only ever counted for the current hour; every new hour
// starts with empty maps, so no address is kept longer than that
let countingHour = Math.floor(Date.now() / 3_600_000);
function forgetOldHours() {
  const hour = Math.floor(Date.now() / 3_600_000);
  if (hour !== countingHour) {
    countingHour = hour;
    callsPerIp.clear();
    reportsPerIp.clear();
  }
}

function overIpLimit(ip) {
  forgetOldHours();
  const hour = Math.floor(Date.now() / 3_600_000);
  const entry = callsPerIp.get(ip);
  if (!entry || entry.hour !== hour) {
    callsPerIp.set(ip, { hour, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_CALLS_PER_IP_PER_HOUR;
}

function overReportLimit(ip) {
  forgetOldHours();
  const hour = Math.floor(Date.now() / 3_600_000);
  const entry = reportsPerIp.get(ip);
  if (!entry || entry.hour !== hour) {
    reportsPerIp.set(ip, { hour, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REPORTS_PER_IP_PER_HOUR;
}

function send(res, status, body, origin) {
  const headers = { "Content-Type": "application/json" };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

const str = (v, max) => typeof v === "string" && v.length <= max;
const validPrice = (v) => typeof v === "number" && v >= MIN_PRICE && v <= MAX_PRICE;

// Keep only a sane offer: a short name and a real price, rounded to cents
function cleanOffer(offer) {
  if (!offer || typeof offer !== "object") return null;
  const name = typeof offer.name === "string" ? offer.name.trim() : "";
  const price = Number(offer.price);
  if (!name || name.length > 40 || /cancel/i.test(name) || !validPrice(price)) return null;
  return { name, price: Math.round(price * 100) / 100 };
}

// Only accept exactly the shape the game sends
function validate(body) {
  if (!body || typeof body !== "object") return null;
  const { runId, phase, intent, history, run } = body;
  if (!str(runId, 64) || runId.length < 8) return null;
  if (!Number.isInteger(phase) || phase < 0 || phase >= PHASES.length) return null;
  if (!INTENTS.includes(intent)) return null;
  if (!Array.isArray(history) || history.length > MAX_HISTORY) return null;
  for (const m of history) {
    if (!m || !["player", "brad", "system"].includes(m.from)) return null;
    if (!str(m.text, m.from === "player" ? MAX_MESSAGE_CHARS : 600)) return null;
    if (m.name !== undefined && !str(m.name, 40)) return null;
  }
  if (!run || typeof run.total !== "number" || !str(run.jingle, 80)) return null;
  if (!Array.isArray(run.receipts) || run.receipts.length > 40) return null;
  if (!run.receipts.every((r) => str(r, 120))) return null;
  let accepted = null;
  if (intent === "accepted") {
    const offer = body.accepted;
    if (!offer || !str(offer.name, 40) || !validPrice(offer.price)) return null;
    accepted = { name: offer.name, price: offer.price };
  }
  const surcharge = [15, 25, 50, 100][phase];
  return { runId, phase, intent, history, run, surcharge, accepted };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 20_000) {
        reject(new Error("too big"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

// Pull {"reply": ..., "charge": ...} out of the model's answer
function parseReply(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (typeof parsed.reply === "string" && parsed.reply.trim()) {
        return {
          reply: parsed.reply.trim().slice(0, 400),
          charge: parsed.charge === true,
          offer: cleanOffer(parsed.offer),
        };
      }
    } catch {
      // fall through
    }
  }
  const plain = text.trim();
  return plain ? { reply: plain.slice(0, 400), charge: false, offer: null } : null;
}

async function askClaude(request) {
  if (!anthropic) {
    const offer = request.intent === "other" ? { name: "Mock Plus", price: 6.99 } : null;
    return { reply: `[mock ${PHASES[request.phase].name} / ${request.intent}]`, charge: false, offer };
  }
  const { system, user } = buildPrompt(request);
  const response = await anthropic.messages.create({
    model: MODEL,
    // Haiku can think before answering, and thinking counts toward max_tokens.
    // Low effort keeps it quick; the headroom stops replies getting cut off.
    max_tokens: 1024,
    output_config: { effort: "low" },
    system,
    messages: [{ role: "user", content: user }],
  });
  const { input_tokens, output_tokens } = response.usage;
  spentToday += (input_tokens * INPUT_PRICE + output_tokens * OUTPUT_PRICE) / 1_000_000;
  if (response.stop_reason === "max_tokens") console.error("Brad ran out of tokens");
  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
  return parseReply(text);
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;

  if (req.method === "OPTIONS") {
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
        Vary: "Origin",
      });
    } else {
      res.writeHead(403);
    }
    return res.end();
  }

  if (req.method === "GET" && req.url === "/health") {
    rollOver();
    return send(res, 200, { ok: true, spentToday: Number(spentToday.toFixed(4)), budget: DAILY_BUDGET_USD });
  }

  if (req.method !== "POST" || (req.url !== "/brad" && req.url !== "/report")) {
    return send(res, 404, { error: "not found" });
  }
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return send(res, 403, { error: "forbidden" });

  // A player flagged one of Brad's replies. Log just that reply (Cloud Run
  // logs, severity WARNING) so it can be reviewed. Never the player's own text.
  if (req.url === "/report") {
    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
    if (overReportLimit(ip)) return send(res, 429, { error: "slow down" }, origin);
    let report;
    try {
      report = JSON.parse(await readBody(req));
    } catch {
      report = null;
    }
    if (!report || !str(report.text, 600) || !str(report.name ?? "Brad", 40) || !str(report.runId ?? "", 64)) {
      return send(res, 400, { error: "bad request" }, origin);
    }
    console.log(
      JSON.stringify({
        severity: "WARNING",
        message: "Brad reply reported",
        brad: report.name ?? "Brad",
        reply: report.text,
        runId: report.runId ?? "",
      }),
    );
    return send(res, 200, { ok: true }, origin);
  }

  rollOver();
  if (spentToday >= DAILY_BUDGET_USD) return send(res, 503, { fallback: "budget" }, origin);

  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  if (overIpLimit(ip)) return send(res, 429, { fallback: "rate" }, origin);

  let request;
  try {
    request = validate(JSON.parse(await readBody(req)));
  } catch {
    request = null;
  }
  if (!request) return send(res, 400, { error: "bad request" }, origin);

  const calls = (callsPerRun.get(request.runId) || 0) + 1;
  callsPerRun.set(request.runId, calls);
  if (calls > MAX_CALLS_PER_RUN) return send(res, 429, { fallback: "run" }, origin);

  try {
    const answer = await askClaude(request);
    if (!answer) return send(res, 502, { fallback: "empty" }, origin);
    // Charges only make sense on general chat
    if (request.intent !== "other") answer.charge = false;
    if (!OFFER_INTENTS.includes(request.intent)) answer.offer = null;
    return send(res, 200, answer, origin);
  } catch (err) {
    console.error("Claude call failed:", err?.status ?? "", err?.message ?? err);
    return send(res, 502, { fallback: "error" }, origin);
  }
});

server.listen(PORT, () => console.log(`Brad is on shift (port ${PORT}, budget $${DAILY_BUDGET_USD}/day)`));

import { useGameStore } from "../../state/gameStore";
import { jingleVersions } from "../../audio/jingleVersions";

// AI Brad lives on a small server (brad-server/). Without its URL the game
// just uses scripted Brad Lite. Set VITE_BRAD_URL in .env.production.
const BRAD_URL = import.meta.env.VITE_BRAD_URL as string | undefined;
const TIMEOUT_MS = 9000;
const HISTORY_LENGTH = 24;

export const aiBradAvailable = Boolean(BRAD_URL);

export type AiIntent =
  | "greeting"
  | "cancel"
  | "insult"
  | "transfer"
  | "askBot"
  | "other"
  | "accepted";
// A made-up plan Brad pitched; saying yes really adds it to the bill
export type Offer = { name: string; price: number };
export type AiReply = { reply: string; charge: boolean; offer: Offer | null };

// Returns null whenever AI Brad can't answer, so the caller falls back to Lite
export async function askBrad(
  phase: number,
  intent: AiIntent,
  accepted?: Offer,
): Promise<AiReply | null> {
  if (!BRAD_URL) return null;
  const state = useGameStore.getState();
  const edition =
    jingleVersions.find((v) => v.id === state.jingleVersion)?.edition ?? "Classic Edition";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(BRAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        runId: state.runId,
        phase,
        intent,
        ...(accepted ? { accepted } : {}),
        history: state.messages.slice(-HISTORY_LENGTH).map((m) => ({
          from: m.from,
          ...(m.name ? { name: m.name } : {}),
          text: m.text.slice(0, 300),
        })),
        run: {
          total: Math.round(state.monthlyTotal * 100) / 100,
          jingle: edition,
          receipts: state.receipts.slice(-40),
        },
      }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as Partial<AiReply>;
    if (typeof data.reply !== "string" || !data.reply.trim()) return null;
    const offer =
      data.offer &&
      typeof data.offer.name === "string" &&
      typeof data.offer.price === "number" &&
      data.offer.price > 0
        ? { name: data.offer.name, price: data.offer.price }
        : null;
    return { reply: data.reply, charge: data.charge === true, offer };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

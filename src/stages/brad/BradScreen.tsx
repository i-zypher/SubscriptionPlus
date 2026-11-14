import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { useGameStore } from "../../state/gameStore";
import type { Ending } from "../../state/gameStore";
import { bradPhases } from "./bradPhases";
import { detectIntent, mentionsIntent, pickLine, pickReply } from "./bradLogic";
import { playJingle, pauseJingle } from "../../audio/jinglePlayer";
import { playMoneyAddedTone } from "../../audio/sounds";
import { FEATURE_FEE, BRAD_HANDS_OFF } from "./bradScript";
import { aiBradAvailable, askBrad, reportBradReply } from "./bradAI";
import { liteReply, soundsLikeDistress, DISTRESS_REPLY } from "./bradLite";
import type { AiIntent, Offer } from "./bradAI";
import "./brad.css";

const ASKS_TO_CRACK = 3;
const CANCELS_TO_WIN = 3;
const BRAD_WAVERS =
  "BRAD… BRAD HEARD THAT. NO ONE HAS EVER SAID IT TWICE. DO NOT SAY IT AGAIN.";
const BRAD_GIVES_UP =
  "…FINE. FINE! NO ONE HAS EVER SAID IT THREE TIMES. YOUR SUBSCRIPTION IS CANCELLED. FOR FREE. NO FEES. NO CANCEL PLUS. BRAD NEEDS TO LIE DOWN.";
const INSULTS_TO_TRANSFER = 3;
// The first Brad can't help with anything: after this many of your messages
// he passes you on to the Specialist himself
const MESSAGES_BEFORE_HANDOFF = 8;
// Hold time before each new Brad picks up: Specialist, Senior Specialist, BRAD
const HOLD_MS = [15 * 1000, 30 * 1000, 45 * 1000];
// Pay to skip the wait. It rhymes, so it ships.
const SKIP_LINE_FEE = 4.99;
const ENDING_DELAY_MS = 3500;

const LAST_PHASE = bradPhases.length - 1;

// Total and time left, shown in every Brad's header
function useMeters() {
  const monthlyTotal = useGameStore((state) => state.monthlyTotal);
  const trialEndsAt = useGameStore((state) => state.trialEndsAt);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  const remaining = Math.max(0, (trialEndsAt ?? now) - now);
  const time = `${Math.floor(remaining / 60000)}:${String(
    Math.floor(remaining / 1000) % 60
  ).padStart(2, "0")}`;
  return { total: `$${monthlyTotal.toFixed(2)}`, time };
}

function BradScreen() {
  const messages = useGameStore((state) => state.messages);
  const transferCount = useGameStore((state) => state.transferCount);
  const jingleVersion = useGameStore((state) => state.jingleVersion);
  const addMessage = useGameStore((state) => state.addMessage);
  const addToTotal = useGameStore((state) => state.addToTotal);
  const nextTransfer = useGameStore((state) => state.nextTransfer);
  const setEnding = useGameStore((state) => state.setEnding);
  const setMusicPaused = useGameStore((state) => state.setMusicPaused);
  const goToStage = useGameStore((state) => state.goToStage);
  const setBradMode = useGameStore((state) => state.setBradMode);

  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [onHold, setOnHold] = useState(false);
  // Paid to skip this hold: hide the button while the next Brad picks up
  const [skipped, setSkipped] = useState(false);
  const [ended, setEnded] = useState(false);
  const [pitchOpen, setPitchOpen] = useState(false);
  // The last made-up plan AI Brad pitched, waiting for a yes
  const [offer, setOffer] = useState<Offer | null>(null);
  // These reset for each new Brad
  const [botAsks, setBotAsks] = useState(0);
  const [insults, setInsults] = useState(0);
  // Say cancel to BRAD three times and he finally breaks
  const [cancels, setCancels] = useState(0);

  const timers = useRef<number[]>([]);
  // The hold in progress: its timer, and what happens when it ends (so
  // "Skip the line" can end it early)
  const holdTimer = useRef<number | null>(null);
  // Messages sent to the first Brad, and whether the last one was real
  // distress (no joke handoff after that) or an ending has started
  const turnsWithFirstBrad = useRef(0);
  const lastWasDistress = useRef(false);
  const endedRef = useRef(false);
  const holdDone = useRef<(() => Promise<void>) | null>(null);
  const alive = useRef(true);
  const chatRef = useRef<HTMLDivElement | null>(null);

  const phaseIndex = Math.min(transferCount, LAST_PHASE);
  const phase = bradPhases[phaseIndex];
  const busy = typing || onHold || ended;

  // The first Brad says hi once per run
  useEffect(() => {
    if (useGameStore.getState().messages.length === 0) {
      if (aiBradAvailable) setBradMode("ai");
      const first = bradPhases[0];
      addMessage({
        from: "brad",
        name: first.name,
        text: pickLine(first.greetings),
      });
    }
  }, [addMessage, setBradMode]);

  // Cancel pending replies and stop the hold music if the screen goes away
  useEffect(() => {
    const pending = timers.current;
    alive.current = true;
    return () => {
      alive.current = false;
      pending.forEach((id) => clearTimeout(id));
      pauseJingle();
      setMusicPaused(false);
    };
  }, [setMusicPaused]);
  // Keep the newest message in view. Scroll only the chat box: scrollIntoView
  // also scrolls the whole page on iOS Safari, which jumps the layout.
  useEffect(() => {
    const chat = chatRef.current;
    if (chat) chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });
    // BRAD's broken page has no chat box, so the whole page scrolls instead
    const page = chat?.closest(".brad");
    if (page && chat && chat.scrollHeight <= chat.clientHeight + 1) {
      page.scrollTo({ top: page.scrollHeight, behavior: "smooth" });
    }
  }, [messages, typing, onHold]);

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  // Reporting a reply (required for AI chat in the app stores)
  const [reported, setReported] = useState<Record<number, "sending" | "sent">>(
    {}
  );
  async function report(index: number, text: string, name: string) {
    setReported((r) => ({ ...r, [index]: "sending" }));
    const ok = await reportBradReply(text, name);
    setReported((r) => {
      const next = { ...r };
      if (ok) next[index] = "sent";
      else delete next[index]; // let them try again
      return next;
    });
  }

  function bradSays(text: string) {
    addMessage({ from: "brad", name: phase.name, text });
  }

  function charge(amount: number, label: string) {
    addToTotal(amount, label);
    playMoneyAddedTone();
  }

  // Ask AI Brad, but never answer faster than this Brad types. Falls back to
  // the scripted line (and Brad Lite for the rest of the run) if AI can't answer.
  async function aiLine(
    phaseIndexForLine: number,
    intent: AiIntent,
    minMs: number,
    accepted?: Offer
  ) {
    if (useGameStore.getState().bradMode !== "ai") {
      await wait(minMs);
      return null;
    }
    const [answer] = await Promise.all([
      askBrad(phaseIndexForLine, intent, accepted),
      wait(minMs),
    ]);
    if (!answer && alive.current && useGameStore.getState().bradMode === "ai") {
      setBradMode("lite");
      addMessage({
        from: "system",
        text: "☕ Brad is on break. You're now chatting with Brad Lite.",
      });
    }
    return answer;
  }

  function wait(ms: number) {
    return new Promise<void>((resolve) => later(resolve, ms));
  }

  function finish(ending: Ending) {
    endedRef.current = true;
    setEnded(true);
    later(() => {
      setEnding(ending);
      goToStage("endings");
    }, ENDING_DELAY_MS);
  }

  // Same song as the ad bursts, picking up wherever it left off
  function startHoldMusic() {
    if (!jingleVersion) return;
    setMusicPaused(true);
    playJingle(jingleVersion);
  }

  function stopHoldMusic() {
    pauseJingle();
    setMusicPaused(false);
  }
  function putOnHold() {
    setOnHold(true);
    setSkipped(false);
    addMessage({
      from: "system",
      text: "🎵 You've been placed on hold. Your call is important to us.",
    });
    startHoldMusic();

    const finishHold = async () => {
      holdDone.current = null;
      stopHoldMusic();
      const nextIndex = Math.min(phaseIndex + 1, LAST_PHASE);
      const next = bradPhases[nextIndex];
      nextTransfer();
      setBotAsks(0);
      setInsults(0);
      setCancels(0);
      setPitchOpen(false);
      setOffer(null);
      addMessage({
        from: "system",
        text: `🔄 You've been transferred to ${next.name}.`,
      });
      setTyping(true);
      const ai = await aiLine(nextIndex, "greeting", next.typingMs);
      if (!alive.current) return;
      setTyping(false);
      addMessage({
        from: "brad",
        name: next.name,
        text: ai?.reply ?? pickLine(next.greetings),
      });
      setOffer(ai?.offer ?? null);
      setOnHold(false);
    };
    holdDone.current = finishHold;
    const id = window.setTimeout(
      finishHold,
      HOLD_MS[Math.min(phaseIndex, HOLD_MS.length - 1)]
    );
    holdTimer.current = id;
    timers.current.push(id);
  }

  // $4.99 to end the hold right now
  function skipTheLine() {
    const done = holdDone.current;
    if (!done) return;
    if (holdTimer.current !== null) clearTimeout(holdTimer.current);
    setSkipped(true);
    charge(SKIP_LINE_FEE, `Skip the Line from ${phase.name}`);
    addMessage({
      from: "system",
      text: "⏩ You skipped the line! Skip the Line is $4.99/mo. You'll be skipping lines monthly now.",
    });
    void done();
  }

  async function respond(message: string) {
    lastWasDistress.current = false;
    // Real distress skips the bit entirely: no charges, no jokes
    if (soundsLikeDistress(message)) {
      lastWasDistress.current = true;
      setPitchOpen(false);
      setOffer(null);
      addMessage({ from: "system", text: DISTRESS_REPLY });
      return;
    }

    const detected = detectIntent(message);
    // A cursed cancel ("cancel this shit") is both: the surcharge still hits,
    // but from the second Brad up it also counts as a cancel. The first Brad
    // can't cancel anything, so for him it's just an insult.
    const cursedCancel =
      detected === "insult" &&
      phaseIndex > 0 &&
      mentionsIntent(message, "cancel");
    const intent = cursedCancel ? "cancel" : detected;
    const pitchWasOpen = pitchOpen;
    const offerWasOpen = offer;
    setPitchOpen(false);
    setOffer(null);

    // Saying yes to one of Brad's made-up plans really buys it
    if (intent === "yes" && !pitchWasOpen && offerWasOpen) {
      charge(
        offerWasOpen.price,
        `${offerWasOpen.name} (upsold by ${phase.name})`
      );
      setTyping(true);
      const ai = await aiLine(
        phaseIndex,
        "accepted",
        phase.typingMs,
        offerWasOpen
      );
      if (!alive.current) return;
      setTyping(false);
      const price = `$${offerWasOpen.price.toFixed(2)}/mo`;
      bradSays(
        ai?.reply ??
          (phaseIndex === LAST_PHASE
            ? `${offerWasOpen.name.toUpperCase()} IS YOURS. ${price}. BRAD IS PLEASED.`
            : `Done! ${offerWasOpen.name} is now on your account for ${price}. 😊`)
      );
      return;
    }

    // The surcharge hits instantly; Brad's reply takes its time
    let insultsNow = insults;
    if (intent === "insult" || cursedCancel) {
      charge(phase.surcharge, `Insult surcharge from ${phase.name}`);
      insultsNow = insults + 1;
      setInsults(insultsNow);
    }

    setTyping(true);
    const asks = intent === "askBot" ? botAsks + 1 : botAsks;
    if (intent === "askBot") setBotAsks(asks);
    const atBrad = phaseIndex === LAST_PHASE;
    const cancelCount = atBrad && intent === "cancel" ? cancels + 1 : cancels;
    if (atBrad && intent === "cancel") setCancels(cancelCount);

    // Endings and BRAD's refusal stay scripted: they're the punchlines,
    // and the game (not the AI) decides when you win
    const scripted =
      intent === "iAmBot" ||
      (intent === "askBot" && asks >= ASKS_TO_CRACK) ||
      (intent === "yes" && pitchWasOpen) ||
      (intent === "transfer" && phaseIndex === LAST_PHASE) ||
      (intent === "cancel" && atBrad && cancelCount >= CANCELS_TO_WIN - 1);

    const aiIntent: AiIntent =
      intent === "yes" || intent === "iAmBot" ? "other" : intent;
    const ai = scripted
      ? (await wait(phase.typingMs), null)
      : await aiLine(phaseIndex, aiIntent, phase.typingMs);
    if (!alive.current) return;
    setTyping(false);

    switch (intent) {
      case "iAmBot":
        bradSays(pickReply(phase, "iAmBot"));
        finish("player-is-bot");
        return;

      case "askBot":
        if (asks >= ASKS_TO_CRACK) {
          bradSays(phase.crack);
          finish("brad-admits-bot");
        } else {
          bradSays(ai?.reply ?? pickReply(phase, "askBot"));
          setOffer(ai?.offer ?? null);
        }
        return;

      case "yes":
        if (pitchWasOpen) {
          bradSays(pickReply(phase, "yes"));
          finish("cancel-plus");
          return;
        }
        break; // otherwise it's just chat

      case "cancel":
        if (atBrad && cancelCount >= CANCELS_TO_WIN) {
          bradSays(BRAD_GIVES_UP);
          finish("true-cancel");
          return;
        }
        if (atBrad && cancelCount === CANCELS_TO_WIN - 1) {
          bradSays(BRAD_WAVERS);
          return;
        }
        bradSays(ai?.reply ?? pickReply(phase, "cancel"));
        // The first Brad has nothing to sell you. Only the Brads above him
        // can offer Cancel Plus.
        if (phaseIndex > 0) setPitchOpen(true);
        return;

      case "transfer":
        bradSays(ai?.reply ?? pickReply(phase, "transfer"));
        // Nobody is above BRAD
        if (phaseIndex < LAST_PHASE) putOnHold();
        return;

      case "insult":
        bradSays(ai?.reply ?? pickReply(phase, "insult"));
        setOffer(ai?.offer ?? null);
        // Three insults and this Brad hands you off
        if (insultsNow >= INSULTS_TO_TRANSFER && phaseIndex < LAST_PHASE) {
          putOnHold();
        }
        return;

      case "other":
        break;
    }

    // General chat
    if (ai) {
      bradSays(ai.reply);
      setOffer(ai.offer);
      if (ai.charge)
        charge(FEATURE_FEE, `Plus+ feature fee from ${phase.name}`);
    } else {
      const lite = liteReply(phaseIndex, message);
      bradSays(lite.text);
      setOffer(lite.offer);
      if (lite.charge > 0)
        charge(lite.charge, `Plus+ feature fee from ${phase.name}`);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    addMessage({ from: "player", text });
    setDraft("");
    void (async () => {
      await respond(text);
      // Eight messages in and he still can't help: Brad passes you on
      if (phaseIndex !== 0 || !alive.current) return;
      turnsWithFirstBrad.current += 1;
      const startedSomethingElse =
        holdDone.current !== null || endedRef.current;
      if (
        turnsWithFirstBrad.current >= MESSAGES_BEFORE_HANDOFF &&
        !startedSomethingElse &&
        !lastWasDistress.current
      ) {
        setPitchOpen(false);
        setOffer(null);
        bradSays(pickLine(BRAD_HANDS_OFF));
        putOnHold();
      }
    })();
  }

  const brokenPage = phaseIndex === LAST_PHASE;
  const meters = useMeters();

  return (
    <div className={`brad brad-p${phaseIndex}`}>
      <div className="brad-window">
        {/* Each Brad is a worse website than the last. BRAD is barely a website. */}
        {brokenPage && (
          <>
            <p className="brad-err">
              Uncaught TypeError: brad.isHuman is not a function
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;at SupportChat.render (chat.js:6767)
            </p>
            <div className="brad-applet" aria-hidden="true">
              <span>☕</span>
              <div>
                <strong>Java(TM) Plug-in failed to load</strong>
                <br />
                ClassNotFoundException: BradApplet.class
              </div>
            </div>
          </>
        )}

        <header className="brad-head">
          {!brokenPage && (
            <div className="brad-avatar" aria-hidden="true">
              {phaseIndex === 2 ? "👔" : "B"}
            </div>
          )}
          <div className="brad-who">
            <h2>
              {brokenPage
                ? "Live Support - [object Object]"
                : `Live Support · ${phase.name}`}
            </h2>
            <small>
              {brokenPage
                ? "status: undefined"
                : phaseIndex === 0
                ? "Online · usually replies instantly"
                : phaseIndex === 1
                ? "Specialist Desk · Ticket #A-0042"
                : "Senior Specialist · Office of Customer Success"}
            </small>
          </div>
          <div className="brad-meters">
            <span>
              {brokenPage ? `TOTAL=${meters.total}` : `${meters.total}/mo`}
            </span>
            <span>
              {brokenPage
                ? `trial.remaining=${meters.time}`
                : `Trial ${meters.time}`}
            </span>
          </div>
        </header>

        <div ref={chatRef} className="brad-log">
          {messages.map((m, i) => (
            <div key={i} className={`bmsg is-${m.from}`}>
              {m.from === "brad" && (
                <strong className="bmsg-name">{m.name ?? "Brad"}</strong>
              )}
              <span>{m.text}</span>
              {m.from === "brad" && (
                <button
                  type="button"
                  className="bmsg-report"
                  disabled={reported[i] !== undefined}
                  onClick={() => report(i, m.text, m.name ?? "Brad")}
                >
                  {reported[i] === "sent"
                    ? "Reported. Thanks."
                    : reported[i] === "sending"
                    ? "Reporting…"
                    : "⚑ Report"}
                </button>
              )}
            </div>
          ))}
          {typing && (
            <div className="bmsg is-brad is-typing">
              <strong className="bmsg-name">{phase.name}</strong>
              <span>
                {brokenPage ? (
                  "BRAD is typing... NaN%"
                ) : (
                  <>
                    <i />
                    <i />
                    <i />
                  </>
                )}
              </span>
            </div>
          )}
          {onHold && (
            <div className="bmsg is-system is-hold">
              🎵 On hold…
              {!skipped && (
                <button
                  type="button"
                  className="brad-skip"
                  onClick={skipTheLine}
                >
                  {brokenPage ? "SkipLine($4.99)" : "Skip the line for $4.99"}
                </button>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="brad-form">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            // Always typable: on iPhones a disabled or read-only input that you
            // tap never opens the keyboard, even after it's editable again.
            // You can type ahead while Brad types; only sending waits
            // (the Send button and handleSubmit both check busy).
            enterKeyHint="send"
            aria-label="Message Brad"
            placeholder={
              onHold
                ? "You're on hold…"
                : brokenPage
                ? "undefined"
                : "Type a message…"
            }
          />
          <button type="submit" disabled={busy}>
            {brokenPage ? "Submit Query" : "Send"}
          </button>
        </form>

        {brokenPage && (
          <p className="brad-footer">
            Best viewed in Netscape Navigator 4.0 at 800x600. © 1998
            Subscription Plus.
            <br />
            <a href="#top" onClick={(e) => e.preventDefault()}>
              Return to homepage
            </a>
            {" | "}
            <a href="#top" onClick={(e) => e.preventDefault()}>
              Sign our guestbook
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

export default BradScreen;

import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { useGameStore } from "../../state/gameStore";
import type { Ending } from "../../state/gameStore";
import { bradPhases } from "./bradPhases";
import { detectIntent, pickLine, pickReply, pickOtherReply } from "./bradLogic";
import { playJingle, pauseJingle } from "../../audio/jinglePlayer";
import { playMoneyAddedTone } from "../../audio/sounds";
import { FEATURE_FEE } from "./bradScript";
import { aiBradAvailable, askBrad } from "./bradAI";
import type { AiIntent, Offer } from "./bradAI";

const ASKS_TO_CRACK = 3;
const INSULTS_TO_TRANSFER = 3;
const HOLD_MS = 15 * 1000;
const ENDING_DELAY_MS = 3500;

const LAST_PHASE = bradPhases.length - 1;

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
  const [ended, setEnded] = useState(false);
  const [pitchOpen, setPitchOpen] = useState(false);
  // The last made-up plan AI Brad pitched, waiting for a yes
  const [offer, setOffer] = useState<Offer | null>(null);
  // These reset for each new Brad
  const [botAsks, setBotAsks] = useState(0);
  const [insults, setInsults] = useState(0);

  const timers = useRef<number[]>([]);
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
  }, [messages, typing, onHold]);

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  function bradSays(text: string) {
    addMessage({ from: "brad", name: phase.name, text });
  }

  function charge(amount: number, label: string) {
    addToTotal(amount, label);
    playMoneyAddedTone();
  }

  // Scripted Brad Lite's general reply (sometimes a $4.99 "feature")
  function liteOther(): { text: string; charge: number } {
    return pickOtherReply(phase);
  }

  // Ask AI Brad, but never answer faster than this Brad types. Falls back to
  // the scripted line (and Brad Lite for the rest of the run) if AI can't answer.
  async function aiLine(
    phaseIndexForLine: number,
    intent: AiIntent,
    minMs: number,
    accepted?: Offer,
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
    addMessage({
      from: "system",
      text: "🎵 You've been placed on hold. Your call is important to us.",
    });
    startHoldMusic();

    later(async () => {
      stopHoldMusic();
      const nextIndex = Math.min(phaseIndex + 1, LAST_PHASE);
      const next = bradPhases[nextIndex];
      nextTransfer();
      setBotAsks(0);
      setInsults(0);
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
    }, HOLD_MS);
  }

  async function respond(message: string) {
    const intent = detectIntent(message);
    const pitchWasOpen = pitchOpen;
    const offerWasOpen = offer;
    setPitchOpen(false);
    setOffer(null);

    // Saying yes to one of Brad's made-up plans really buys it
    if (intent === "yes" && !pitchWasOpen && offerWasOpen) {
      charge(offerWasOpen.price, `${offerWasOpen.name} (upsold by ${phase.name})`);
      setTyping(true);
      const ai = await aiLine(phaseIndex, "accepted", phase.typingMs, offerWasOpen);
      if (!alive.current) return;
      setTyping(false);
      const price = `$${offerWasOpen.price.toFixed(2)}/mo`;
      bradSays(
        ai?.reply ??
          (phaseIndex === LAST_PHASE
            ? `${offerWasOpen.name.toUpperCase()} IS YOURS. ${price}. BRAD IS PLEASED.`
            : `Done! ${offerWasOpen.name} is now on your account for ${price}. 😊`),
      );
      return;
    }

    // The surcharge hits instantly; Brad's reply takes its time
    let insultsNow = insults;
    if (intent === "insult") {
      charge(phase.surcharge, `Insult surcharge from ${phase.name}`);
      insultsNow = insults + 1;
      setInsults(insultsNow);
    }

    setTyping(true);
    const asks = intent === "askBot" ? botAsks + 1 : botAsks;
    if (intent === "askBot") setBotAsks(asks);

    // Endings and BRAD's refusal stay scripted: they're the punchlines,
    // and the game (not the AI) decides when you win
    const scripted =
      intent === "iAmBot" ||
      (intent === "askBot" && asks >= ASKS_TO_CRACK) ||
      (intent === "yes" && pitchWasOpen) ||
      (intent === "transfer" && phaseIndex === LAST_PHASE);

    const aiIntent: AiIntent = intent === "yes" || intent === "iAmBot" ? "other" : intent;
    const ai = scripted ? (await wait(phase.typingMs), null) : await aiLine(phaseIndex, aiIntent, phase.typingMs);
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
        bradSays(ai?.reply ?? pickReply(phase, "cancel"));
        setPitchOpen(true);
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
      if (ai.charge) charge(FEATURE_FEE, `Plus+ feature fee from ${phase.name}`);
    } else {
      const lite = liteOther();
      bradSays(lite.text);
      if (lite.charge > 0) charge(lite.charge, `Plus+ feature fee from ${phase.name}`);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    addMessage({ from: "player", text });
    setDraft("");
    void respond(text);
  }

  return (
    <div style={{ maxWidth: "520px", margin: "0 auto", textAlign: "left" }}>
      <h2>Live Support · {phase.name}</h2>

      <div
        ref={chatRef}
        style={{
          height: "360px",
          overflowY: "auto",
          border: "1px solid #444",
          borderRadius: "12px",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {messages.map((m, i) => (
          <p
            key={i}
            style={{
              margin: 0,
              alignSelf:
                m.from === "player"
                  ? "flex-end"
                  : m.from === "brad"
                    ? "flex-start"
                    : "center",
              fontStyle: m.from === "system" ? "italic" : "normal",
              opacity: m.from === "system" ? 0.7 : 1,
            }}
          >
            {m.from === "brad" && <strong>{m.name ?? "Brad"}: </strong>}
            {m.text}
          </p>
        ))}
        {typing && (
          <p style={{ margin: 0, opacity: 0.7 }}>{phase.name} is typing…</p>
        )}
        {onHold && (
          <p style={{ margin: 0, opacity: 0.7, alignSelf: "center" }}>
            🎵 On hold…
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "8px", marginTop: "8px" }}
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          // readOnly, not disabled: iOS Safari leaves a focused input that gets
          // disabled unresponsive. handleSubmit already ignores sends while busy.
          readOnly={busy}
          aria-label="Message Brad"
          placeholder={onHold ? "You're on hold…" : "Type a message…"}
          // 16px or larger stops iOS Safari from zooming in on focus
          style={{ flex: 1, fontSize: "16px" }}
        />
        <button type="submit" disabled={busy}>
          Send
        </button>
      </form>
    </div>
  );
}

export default BradScreen;

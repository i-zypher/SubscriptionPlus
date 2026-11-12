import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { useGameStore } from "../../state/gameStore";
import type { Ending } from "../../state/gameStore";
import { bradPhases } from "./bradPhases";
import { detectIntent, pickLine, pickReply, pickOtherReply } from "./bradLogic";
import { playJingle, pauseJingle } from "../../audio/jinglePlayer";
import { playMoneyAddedTone } from "../../audio/sounds";

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

  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [ended, setEnded] = useState(false);
  const [pitchOpen, setPitchOpen] = useState(false);
  // These reset for each new Brad
  const [botAsks, setBotAsks] = useState(0);
  const [insults, setInsults] = useState(0);

  const timers = useRef<number[]>([]);
  const chatRef = useRef<HTMLDivElement | null>(null);

  const phaseIndex = Math.min(transferCount, LAST_PHASE);
  const phase = bradPhases[phaseIndex];
  const busy = typing || onHold || ended;

  // The first Brad says hi once per run
  useEffect(() => {
    if (useGameStore.getState().messages.length === 0) {
      const first = bradPhases[0];
      addMessage({
        from: "brad",
        name: first.name,
        text: pickLine(first.greetings),
      });
    }
  }, [addMessage]);

  // Cancel pending replies and stop the hold music if the screen goes away
  useEffect(() => {
    const pending = timers.current;
    return () => {
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

  function bradSaysOther() {
    const reply = pickOtherReply(phase);
    bradSays(reply.text);
    if (reply.charge > 0) {
      addToTotal(reply.charge);
      playMoneyAddedTone();
    }
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

    later(() => {
      stopHoldMusic();
      const next = bradPhases[Math.min(phaseIndex + 1, LAST_PHASE)];
      nextTransfer();
      setBotAsks(0);
      setInsults(0);
      setPitchOpen(false);
      addMessage({
        from: "system",
        text: `🔄 You've been transferred to ${next.name}.`,
      });
      addMessage({
        from: "brad",
        name: next.name,
        text: pickLine(next.greetings),
      });
      setOnHold(false);
    }, HOLD_MS);
  }

  function respond(message: string) {
    const intent = detectIntent(message);
    const pitchWasOpen = pitchOpen;
    setPitchOpen(false);

    // The surcharge hits instantly; Brad's reply takes its time
    let insultsNow = insults;
    if (intent === "insult") {
      addToTotal(phase.surcharge);
      playMoneyAddedTone();
      insultsNow = insults + 1;
      setInsults(insultsNow);
    }

    setTyping(true);
    later(() => {
      setTyping(false);

      switch (intent) {
        case "iAmBot":
          bradSays(pickReply(phase, "iAmBot"));
          finish("player-is-bot");
          return;

        case "askBot": {
          const asks = botAsks + 1;
          setBotAsks(asks);
          if (asks >= ASKS_TO_CRACK) {
            bradSays(phase.crack);
            finish("brad-admits-bot");
          } else {
            bradSays(pickReply(phase, "askBot"));
          }
          return;
        }

        case "yes":
          if (pitchWasOpen) {
            bradSays(pickReply(phase, "yes"));
            finish("cancel-plus");
          } else {
            bradSaysOther();
          }
          return;

        case "cancel":
          bradSays(pickReply(phase, "cancel"));
          setPitchOpen(true);
          return;

        case "transfer":
          bradSays(pickReply(phase, "transfer"));
          // Nobody is above BRAD
          if (phaseIndex < LAST_PHASE) putOnHold();
          return;

        case "insult":
          bradSays(pickReply(phase, "insult"));
          // Three insults and this Brad hands you off
          if (insultsNow >= INSULTS_TO_TRANSFER && phaseIndex < LAST_PHASE) {
            putOnHold();
          }
          return;

        case "other":
          bradSaysOther();
          return;
      }
    }, phase.typingMs);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    addMessage({ from: "player", text });
    setDraft("");
    respond(text);
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

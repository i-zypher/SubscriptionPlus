import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { useGameStore } from "../../state/gameStore";
import type { Ending } from "../../state/gameStore";
import {
  BRAD_GREETING,
  BRAD_CRACK,
  BRAD_NAMES,
  INSULT_SURCHARGE,
} from "./bradScript";
import { detectIntent, pickReply, pickOtherReply } from "./bradLogic";
import { playMoneyAddedTone } from "../../audio/sounds";

const TYPING_MS = 1800;
const ASKS_TO_CRACK = 3;
const ENDING_DELAY_MS = 3500;

function BradScreen() {
  const messages = useGameStore((state) => state.messages);
  const transferCount = useGameStore((state) => state.transferCount);
  const addMessage = useGameStore((state) => state.addMessage);
  const addToTotal = useGameStore((state) => state.addToTotal);
  const nextTransfer = useGameStore((state) => state.nextTransfer);
  const setEnding = useGameStore((state) => state.setEnding);
  const goToStage = useGameStore((state) => state.goToStage);

  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [ended, setEnded] = useState(false);
  const [pitchOpen, setPitchOpen] = useState(false);
  const [botAsks, setBotAsks] = useState(0);

  const timers = useRef<number[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const bradName = BRAD_NAMES[Math.min(transferCount, BRAD_NAMES.length - 1)];

  // Brad says hi once per run
  useEffect(() => {
    if (useGameStore.getState().messages.length === 0) {
      addMessage({ from: "brad", text: BRAD_GREETING });
    }
  }, [addMessage]);

  // Cancel any pending replies if the screen goes away
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => clearTimeout(id));
  }, []);

  // Keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  function bradSays(text: string) {
    addMessage({ from: "brad", text });
  }

  function finish(ending: Ending) {
    setEnded(true);
    later(() => {
      setEnding(ending);
      goToStage("endings");
    }, ENDING_DELAY_MS);
  }

  function respond(message: string) {
    const intent = detectIntent(message);
    const pitchWasOpen = pitchOpen;
    setPitchOpen(false);

    // The surcharge hits instantly; Brad's reply takes its time
    if (intent === "insult") {
      addToTotal(INSULT_SURCHARGE);
      playMoneyAddedTone();
    }

    setTyping(true);
    later(() => {
      setTyping(false);

      switch (intent) {
        case "iAmBot":
          bradSays(pickReply("iAmBot"));
          finish("player-is-bot");
          return;

        case "askBot": {
          const asks = botAsks + 1;
          setBotAsks(asks);
          if (asks >= ASKS_TO_CRACK) {
            bradSays(BRAD_CRACK);
            finish("brad-admits-bot");
          } else {
            bradSays(pickReply("askBot"));
          }
          return;
        }

        case "yes":
          if (pitchWasOpen) {
            bradSays(pickReply("yes"));
            finish("cancel-plus");
          } else {
            bradSaysOther();
          }
          return;

        case "cancel":
          bradSays(pickReply("cancel"));
          setPitchOpen(true);
          return;

        case "transfer":
          bradSays(pickReply("transfer"));
          setTyping(true);
          later(() => {
            nextTransfer();
            addMessage({
              from: "system",
              text: "🔄 You've been transferred to a specialist.",
            });
            setTyping(false);
          }, TYPING_MS);
          return;

        case "other":
          bradSaysOther();
          return;

        default:
          bradSays(pickReply(intent));
      }
    }, TYPING_MS);
  }

  function bradSaysOther() {
    const reply = pickOtherReply();
    bradSays(reply.text);
    if (reply.charge > 0) {
      addToTotal(reply.charge);
      playMoneyAddedTone();
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || typing || ended) return;
    addMessage({ from: "player", text });
    setDraft("");
    respond(text);
  }

  return (
    <div style={{ maxWidth: "520px", margin: "0 auto", textAlign: "left" }}>
      <h2>Live Support · {bradName}</h2>

      <div
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
            {m.from === "brad" && <strong>{bradName}: </strong>}
            {m.text}
          </p>
        ))}
        {typing && (
          <p style={{ margin: 0, opacity: 0.7 }}>{bradName} is typing…</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "8px", marginTop: "8px" }}
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={typing || ended}
          aria-label="Message Brad"
          placeholder="Type a message…"
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={typing || ended}>
          Send
        </button>
      </form>
    </div>
  );
}

export default BradScreen;

import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { useGameStore } from "../../state/gameStore";
import type { Ending } from "../../state/gameStore";
import { bradPhases } from "./bradPhases";
import { detectIntent, pickLine, pickReply } from "./bradLogic";
import { playJingle, pauseJingle } from "../../audio/jinglePlayer";
import { playMoneyAddedTone } from "../../audio/sounds";
import { FEATURE_FEE } from "./bradScript";
import { aiBradAvailable, askBrad } from "./bradAI";
import { liteReply, soundsLikeDistress, DISTRESS_REPLY } from "./bradLite";
import type { AiIntent, Offer } from "./bradAI";
import "./brad.css";

const ASKS_TO_CRACK = 3;
const INSULTS_TO_TRANSFER = 3;
// Hold time before each new Brad picks up: Specialist, Senior Specialist, BRAD
const HOLD_MS = [15 * 1000, 30 * 1000, 45 * 1000];
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
  const time = `${Math.floor(remaining / 60000)}:${String(Math.floor(remaining / 1000) % 60).padStart(2, "0")}`;
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
    // BRAD's broken page has no chat box, so the whole page scrolls instead
    const page = chat?.closest(".brad");
    if (page && chat && chat.scrollHeight <= chat.clientHeight + 1) {
      page.scrollTo({ top: page.scrollHeight, behavior: "smooth" });
    }
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
    }, HOLD_MS[Math.min(phaseIndex, HOLD_MS.length - 1)]);
  }

  async function respond(message: string) {
    // Real distress skips the bit entirely: no charges, no jokes
    if (soundsLikeDistress(message)) {
      setPitchOpen(false);
      setOffer(null);
      addMessage({ from: "system", text: DISTRESS_REPLY });
      return;
    }

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
      if (ai.charge) charge(FEATURE_FEE, `Plus+ feature fee from ${phase.name}`);
    } else {
      const lite = liteReply(phaseIndex, message);
      bradSays(lite.text);
      setOffer(lite.offer);
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
              {brokenPage ? "Live Support - [object Object]" : `Live Support · ${phase.name}`}
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
            <span>{brokenPage ? `TOTAL=${meters.total}` : `${meters.total}/mo`}</span>
            <span>{brokenPage ? `trial.remaining=${meters.time}` : `Trial ${meters.time}`}</span>
          </div>
        </header>

        <div ref={chatRef} className="brad-log">
          {messages.map((m, i) => (
            <div key={i} className={`bmsg is-${m.from}`}>
              {m.from === "brad" && <strong className="bmsg-name">{m.name ?? "Brad"}</strong>}
              <span>{m.text}</span>
            </div>
          ))}
          {typing && (
            <div className="bmsg is-brad is-typing">
              <strong className="bmsg-name">{phase.name}</strong>
              <span>
                {brokenPage ? "BRAD is typing... NaN%" : <><i /><i /><i /></>}
              </span>
            </div>
          )}
          {onHold && <div className="bmsg is-system is-hold">🎵 On hold…</div>}
        </div>

        <form onSubmit={handleSubmit} className="brad-form">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            // readOnly, not disabled: iOS Safari leaves a focused input that gets
            // disabled unresponsive. handleSubmit already ignores sends while busy.
            readOnly={busy}
            aria-label="Message Brad"
            placeholder={onHold ? "You're on hold…" : brokenPage ? "undefined" : "Type a message…"}
          />
          <button type="submit" disabled={busy}>
            {brokenPage ? "Submit Query" : "Send"}
          </button>
        </form>

        {brokenPage && (
          <p className="brad-footer">
            Best viewed in Netscape Navigator 4.0 at 800x600. © 1998 Subscription Plus.
            <br />
            <a href="#top" onClick={(e) => e.preventDefault()}>Return to homepage</a>
            {" | "}
            <a href="#top" onClick={(e) => e.preventDefault()}>Sign our guestbook</a>
          </p>
        )}
      </div>
    </div>
  );
}

export default BradScreen;

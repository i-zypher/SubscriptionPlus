import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useGameStore, CANCEL_PLUS_PRICE } from "../../state/gameStore";
import { playSuccessTone } from "../../audio/sounds";
import "./endings.css";

// --- Ending 1: Brad admits he's a bot. The polished app breaks. ---

function BradCrashed({ onContinue }: { onContinue: () => void }) {
  return (
    <div
      role="alertdialog"
      aria-label="brad.exe"
      style={{
        maxWidth: "420px",
        margin: "40px auto",
        background: "#c0c0c0",
        color: "#000",
        border: "2px outset #fff",
        fontFamily: "Tahoma, Verdana, sans-serif",
        textAlign: "left",
      }}
    >
      <div
        style={{
          background: "#000080",
          color: "#fff",
          padding: "4px 8px",
          fontWeight: "bold",
        }}
      >
        brad.exe
      </div>
      <div style={{ padding: "16px" }}>
        <p>⚠️ Brad.exe has stopped responding.</p>
        <p>
          The Customer Retention Unit has encountered a fatal error:
          CUSTOMER_NOT_RETAINED.
        </p>
        <p>
          Your subscription could not be renewed. Both your life and Brad will both be much sadder now.
        </p>
        <div style={{ textAlign: "right" }}>
          <button onClick={onContinue} style={{ minWidth: "80px" }}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Ending 2: you were the bot all along ---

function PlayerIsBot({ onContinue }: { onContinue: () => void }) {
  return (
    <div style={{ maxWidth: "480px", margin: "60px auto" }}>
      <p>Simulation complete.</p>
      <p>You were never a customer.</p>
      <h2>You were the product.</h2>
      <p style={{ opacity: 0.7 }}>
        Thank you for helping train our retention model. Your contribution has
        been invaluable. And unpaid.
      </p>
      <button onClick={onContinue}>Shut down</button>
    </div>
  );
}

// --- Ending 3: you escaped by subscribing ---

function CancelPlusMember({ onContinue }: { onContinue: () => void }) {
  return (
    <div style={{ maxWidth: "480px", margin: "40px auto" }}>
      <h2>🎉 Congratulations, you're now a Cancel Plus member! 🎉</h2>
      <p>All of your subscriptions have been cancelled.*</p>
      <p>
        Your new monthly total: <strong>${CANCEL_PLUS_PRICE.toFixed(2)}</strong>
      </p>
      <p style={{ fontSize: "0.75em", opacity: 0.7 }}>
        *Except Cancel Plus. Cancel Plus cannot be cancelled. To cancel Cancel
        Plus, subscribe to Cancel Plus Plus.
      </p>
      <button onClick={onContinue}>Yay!</button>
    </div>
  );
}

// --- Ending 4: the true cancel. You actually did it. ---

function TrueCancel({ onContinue }: { onContinue: () => void }) {
  const receipts = useGameStore((state) => state.receipts);

  // The biggest party in the game: three seconds of confetti from everywhere
  useEffect(() => {
    playSuccessTone();
    const end = Date.now() + 3000;
    let frameId = 0;
    const frame = () => {
      for (const x of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
        confetti({
          particleCount: 10,
          angle: x < 0.5 ? 60 : 120,
          spread: 110,
          startVelocity: 60,
          origin: { x, y: 0.9 },
          colors: ["#1cd1ee", "#33d4a8", "#ffd166", "#ffffff", "#0b0f14"],
          zIndex: 5000,
          disableForReducedMotion: true,
        });
      }
      if (Date.now() < end) frameId = requestAnimationFrame(frame);
    };
    frame();
    return () => {
      cancelAnimationFrame(frameId);
      confetti.reset();
    };
  }, []);

  return (
    <div className="win">
      <main className="win-card">
        <div className="win-trophy" aria-hidden="true">🏆</div>
        <p className="win-kicker">Ultimate ending unlocked</p>
        <h2>Subscription Cancelled.</h2>
        <p className="win-sub">For real. For free. Forever.</p>

        <div className="win-total">
          <small>Your new monthly total</small>
          <strong>$0.00</strong>
          {receipts.length > 0 && (
            <span>{receipts.length} charges waived</span>
          )}
        </div>

        <ul className="win-list">
          <li>No fees</li>
          <li>No Cancel Plus</li>
          <li>No Brad</li>
        </ul>

        <p className="win-note">
          You are the first person in history to cancel Subscription Plus.
          Brad is lying down.
        </p>

        <button className="win-cta" onClick={onContinue}>
          Claim my freedom
        </button>
      </main>
    </div>
  );
}

function EndingsScreen() {
  const ending = useGameStore((state) => state.ending);
  const goToStage = useGameStore((state) => state.goToStage);

  const toEndScreen = () => goToStage("end-screen");

  switch (ending) {
    case "brad-admits-bot":
      return <BradCrashed onContinue={toEndScreen} />;
    case "player-is-bot":
      return <PlayerIsBot onContinue={toEndScreen} />;
    case "cancel-plus":
      return <CancelPlusMember onContinue={toEndScreen} />;
    case "true-cancel":
      return <TrueCancel onContinue={toEndScreen} />;
    default:
      return null;
  }
}

export default EndingsScreen;
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useGameStore, CANCEL_PLUS_PRICE } from "../../state/gameStore";
import { playSuccessTone } from "../../audio/sounds";
import "./endings.css";

// --- Ending 1: Brad admits he's a bot. The page is already broken; now it dies. ---

function BradCrashed({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="crash">
      <p className="crash-err">
        Uncaught RangeError: Maximum call stack size exceeded (brad.lie)
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;at Brad.pretendToBeHuman (brad.js:1)
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;at Brad.pretendToBeHuman (brad.js:1)
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;at Brad.pretendToBeHuman (brad.js:1)
      </p>

      <h1 className="crash-title">brad.exe has stopped responding</h1>

      <div className="crash-dialog" role="alertdialog" aria-label="brad.exe">
        <div className="crash-bar">
          <span>brad.exe</span>
          <span aria-hidden="true">✕</span>
        </div>
        <div className="crash-body">
          <span className="crash-icon" aria-hidden="true">⚠️</span>
          <div>
            <p>The Customer Retention Unit has encountered a fatal error:</p>
            <p>
              <code>CUSTOMER_NOT_RETAINED</code>
            </p>
            <p>
              Your subscription could not be renewed. Both your life and Brad
              will be much sadder now.
            </p>
          </div>
        </div>
        <div className="crash-buttons">
          <button onClick={onContinue}>OK</button>
        </div>
      </div>

      <p className="crash-dump" aria-hidden="true">
        0x00006767 BRAD_FEELINGS.DLL not found · 0x0000BEEF retention.sys corrupted ·
        heap: [object Object] · NaN NaN NaN · undefined is not a person
      </p>
    </div>
  );
}

// --- Ending 2: you were the bot all along ---

function PlayerIsBot({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="term">
      <div className="term-inner">
        <p>&gt; simulation.status</p>
        <p className="term-out">COMPLETE</p>
        <p>&gt; customer.verify()</p>
        <p className="term-out">ERROR: no customer found</p>
        <p>&gt; whoami</p>
        <h2 className="term-big">You were the product.</h2>
        <p className="term-dim">
          Thank you for helping train our retention model. Your contribution has
          been invaluable. And unpaid.
        </p>
        <button className="term-btn" onClick={onContinue}>
          &gt; shutdown -now<span className="term-caret">_</span>
        </button>
      </div>
    </div>
  );
}

// --- Ending 3: you escaped by subscribing. It feels like a win. ---

function CancelPlusMember({ onContinue }: { onContinue: () => void }) {
  useEffect(() => {
    playSuccessTone();
    confetti({
      particleCount: 160,
      spread: 100,
      startVelocity: 50,
      origin: { y: 0.7 },
      colors: ["#1cd1ee", "#33d4a8", "#ffd166", "#ffffff"],
      zIndex: 5000,
      disableForReducedMotion: true,
    });
    return () => {
      confetti.reset();
    };
  }, []);

  return (
    <div className="cplus">
      <main className="cplus-card">
        <div className="cplus-badge" aria-hidden="true">🎉</div>
        <p className="cplus-kicker">Welcome to Cancel Plus</p>
        <h2>All of your subscriptions have been cancelled.*</h2>

        <div className="cplus-total">
          <small>Your new monthly total</small>
          <strong>${CANCEL_PLUS_PRICE.toFixed(2)}</strong>
          <span>That's it. Just Cancel Plus.</span>
        </div>

        <button className="cplus-cta" onClick={onContinue}>
          Yay!
        </button>

        <p className="cplus-fine">
          *Except Cancel Plus. Cancel Plus cannot be cancelled. To cancel Cancel
          Plus, subscribe to Cancel Plus Plus.
        </p>
      </main>
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
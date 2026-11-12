import { useGameStore, CANCEL_PLUS_PRICE } from "../../state/gameStore";

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
    default:
      return null;
  }
}

export default EndingsScreen;
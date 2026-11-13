import { useEffect } from "react";
import { useGameStore } from "../../state/gameStore";
import { jingleVersions, captchaSrc } from "../../audio/jingleVersions";
import { useSettingsStore } from "../../state/settingsStore";
import "./game-over.css";

function GameOverScreen() {
  const monthlyTotal = useGameStore((state) => state.monthlyTotal);
  const resetGame = useGameStore((state) => state.resetGame);
  const jingleVersion = useGameStore((state) => state.jingleVersion);
  const edition = jingleVersions.find((v) => v.id === jingleVersion)?.edition;

  useEffect(() => {
    if (!jingleVersion) return;
    const { masterVolume, music } = useSettingsStore.getState();
    const audio = new Audio(captchaSrc(jingleVersion));
    audio.volume = (masterVolume / 100) * (music / 100);
    audio.play().catch((err) => console.error("Jingle failed:", err));
    return () => audio.pause();
  }, [jingleVersion]);

  // You lost, so the app is delighted: a cheerful payment confirmation
  return (
    <div className="over">
      <main className="over-card">
        <div className="over-check" aria-hidden="true">
          ✓
        </div>
        <p className="over-kicker">Payment successful</p>
        <h1>Your free trial has ended.</h1>

        <div className="over-charge">
          <small>Charged to card •••• 6767</small>
          <strong>${monthlyTotal.toFixed(2)}</strong>
          <span>Thank you for your loyalty. 💳</span>
        </div>

        {edition && (
          <p className="over-jingle">
            <span aria-hidden="true">♪</span> Your jingle: {edition}
          </p>
        )}

        <button className="over-cta" onClick={resetGame}>
          Play Again
        </button>
      </main>
    </div>
  );
}

export default GameOverScreen;

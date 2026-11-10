import { useEffect } from "react";
import { useGameStore } from "../../state/gameStore";
import { jingleVersions, captchaSrc } from "../../audio/jingleVersions";
import { useSettingsStore } from "../../state/settingsStore";

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

  return (
    <div>
      <h1>Your free trial has ended.</h1>
      <p>
        Your card ending in 6767 has been charged ${monthlyTotal.toFixed(2)}.
      </p>
      <p>Thank you for your loyalty. 💳</p>
      <p>Your jingle: {edition}</p>
      <button onClick={resetGame}>Play Again</button>
    </div>
  );
}

export default GameOverScreen;
import { useGameStore } from "../../state/gameStore";
import type { Ending } from "../../state/gameStore";
import { jingleVersions } from "../../audio/jingleVersions";
import { useState } from "react";

const endingLabels: Record<Ending, string> = {
  "brad-admits-bot": "Broke Brad 🤖",
  "player-is-bot": "Accepted I'm a Bot 🤖",
  "cancel-plus": "Subscribed to Cancel Plus 💳",
  "true-cancel": "Actually Cancelled 🏆",
};
// Replace with the real link once the game is hosted
const GAME_URL = "https://subscriptionplusgame.com";

function EndScreen() {
  const monthlyTotal = useGameStore((state) => state.monthlyTotal);
  const ending = useGameStore((state) => state.ending);
  const jingleVersion = useGameStore((state) => state.jingleVersion);
  const resetGame = useGameStore((state) => state.resetGame);

  const edition = jingleVersions.find((v) => v.id === jingleVersion)?.edition;

  const [copied, setCopied] = useState(false);

  const shareText = [
    "I escaped Subscription Plus 💳",
    `Final monthly total: $${monthlyTotal.toFixed(2)}`,
    ending ? `Ending: ${endingLabels[ending]}` : "",
    edition ? `Jingle: ${edition}` : "",
    "",
    `Can you cancel? ${GAME_URL}`,
  ]
    .filter((line, i, all) => line !== "" || i === all.length - 2)
    .join("\n");

  async function handleShare() {
    // Phones: the native share sheet. Everywhere else: copy to clipboard.
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // They closed the share sheet; nothing to do
      }
      return;
    }
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ maxWidth: "480px", margin: "40px auto" }}>
      <h2>You escaped Subscription Plus.</h2>
      <p>
        Final monthly total: <strong>${monthlyTotal.toFixed(2)}</strong>
      </p>
      {ending && <p>Ending: {endingLabels[ending]}</p>}
      {edition && <p>Your jingle: {edition}</p>}
      <button onClick={handleShare}>
        {copied ? "Copied! ✅" : "Share my escape"}
      </button>
      <button onClick={resetGame}>Start a New Free Trial</button>
    </div>
  );
}

export default EndScreen;

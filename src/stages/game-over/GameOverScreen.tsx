import { useEffect } from "react";
import { useGameStore } from "../../state/gameStore";
import {
  jingleVersions,
  captchaSrc,
  ALBUM_URL,
  ALBUM_TRACKS,
} from "../../audio/jingleVersions";
import { useSettingsStore } from "../../state/settingsStore";
import "./game-over.css";
import { captionClip, CLIP_LYRIC } from "../../audio/captions";
import { isApp } from "../../platform";

function GameOverScreen() {
  const monthlyTotal = useGameStore((state) => state.monthlyTotal);
  const resetGame = useGameStore((state) => state.resetGame);
  const goToStage = useGameStore((state) => state.goToStage);
  const chargeCount = useGameStore((state) => state.receipts.length);
  const jingleVersion = useGameStore((state) => state.jingleVersion);
  const jingle = jingleVersions.find((v) => v.id === jingleVersion);

  useEffect(() => {
    if (!jingleVersion) return;
    const { masterVolume, music } = useSettingsStore.getState();
    const audio = new Audio(captchaSrc(jingleVersion));
    audio.volume = (masterVolume / 100) * (music / 100);
    audio.play().catch((err) => console.error("Jingle failed:", err));
    captionClip(CLIP_LYRIC, 9000);
    return () => audio.pause();
  }, [jingleVersion]);

  // The trial ran out. You lost, and it should feel like it.
  return (
    <div className="over">
      <main className="over-card" aria-labelledby="over-title">
        <div className="over-x" aria-hidden="true">
          ✕
        </div>
        <p className="over-kicker">Trial expired · 0:00</p>
        <h1 id="over-title">You lose.</h1>
        <p className="over-sub">
          The clock ran out before you could cancel. You are now a paying
          member of Subscription Plus. Forever.
        </p>

        <div className="over-charge">
          <small>Auto-renewed · Card •••• 6767</small>
          <strong>${monthlyTotal.toFixed(2)}</strong>
          <span>
            {chargeCount} {chargeCount === 1 ? "charge" : "charges"} · Billed
            monthly · No refunds
          </span>
        </div>

        {jingle && (
          <div className="over-jingle">
            <p>
              <span aria-hidden="true">♪</span> Your jingle: {jingle.edition}
            </p>
            <a
              href={ALBUM_URL}
              // In the apps, a plain link opens the phone's browser
              target={isApp ? undefined : "_blank"}
              rel="noopener noreferrer"
            >
              Track {jingle.track} of {ALBUM_TRACKS} on{" "}
              <em>Subscription Plus! The Album</em>
              <br />
              Download on iTunes, Amazon, or Google Play
            </a>
          </div>
        )}

        <button className="over-cta" onClick={() => goToStage("end-screen")}>
          See my receipt
        </button>
        <button className="over-retry" onClick={resetGame}>
          Try again
        </button>
      </main>
    </div>
  );
}

export default GameOverScreen;

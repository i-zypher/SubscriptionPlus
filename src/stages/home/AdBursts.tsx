import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { ads, exitAds } from "./adPopups";
import type { Ad, CloseTrick } from "./adPopups";
import { useGameStore } from "../../state/gameStore";
import { playJingle, pauseJingle } from "../../audio/jinglePlayer";
import { playFailureTone } from "../../audio/sounds";

const IDLE_STEP_MS = 30 * 1000; // 30s, then 60s, then 90s...
const MIN_ADS = 3;
const MAX_ADS = 7;
const COUNTDOWN_SECONDS = 5;
const DODGES = 3;
// While ads sit open and untouched, a new burst lands on top this often
const STACK_EVERY_MS = 30 * 1000;
// Keeps a phone from grinding to a halt if someone walks away for an hour
const MAX_ON_SCREEN = 40;

const tricks: CloseTrick[] = [
  "bottom",
  "tinyX",
  "confirmshame",
  "countdown",
  "fakeX",
  "dodge",
  "twoButtons",
  "spawner",
];
const nonSpawnerTricks = tricks.filter((t) => t !== "spawner");

type OpenAd = {
  key: number;
  ad: Ad;
  trick: CloseTrick;
  x: number; // 0–1 across the screen
  y: number; // 0–1 down the screen
};

function randomItem<T>(list: T[]) {
  return list[Math.floor(Math.random() * list.length)];
}

// Shuffle a copy and take the first few, so no ad repeats within a burst
function pickAds(count: number) {
  const shuffled = [...ads].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// --- One popup ---

const cardStyle: CSSProperties = {
  position: "fixed",
  boxSizing: "border-box",
  width: "min(340px, calc(100vw - 16px))",
  background: "#fff",
  color: "#111",
  border: "3px solid #F00AD1",
  borderRadius: "12px",
  padding: "16px",
  boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
  textAlign: "left",
};

const ctaStyle: CSSProperties = {
  display: "block",
  width: "100%",
  padding: "12px",
  fontWeight: "bold",
  fontSize: "1.1em",
  background: "#FBE602",
  color: "#111",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const linkStyle: CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  color: "#888",
  fontSize: "0.7em",
  textDecoration: "underline",
  cursor: "pointer",
};

function AdPopup({
  open,
  layer,
  onClose,
}: {
  open: OpenAd;
  layer: number;
  onClose: () => void;
}) {
  const { ad, trick } = open;
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [dodges, setDodges] = useState(0);
  const [dodgePos, setDodgePos] = useState({ right: 8, top: 8 });
  const [realContinue] = useState(() => Math.floor(Math.random() * 2));

  useEffect(() => {
    if (trick !== "countdown" || secondsLeft <= 0) return;
    const timeout = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timeout);
  }, [trick, secondsLeft]);

  function handleDodge() {
    if (dodges < DODGES) {
      setDodges((d) => d + 1);
      setDodgePos({ right: Math.random() * 80, top: Math.random() * 80 });
      return;
    }
    onClose();
  }

  // The big button never closes anything
  const cta = (
    <button style={ctaStyle} onClick={playFailureTone}>
      {ad.cta}
    </button>
  );

  const position: CSSProperties = {
    // Always fully on screen, with an 8px margin, even on a narrow phone
    left: `calc(8px + ${open.x} * max(0px, 100vw - 356px))`,
    top: `calc(8px + ${open.y} * max(0px, 100dvh - 380px))`,
    zIndex: 2000 + layer,
  };

  return (
    <div role="dialog" aria-label={ad.headline} style={{ ...cardStyle, ...position }}>
      {trick === "tinyX" && (
        <button
          aria-label="Close ad"
          onClick={onClose}
          style={{ ...linkStyle, position: "absolute", top: 4, right: 6, fontSize: "10px", textDecoration: "none", color: "#ccc" }}
        >
          ×
        </button>
      )}

      {trick === "fakeX" && (
        <span
          aria-hidden="true"
          style={{ position: "absolute", top: 6, right: 10, fontSize: "28px", fontWeight: "bold" }}
        >
          ✕
        </span>
      )}

      {trick === "countdown" && (
        secondsLeft > 0 ? (
          <span style={{ position: "absolute", top: 6, right: 10, fontSize: "0.75em", color: "#888" }}>
            You can close this ad in {secondsLeft}…
          </span>
        ) : (
          <button aria-label="Close ad" onClick={onClose} style={{ ...linkStyle, position: "absolute", top: 6, right: 10, fontSize: "18px", textDecoration: "none", color: "#111" }}>
            ✕
          </button>
        )
      )}

      {trick === "dodge" && (
        <button
          aria-label="Close ad"
          onClick={handleDodge}
          style={{ ...linkStyle, position: "absolute", top: `${dodgePos.top}%`, right: `${dodgePos.right}%`, fontSize: "18px", textDecoration: "none", color: "#111" }}
        >
          ✕
        </button>
      )}

      {trick === "spawner" && (
        <button aria-label="Close ad" onClick={onClose} style={{ ...linkStyle, position: "absolute", top: 6, right: 10, fontSize: "18px", textDecoration: "none", color: "#111" }}>
          ✕
        </button>
      )}

      <h3 style={{ marginTop: "8px", paddingRight: "40px" }}>{ad.headline}</h3>

      {trick === "bottom" ? (
        <div style={{ maxHeight: "200px", overflowY: "auto" }}>
          <p>{ad.body}</p>
          {cta}
          <p style={{ fontSize: "0.7em", color: "#888", marginTop: "200px" }}>
            Terms and conditions apply. Offer valid while subscribed. Subscribed
            while valid. See terms for terms.
          </p>
          <button style={linkStyle} onClick={onClose}>
            Close
          </button>
        </div>
      ) : (
        <>
          <p>{ad.body}</p>
          {trick === "twoButtons" ? (
            <div style={{ display: "flex", gap: "8px" }}>
              {[0, 1].map((i) => (
                <button
                  key={i}
                  style={{ ...ctaStyle, fontSize: "1em" }}
                  onClick={i === realContinue ? onClose : playFailureTone}
                >
                  Continue
                </button>
              ))}
            </div>
          ) : (
            cta
          )}
          {(trick === "confirmshame" || trick === "fakeX") && (
            <p style={{ textAlign: "center", marginBottom: 0 }}>
              <button style={linkStyle} onClick={onClose}>
                {ad.decline}
              </button>
            </p>
          )}
        </>
      )}
    </div>
  );
}

// --- Idle timer, bursts, and the jingle ---

function AdBursts({ paused }: { paused: boolean }) {
  const jingleVersion = useGameStore((state) => state.jingleVersion);
  const setMusicPaused = useGameStore((state) => state.setMusicPaused);
  const jingleIntro = useGameStore((state) => state.jingleIntro);

  const [openAds, setOpenAds] = useState<OpenAd[]>([]);
  const lastActivity = useRef(0);
  const burstCount = useRef(0);
  const nextKey = useRef(0);
  const adsShowing = openAds.length > 0;

  function makeOpenAd(ad: Ad, trick: CloseTrick): OpenAd {
    nextKey.current += 1;
    return { key: nextKey.current, ad, trick, x: Math.random(), y: Math.random() };
  }

  // Clicks, taps, key presses, and scrolling count as activity.
  // Mouse movement doesn't: a mouse jiggler or screen-saver nudge isn't engagement.
  useEffect(() => {
    lastActivity.current = Date.now();
    const mark = () => {
      lastActivity.current = Date.now();
    };
    const events = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, mark));
  }, []);

  // The idle clock starts fresh whenever the pause ends (settings closed, intro finished)
  useEffect(() => {
    if (!paused) lastActivity.current = Date.now();
  }, [paused]);

  // Check once a second whether they've been idle long enough. With the
  // screen clear, waits grow (30s, 60s, 90s…). With ads already open and
  // nobody touching anything, a fresh burst stacks on top every 30s.
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const needed = adsShowing ? STACK_EVERY_MS : IDLE_STEP_MS * (burstCount.current + 1);
      if (Date.now() - lastActivity.current < needed) return;

      if (!adsShowing) burstCount.current += 1;
      lastActivity.current = Date.now(); // the next stack waits its own 30s
      const count = MIN_ADS + Math.floor(Math.random() * (MAX_ADS - MIN_ADS + 1));
      const burst = pickAds(count).map((ad) => makeOpenAd(ad, randomItem(tricks)));
      setOpenAds((current) => [...current, ...burst].slice(-MAX_ON_SCREEN));
    }, 1000);
    return () => clearInterval(interval);
  }, [paused, adsShowing]);

  // The jingle plays while any ad is open, continuing the same song as Brad's holds.
  // If the home-screen intro is already playing it, the ads just ride along; if the
  // intro ends while ads are still open, this takes over and keeps it looping.
  useEffect(() => {
    if (!adsShowing || !jingleVersion || jingleIntro === "playing") return;
    setMusicPaused(true);
    playJingle(jingleVersion);
    return () => {
      pauseJingle();
      setMusicPaused(false);
    };
  }, [adsShowing, jingleVersion, jingleIntro, setMusicPaused]);

  // The next idle wait starts when the last ad closes
  useEffect(() => {
    if (!adsShowing) lastActivity.current = Date.now();
  }, [adsShowing]);

  function close(key: number, trick: CloseTrick) {
    setOpenAds((current) => {
      const remaining = current.filter((a) => a.key !== key);
      if (trick !== "spawner") return remaining;
      // "Wait! Before you go…" replaces it, and it's never another spawner
      return [...remaining, makeOpenAd(randomItem(exitAds), randomItem(nonSpawnerTricks))];
    });
  }

  return (
    <>
      {openAds.map((open, i) => (
        <AdPopup
          key={open.key}
          open={open}
          layer={i}
          onClose={() => close(open.key, open.trick)}
        />
      ))}
    </>
  );
}

export default AdBursts;
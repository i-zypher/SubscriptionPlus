import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import confetti from "../../fx/confetti";
import "./home.css";
import { ads, exitAds } from "./adPopups";
import type { Ad, CloseTrick } from "./adPopups";
import { useGameStore } from "../../state/gameStore";
import { playJingleOnce, pauseJingle } from "../../audio/jinglePlayer";
import {
  playFailureTone,
  playMoneyAddedTone,
  playSuccessTone,
} from "../../audio/sounds";

const FIRST_IDLE_MS = 15 * 1000; // first burst after 15s of nothing
const IDLE_STEP_MS = 30 * 1000; // then 30s, 60s, 90s...
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

// Ads are warm beige so they stand apart from the cool app on purpose,
// without burning anyone's eyes
const cardStyle: CSSProperties = {
  position: "fixed",
  boxSizing: "border-box",
  width: "min(340px, calc(100vw - 16px))",
  background: "linear-gradient(160deg, var(--ad-bg-a), var(--ad-bg-b))",
  color: "var(--ad-ink)",
  border: "1px solid var(--ad-line)",
  borderRadius: "22px",
  padding: "18px 18px 16px",
  boxShadow: "0 24px 60px -16px rgba(60, 40, 20, 0.45)",
  textAlign: "left",
  fontFamily: '"Outfit", system-ui, sans-serif',
  animation: "ad-pop 380ms cubic-bezier(0.2, 1.5, 0.4, 1) both",
};

const ctaStyle: CSSProperties = {
  display: "block",
  width: "100%",
  padding: "12px",
  fontWeight: "bold",
  fontSize: "1.1em",
  background: "linear-gradient(120deg, #ff9a5c, #f2596b)",
  color: "#fff",
  border: "none",
  borderRadius: "999px",
  cursor: "pointer",
  fontFamily: "inherit",
  boxShadow: "0 10px 22px -10px rgba(242, 89, 107, 0.9)",
};

const linkStyle: CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  color: "var(--ad-faint)",
  fontSize: "0.7em",
  fontFamily: "inherit",
  textDecoration: "underline",
  cursor: "pointer",
};

function AdPopup({
  open,
  layer,
  onClose,
  onBought,
}: {
  open: OpenAd;
  layer: number;
  onClose: () => void;
  onBought: () => void;
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

  const addToTotal = useGameStore((state) => state.addToTotal);

  // The big button never closes anything… unless the ad is selling something,
  // in which case you just bought it (and that's the easiest way out)
  function handleCta() {
    if (!ad.purchase) {
      playFailureTone();
      return;
    }
    addToTotal(ad.purchase.price, `${ad.purchase.name} (from a pop-up ad)`);
    playSuccessTone();
    playMoneyAddedTone();
    celebratePurchase();
    onBought();
  }

  const cta = (
    <button style={ctaStyle} onClick={handleCta}>
      {ad.cta}
    </button>
  );

  const position: CSSProperties = {
    // Always fully on screen, with an 8px margin, even on a narrow phone
    left: `calc(8px + ${open.x} * max(0px, 100vw - 356px))`,
    // Stays clear of the notch and home bar in the apps (unset on the web)
    top: `calc(8px + var(--sa-top, 0px) + ${open.y} * max(0px, 100dvh - 380px - var(--sa-top, 0px) - var(--sa-bottom, 0px)))`,
    zIndex: 2000 + layer,
  };

  return (
    <div
      role="dialog"
      aria-label={ad.headline}
      style={{ ...cardStyle, ...position }}
    >
      {trick === "tinyX" && (
        <button
          aria-label="Close ad"
          onClick={onClose}
          style={{
            ...linkStyle,
            position: "absolute",
            top: 4,
            right: 6,
            fontSize: "calc(10px * var(--ts, 1))",
            textDecoration: "none",
            color: "var(--ad-faintest)",
          }}
        >
          ×
        </button>
      )}

      {trick === "fakeX" && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 6,
            right: 12,
            fontSize: "calc(26px * var(--ts, 1))",
            fontWeight: "bold",
            color: "var(--ad-ink)",
          }}
        >
          ✕
        </span>
      )}

      {trick === "countdown" &&
        (secondsLeft > 0 ? (
          <span
            style={{
              position: "absolute",
              top: 10,
              right: 14,
              fontSize: "0.75em",
              color: "var(--ad-faint)",
            }}
          >
            You can close this ad in {secondsLeft}…
          </span>
        ) : (
          <button
            aria-label="Close ad"
            onClick={onClose}
            style={{
              ...linkStyle,
              position: "absolute",
              top: 6,
              right: 10,
              fontSize: "calc(18px * var(--ts, 1))",
              textDecoration: "none",
              color: "var(--ad-ink)",
            }}
          >
            ✕
          </button>
        ))}

      {trick === "dodge" && (
        <button
          aria-label="Close ad"
          onClick={handleDodge}
          style={{
            ...linkStyle,
            position: "absolute",
            top: `${dodgePos.top}%`,
            right: `${dodgePos.right}%`,
            fontSize: "calc(18px * var(--ts, 1))",
            textDecoration: "none",
            color: "var(--ad-ink)",
          }}
        >
          ✕
        </button>
      )}

      {trick === "spawner" && (
        <button
          aria-label="Close ad"
          onClick={onClose}
          style={{
            ...linkStyle,
            position: "absolute",
            top: 6,
            right: 10,
            fontSize: "calc(18px * var(--ts, 1))",
            textDecoration: "none",
            color: "var(--ad-ink)",
          }}
        >
          ✕
        </button>
      )}

      <span
        style={{
          display: "inline-block",
          padding: "2px 8px",
          borderRadius: "6px",
          background: "rgba(242, 89, 107, 0.12)",
          color: "var(--ad-tag)",
          fontSize: "calc(10px * var(--ts, 1))",
          fontWeight: 800,
          letterSpacing: "0.12em",
        }}
      >
        SPONSORED
      </span>
      <h3
        style={{
          margin: "8px 0",
          paddingRight: "40px",
          fontSize: "calc(20px * var(--ts, 1))",
          lineHeight: 1.15,
          fontWeight: 800,
          color: "var(--ad-ink)",
        }}
      >
        {ad.headline}
      </h3>

      {trick === "bottom" ? (
        <div style={{ maxHeight: "200px", overflowY: "auto" }}>
          <p
            style={{
              color: "var(--ad-muted)",
              fontSize: "calc(15px * var(--ts, 1))",
              lineHeight: 1.4,
            }}
          >
            {ad.body}
          </p>
          {cta}
          <p
            style={{ fontSize: "0.7em", color: "var(--ad-faint)", marginTop: "200px" }}
          >
            Terms and conditions apply. Offer valid while subscribed. Subscribed
            while valid. See terms for terms.
          </p>
          <button style={linkStyle} onClick={onClose}>
            Close
          </button>
        </div>
      ) : (
        <>
          <p
            style={{
              color: "var(--ad-muted)",
              fontSize: "calc(15px * var(--ts, 1))",
              lineHeight: 1.4,
            }}
          >
            {ad.body}
          </p>
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

// Every burst arrives with a party, on top of the ads
function celebrateBurst() {
  const end = Date.now() + 600;
  const frame = () => {
    for (const x of [0.1, 0.5, 0.9]) {
      confetti({
        particleCount: 18,
        spread: 100,
        startVelocity: 50,
        origin: { x, y: 0.75 },
        colors: ["#1cd1ee", "#33d4a8", "#ff9a5c", "#f2596b", "#ffffff"],
        zIndex: 5000,
        disableForReducedMotion: true,
      });
    }
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

// Buying something from an ad gets the biggest party of all
function celebratePurchase() {
  const end = Date.now() + 900;
  const frame = () => {
    for (const x of [0, 0.3, 0.5, 0.7, 1]) {
      confetti({
        particleCount: 16,
        angle: x < 0.5 ? 60 : x > 0.5 ? 120 : 90,
        spread: 100,
        startVelocity: 58,
        origin: { x, y: x === 0.5 ? 0.9 : 0.75 },
        colors: [
          "#1cd1ee",
          "#33d4a8",
          "#ff9a5c",
          "#f2596b",
          "#ffd166",
          "#ffffff",
        ],
        zIndex: 5000,
        disableForReducedMotion: true,
      });
    }
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

// --- Idle timer, bursts, and the jingle ---

function AdBursts({ paused }: { paused: boolean }) {
  const jingleVersion = useGameStore((state) => state.jingleVersion);
  const setMusicPaused = useGameStore((state) => state.setMusicPaused);

  const [openAds, setOpenAds] = useState<OpenAd[]>([]);
  const lastActivity = useRef(0);
  const burstCount = useRef(0);
  const nextKey = useRef(0);
  // Goes up with every burst (including stacks) so each one restarts the jingle
  const [burstId, setBurstId] = useState(0);
  const adJinglePlaying = useRef(false);
  const adsShowing = openAds.length > 0;

  function makeOpenAd(ad: Ad, trick: CloseTrick): OpenAd {
    nextKey.current += 1;
    return {
      key: nextKey.current,
      ad,
      trick,
      x: Math.random(),
      y: Math.random(),
    };
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
      const needed = adsShowing
        ? STACK_EVERY_MS
        : burstCount.current === 0
        ? FIRST_IDLE_MS
        : IDLE_STEP_MS * burstCount.current;
      if (Date.now() - lastActivity.current < needed) return;

      if (!adsShowing) burstCount.current += 1;
      lastActivity.current = Date.now(); // the next stack waits its own 30s
      const count =
        MIN_ADS + Math.floor(Math.random() * (MAX_ADS - MIN_ADS + 1));
      const burst = pickAds(count).map((ad) =>
        makeOpenAd(ad, randomItem(tricks))
      );
      setOpenAds((current) => [...current, ...burst].slice(-MAX_ON_SCREEN));
      setBurstId((n) => n + 1);
      celebrateBurst();
    }, 1000);
    return () => clearInterval(interval);
  }, [paused, adsShowing]);

  // Each burst plays the jingle through once, then the background music comes
  // back even if ads are still open. If the home-screen intro is already
  // playing the jingle, the ads just ride along with it.
  useEffect(() => {
    if (burstId === 0 || !jingleVersion) return;
    if (useGameStore.getState().jingleIntro === "playing") return;
    adJinglePlaying.current = true;
    setMusicPaused(true);
    playJingleOnce(jingleVersion, () => {
      adJinglePlaying.current = false;
      setMusicPaused(false);
    });
  }, [burstId, jingleVersion, setMusicPaused]);

  // Closing every ad stops the jingle early
  useEffect(() => {
    if (adsShowing || !adJinglePlaying.current) return;
    adJinglePlaying.current = false;
    pauseJingle();
    setMusicPaused(false);
  }, [adsShowing, setMusicPaused]);

  // Leaving the home screen mid-jingle
  useEffect(
    () => () => {
      if (!adJinglePlaying.current) return;
      adJinglePlaying.current = false;
      pauseJingle();
      setMusicPaused(false);
    },
    [setMusicPaused]
  );

  // The next idle wait starts when the last ad closes
  useEffect(() => {
    if (!adsShowing) lastActivity.current = Date.now();
  }, [adsShowing]);

  function close(key: number, trick: CloseTrick, bought = false) {
    if (!bought) playFailureTone(); // closing an ad is a sad moment for us
    setOpenAds((current) => {
      const remaining = current.filter((a) => a.key !== key);
      if (trick !== "spawner") return remaining;
      // "Wait! Before you go…" replaces it, and it's never another spawner
      return [
        ...remaining,
        makeOpenAd(randomItem(exitAds), randomItem(nonSpawnerTricks)),
      ];
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
          onBought={() => close(open.key, open.trick, true)}
        />
      ))}
    </>
  );
}

export default AdBursts;

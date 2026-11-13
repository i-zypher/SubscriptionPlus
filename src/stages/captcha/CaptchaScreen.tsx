import { useState, useEffect, useRef } from "react";
import type { ComponentType, FormEvent } from "react";
import { useGameStore } from "../../state/gameStore";
import { useSettingsStore } from "../../state/settingsStore";
import { captionClip, CLIP_LYRIC } from "../../audio/captions";
import { captchaSrc } from "../../audio/jingleVersions";
import {
  playSuccessTone,
  playFailureTone,
} from "../../audio/sounds";
import { spotScenes, spotImageSrc } from "./spotScenes";
import { VerifiedHumanUpsell } from "./VerifiedHumanUpsell";
import type { CaptchaProps } from "./VerifiedHumanUpsell";
import type { CaptchaId } from "./captchaPool";
import TrafficLightCaptcha from "./TrafficLightCaptcha";
import "./captcha.css";
import WobblyTextCaptcha from "./WobblyTextCaptcha";
import CookieCaptcha from "./CookieCaptcha";
import SpotTheBotCaptcha from "./SpotTheBotCaptcha";

const CHECKBOX_TAUNTS = [
  "Hmm. A human would have been faster.",
  "I thought you were human. Gonna have to try harder than that.",
  "Missed! Robots are known for their poor aim.",
  "Are you even trying? Humans try.",
  "Your cursor movements are 94% robotic.",
  "Beep boop? Just checking if you respond to that.",
  "My grandma can click a checkbox. She's a toaster.",
  "We charge either way, you know.",
];
const MIN_DODGES = 9;
const MAX_DODGES = 18;
const CLICKS_PER_TAUNT = 6;

function randomTaunt(previous: string | null) {
  const options = CHECKBOX_TAUNTS.filter((t) => t !== previous);
  return options[Math.floor(Math.random() * options.length)];
}

const AUDIO_QUESTION = "Subscription Plus! What's it do?";
const AUDIO_ANSWERS = ["it renews"];


// --- Step 1: the checkbox that runs away ---

function CheckboxCaptcha({ onPass }: CaptchaProps) {
  const [dodges, setDodges] = useState(0);
  const [checked, setChecked] = useState(false);
  const [pos, setPos] = useState({ x: 10, y: 40 });
  const [maxDodges] = useState(
    () => MIN_DODGES + Math.floor(Math.random() * (MAX_DODGES - MIN_DODGES + 1)),
  );
  const [taunt, setTaunt] = useState<string | null>(null);

  useEffect(() => {
    if (!checked) return;
    const timeout = setTimeout(onPass, 1800);
    return () => clearTimeout(timeout);
  }, [checked, onPass]);

  function handleChange() {
    if (dodges < maxDodges) {
      const next = dodges + 1;
      setDodges(next);
      if ((next - 1) % CLICKS_PER_TAUNT === 0) {
        setTaunt(randomTaunt(taunt));
      }
      setPos({ x: Math.random() * 60, y: Math.random() * 70 });
      playFailureTone();
      return;
    }
    setChecked(true);
    playSuccessTone();
  }

  return (
    <div>
      <div className="cap-arena">
        <label
          className={`cap-check${checked ? " is-checked" : ""}`}
          style={{ left: `${pos.x * 0.7}%`, top: `${pos.y * 0.8}%` }}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={checked}
          />
          <span>I'm not a robot</span>
        </label>
      </div>
      {taunt && !checked && <p className="cap-taunt">{taunt}</p>}
      {checked && <p className="cap-taunt is-good">Hmm, that was a little too human. Please continue.</p>}
    </div>
  );
}

// --- Step 2: spot the difference ---

function SpotDifferenceCaptcha({ onPass }: CaptchaProps) {
  const spotSceneId = useGameStore((state) => state.spotSceneId);
  const scene = spotScenes.find((s) => s.id === spotSceneId) ?? spotScenes[0];
  const [oddIndex, setOddIndex] = useState(() =>
    Math.floor(Math.random() * 4),
  );
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load both images before showing any, so the odd one can't give itself
  // away by popping in at a different moment
  useEffect(() => {
    const sources = [
      spotImageSrc(scene.id, false),
      spotImageSrc(scene.id, true),
    ];
    Promise.all(
      sources.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = src;
          }),
      ),
    ).then(() => setLoaded(true));
  }, [scene.id]);

  function handlePick(index: number) {
    if (index === oddIndex) {
      playSuccessTone();
      onPass();
    } else {
      playFailureTone();
      setFailed(true);
    }
  }

  if (failed) {
    return (
      <VerifiedHumanUpsell
        onRetry={() => {
          setOddIndex(Math.floor(Math.random() * 4));
          setFailed(false);
        }}
        onPass={onPass}
      />
    );
  }

  if (!loaded) {
    return <p className="cap-loading">Loading verification…</p>;
  }

  return (
    <div>
      <p>Select the image that is different.</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
          width: "100%",
          maxWidth: "960px",
          margin: "0 auto",
          padding: "0 12px",
          boxSizing: "border-box",
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            aria-label={`Image ${i + 1}`}
            onClick={() => handlePick(i)}
            style={{
              padding: 0,
              border: "2px solid #ccc",
              background: "none",
              cursor: "pointer",
            }}
          >
            <img
              src={spotImageSrc(scene.id, i === oddIndex)}
              alt=""
              draggable={false}
              style={{
                display: "block",
                width: "100%",
                aspectRatio: "16 / 9",
                objectFit: "cover",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Step 3: audio CAPTCHA (plays this run's jingle) ---

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/[^a-z]/g, "");
}

function AudioCaptcha({ onPass }: CaptchaProps) {
  const jingleVersion = useGameStore((state) => state.jingleVersion);
  const setMusicPaused = useGameStore((state) => state.setMusicPaused);
  const [guess, setGuess] = useState("");
  const [failed, setFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Background music stays off for this whole step; stop the clip and
  // bring the music back when the player leaves it
  useEffect(() => {
    setMusicPaused(true);
    return () => {
      audioRef.current?.pause();
      setMusicPaused(false);
    };
  }, [setMusicPaused]);

  function handlePlay() {
    if (!jingleVersion) return;
    audioRef.current?.pause();
    const { masterVolume, music } = useSettingsStore.getState();
    const audio = new Audio(captchaSrc(jingleVersion));
    audio.volume = (masterVolume / 100) * (music / 100);
    audio.play().catch((err) => console.error("CAPTCHA audio failed:", err));
    captionClip(CLIP_LYRIC, 6500);
    audioRef.current = audio;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const answer = normalize(guess);
    const correct =
      answer.length > 0 &&
      AUDIO_ANSWERS.some((a) => answer.includes(normalize(a)));

    if (correct) {
      audioRef.current?.pause();
      playSuccessTone();
      onPass();
    } else {
      playFailureTone();
      setFailed(true);
    }
  }

  if (failed) {
    return (
      <VerifiedHumanUpsell
        onRetry={() => {
          setGuess("");
          setFailed(false);
        }}
        onPass={onPass}
      />
    );
  }

  return (
    <div>
      <p>Press play, then answer the question.</p>
      <button type="button" className="cap-play" onClick={handlePlay}>
        <span aria-hidden="true">▶</span> Play audio
      </button>
      <p>
        <strong>{AUDIO_QUESTION}</strong>
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          aria-label={AUDIO_QUESTION}
        />
        <button type="submit">Verify</button>
      </form>
    </div>
  );
}

// --- The gauntlet ---

const captchas: Record<CaptchaId, ComponentType<CaptchaProps>> = {
  checkbox: CheckboxCaptcha,
  spotDifference: SpotDifferenceCaptcha,
  audio: AudioCaptcha,
  trafficLights: TrafficLightCaptcha,
  wobblyText: WobblyTextCaptcha,
  cookies: CookieCaptcha,
  spotTheBot: SpotTheBotCaptcha,
};

// Only used if a run somehow reaches the CAPTCHAs without a picked order
const FALLBACK_ORDER: CaptchaId[] = ["checkbox", "spotDifference", "audio"];

function CaptchaScreen() {
  const goToStage = useGameStore((state) => state.goToStage);
  const captchaLevel = useGameStore((state) => state.captchaLevel);
  const nextCaptcha = useGameStore((state) => state.nextCaptcha);
  const pickedOrder = useGameStore((state) => state.captchaOrder);
  const order = pickedOrder.length > 0 ? pickedOrder : FALLBACK_ORDER;

  const step = Math.min(captchaLevel, order.length - 1);
  const Step = captchas[order[step]];

  function handlePass() {
    if (step === order.length - 1) {
      goToStage("brad");
    } else {
      nextCaptcha();
    }
  }

  return (
    <div className="cap">
      <div className="cap-inner">
        <header className="cap-top">
          <img src={`${import.meta.env.BASE_URL}brand/logo-mark.png`} alt="" />
          <span>Security Check</span>
        </header>
        <h2>Please verify you are human to continue cancelling.</h2>
        <div className="cap-progress" aria-label={`Verification ${step + 1} of ${order.length}`}>
          {order.map((id, i) => (
            <span key={id} className={i < step ? "is-done" : i === step ? "is-now" : ""} />
          ))}
          <small>
            Verification {step + 1} of {order.length}
          </small>
        </div>

        <div className="cap-widget">
          <div className="cap-body">
            {/* key resets each step's local state when moving on */}
            <Step key={step} onPass={handlePass} />
          </div>
          <footer className="cap-foot">
            <span className="cap-icons" aria-hidden="true">
              <span>↻</span>
              <span>🎧</span>
              <span>ⓘ</span>
            </span>
            <span className="cap-brand">
              <img src={`${import.meta.env.BASE_URL}brand/logo-mark.png`} alt="" />
              <span>
                <strong>SubCAPTCHA</strong>
                <small>Privacy · Terms · Fees</small>
              </span>
            </span>
          </footer>
        </div>

        <button
          className="cap-stay"
          onClick={() => {
            goToStage("home");
            playSuccessTone();
          }}
        >
          Never mind, I'll stay 😊
        </button>
      </div>
    </div>
  );
}

export default CaptchaScreen;
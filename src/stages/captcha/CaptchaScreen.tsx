import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { useGameStore } from "../../state/gameStore";
import { useSettingsStore } from "../../state/settingsStore";
import { captchaSrc } from "../../audio/jingleVersions";
import {
  playSuccessTone,
  playFailureTone,
  playMoneyAddedTone,
} from "../../audio/sounds";
import { spotScenes, spotImageSrc } from "./spotScenes";

const VERIFIED_HUMAN_PRICE = 4.99;
const CHECKBOX_DODGES = 3;

const AUDIO_QUESTION = "Subscription Plus! What's it do?";
const AUDIO_ANSWERS = ["it renews"];

type CaptchaProps = { onPass: () => void };

// --- Shared: what you see after failing a CAPTCHA ---

function VerifiedHumanUpsell({
  onRetry,
  onPass,
}: {
  onRetry: () => void;
  onPass: () => void;
}) {
  const addToTotal = useGameStore((state) => state.addToTotal);

  function handleSkip() {
    addToTotal(VERIFIED_HUMAN_PRICE);
    playMoneyAddedTone();
    onPass();
  }

  return (
    <div>
      <p>Verification failed. That's okay, nobody's perfect!</p>
      <p>
        Skip verification forever with <strong>Verified Human+</strong>, just $
        {VERIFIED_HUMAN_PRICE}/mo.
      </p>
      <button onClick={handleSkip}>Yes! Verify me with money</button>
      <button onClick={onRetry}>No thanks, I'll prove myself</button>
    </div>
  );
}

// --- Step 1: the checkbox that runs away ---

function CheckboxCaptcha({ onPass }: CaptchaProps) {
  const [dodges, setDodges] = useState(0);
  const [checked, setChecked] = useState(false);
  const [pos, setPos] = useState({ x: 10, y: 40 });

  useEffect(() => {
    if (!checked) return;
    const timeout = setTimeout(onPass, 1800);
    return () => clearTimeout(timeout);
  }, [checked, onPass]);

  function handleChange() {
    if (dodges < CHECKBOX_DODGES) {
      setDodges((d) => d + 1);
      setPos({ x: Math.random() * 60, y: Math.random() * 70 });
      playFailureTone();
      return;
    }
    setChecked(true);
    playSuccessTone();
  }

  return (
    <div>
      <div
        style={{
          position: "relative",
          height: "160px",
          border: "1px solid #ccc",
        }}
      >
        <label
          style={{
            position: "absolute",
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            whiteSpace: "nowrap",
          }}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={checked}
          />
          I'm not a robot
        </label>
      </div>
      {checked && <p>Hmm, that was a little too human. Please continue.</p>}
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
    return <p>Loading verification…</p>;
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
      <button type="button" onClick={handlePlay}>
        🔊 Play audio
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

const steps = [CheckboxCaptcha, SpotDifferenceCaptcha, AudioCaptcha];

function CaptchaScreen() {
  const goToStage = useGameStore((state) => state.goToStage);
  const captchaLevel = useGameStore((state) => state.captchaLevel);
  const nextCaptcha = useGameStore((state) => state.nextCaptcha);

  const step = Math.min(captchaLevel, steps.length - 1);
  const Step = steps[step];

  function handlePass() {
    if (step === steps.length - 1) {
      goToStage("brad");
    } else {
      nextCaptcha();
    }
  }

  return (
    <div>
      <h2>Please verify you are human to continue cancelling.</h2>
      <p>
        Verification {step + 1} of {steps.length}
      </p>

      {/* key resets each step's local state when moving on */}
      <Step key={step} onPass={handlePass} />

      <button
        onClick={() => {
          goToStage("home");
          playSuccessTone();
        }}
      >
        Never mind, I'll stay 😊
      </button>
    </div>
  );
}

export default CaptchaScreen;
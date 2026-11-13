import { useState } from "react";
import type { FormEvent } from "react";
import { playSuccessTone, playFailureTone } from "../../audio/sounds";
import { VerifiedHumanUpsell } from "./VerifiedHumanUpsell";
import type { CaptchaProps } from "./VerifiedHumanUpsell";

// Type the squiggly word. The words are the fine print. The last one can't
// be read at all, and the only accepted answer is "I agree".

const ROUNDS = [
  { shown: "AUTORENEW", answer: "autorenew", wobble: 1 },
  { shown: "NONREFUNDABLE", answer: "nonrefundable", wobble: 1.4 },
  { shown: "ẞ¥Ꮻ₩ǂ§ЖΩ∆ҨɄ", answer: "iagree", wobble: 3 },
];

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z]/g, "");
}

// Fixed per round so the letters don't jump around while typing
function letterStyles(text: string, wobble: number) {
  return [...text].map(() => ({
    rotate: (Math.random() * 40 - 20) * wobble,
    lift: (Math.random() * 14 - 7) * wobble,
    size: 26 + Math.random() * 14,
    skew: Math.random() * 30 - 15,
  }));
}

function WobblyTextCaptcha({ onPass }: CaptchaProps) {
  const [round, setRound] = useState(0);
  const [styles, setStyles] = useState(() =>
    letterStyles(ROUNDS[0].shown, ROUNDS[0].wobble),
  );
  const [guess, setGuess] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const current = ROUNDS[round];
  const isLast = round === ROUNDS.length - 1;

  function goTo(next: number) {
    setRound(next);
    setStyles(letterStyles(ROUNDS[next].shown, ROUNDS[next].wobble));
    setGuess("");
    setHint(null);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (normalize(guess) === current.answer) {
      playSuccessTone();
      if (isLast) onPass();
      else goTo(round + 1);
      return;
    }
    playFailureTone();
    if (isLast) {
      // No upsell here, just a nudge toward the only answer we accept
      setGuess("");
      setHint("Incorrect. Hint: the answer is always “I agree.”");
    } else {
      setFailed(true);
    }
  }

  if (failed) {
    return (
      <VerifiedHumanUpsell
        onRetry={() => {
          setFailed(false);
          goTo(0);
        }}
        onPass={onPass}
      />
    );
  }

  return (
    <div>
      <p>Type the text you see below.</p>
      <div
        aria-hidden="true"
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          minHeight: "90px",
          maxWidth: "360px",
          margin: "0 auto 12px",
          padding: "10px",
          background: "repeating-linear-gradient(45deg, #eee, #eee 6px, #ddd 6px, #ddd 12px)",
          border: "1px solid #ccc",
          color: "#333",
          fontFamily: "Georgia, serif",
          overflow: "hidden",
        }}
      >
        {[...current.shown].map((char, i) => (
          <span
            key={`${round}-${i}`}
            style={{
              display: "inline-block",
              fontSize: `${styles[i].size}px`,
              transform: `translateY(${styles[i].lift}px) rotate(${styles[i].rotate}deg) skewX(${styles[i].skew}deg)`,
            }}
          >
            {char}
          </span>
        ))}
        {/* The line through the middle every CAPTCHA has */}
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            height: "2px",
            background: "#555",
            transform: "rotate(-4deg)",
          }}
        />
      </div>
      {hint && <p>{hint}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          aria-label="Type the text you see"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          style={{ fontSize: "16px" }}
        />
        <button type="submit">Verify</button>
      </form>
    </div>
  );
}

export default WobblyTextCaptcha;

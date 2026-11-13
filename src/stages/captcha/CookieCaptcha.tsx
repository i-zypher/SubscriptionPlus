import { useState, useEffect } from "react";
import { useGameStore } from "../../state/gameStore";
import {
  playSuccessTone,
  playFailureTone,
  playMoneyAddedTone,
} from "../../audio/sounds";
import type { CaptchaProps } from "./VerifiedHumanUpsell";

// "Accept All" is one tap (and costs money). Rejecting means switching off
// 40 partners one by one, and a few of them switch themselves back on.

const COOKIE_CLUB_PRICE = 2.99;
const SNEAKY_RELAPSES = 6;
const RELAPSE_MS = 2500;

const NAMED_PARTNERS = [
  "Brad's Analytics",
  "Totally Anonymous Tracking Co.",
  "Your Ex's Ad Network",
  "Legitimate Interest LLC",
  "Pixel That Watches You Sleep",
  "Cookie Monster Data Brokers",
  "Partners of Partners",
  "We Sell It Anyway Inc.",
];

const PARTNERS = [
  ...NAMED_PARTNERS,
  ...Array.from({ length: 40 - NAMED_PARTNERS.length }, (_, i) => `Trusted Partner #${i + 1}`),
].sort(() => Math.random() - 0.5);

function CookieCaptcha({ onPass }: CaptchaProps) {
  const addToTotal = useGameStore((state) => state.addToTotal);
  const [managing, setManaging] = useState(false);
  // Kept together so a relapse only counts when a switch actually flips back
  const [prefs, setPrefs] = useState(() => ({
    on: PARTNERS.map(() => true),
    relapses: 0,
  }));
  const { on, relapses } = prefs;
  const [note, setNote] = useState<string | null>(null);

  const remaining = on.filter(Boolean).length;

  // Every so often, one partner you switched off quietly switches back on
  useEffect(() => {
    if (!managing || relapses >= SNEAKY_RELAPSES) return;
    const timer = setInterval(() => {
      setPrefs((prev) => {
        const offIndexes = prev.on.flatMap((value, i) => (value ? [] : [i]));
        if (offIndexes.length === 0) return prev;
        const pick = offIndexes[Math.floor(Math.random() * offIndexes.length)];
        const next = [...prev.on];
        next[pick] = true;
        return { on: next, relapses: prev.relapses + 1 };
      });
    }, RELAPSE_MS);
    return () => clearInterval(timer);
  }, [managing, relapses]);

  function handleAcceptAll() {
    addToTotal(COOKIE_CLUB_PRICE, "Cookie Club (accepted all cookies)");
    playMoneyAddedTone();
    onPass();
  }

  function handleConfirm() {
    if (remaining > 0) {
      playFailureTone();
      setNote(`${remaining} partner${remaining === 1 ? " still has" : "s still have"} a legitimate interest in you.`);
      return;
    }
    playSuccessTone();
    onPass();
  }

  if (!managing) {
    return (
      <div
        style={{
          maxWidth: "380px",
          margin: "0 auto 12px",
          padding: "16px",
          border: "1px solid #ccc",
          borderRadius: "10px",
          textAlign: "left",
        }}
      >
        <p>
          <strong>🍪 We value your privacy</strong>
        </p>
        <p style={{ fontSize: "0.9em" }}>
          To verify you're human, we and our 40 trusted partners would like to
          store and sell everything about you. Accepting also enrolls you in{" "}
          <strong>Cookie Club</strong> (${COOKIE_CLUB_PRICE}/mo).
        </p>
        <button
          type="button"
          onClick={handleAcceptAll}
          style={{ width: "100%", padding: "12px", fontWeight: "bold" }}
        >
          Accept All
        </button>
        <p style={{ textAlign: "center", margin: "8px 0 0" }}>
          <button
            type="button"
            onClick={() => setManaging(true)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontSize: "0.75em",
              color: "#888",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Manage preferences
          </button>
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "380px", margin: "0 auto 12px", textAlign: "left" }}>
      <p>
        <strong>Manage preferences</strong> · {remaining} of {PARTNERS.length} partners on
      </p>
      <div
        style={{
          maxHeight: "260px",
          overflowY: "auto",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "4px 10px",
        }}
      >
        <label style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", opacity: 0.6 }}>
          Strictly necessary (always on)
          <input type="checkbox" checked disabled />
        </label>
        {PARTNERS.map((name, i) => (
          <label
            key={name}
            style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", gap: "8px" }}
          >
            {name}
            <input
              type="checkbox"
              checked={on[i]}
              onChange={() =>
                setPrefs((prev) => ({
                  ...prev,
                  on: prev.on.map((value, j) => (j === i ? !value : value)),
                }))
              }
            />
          </label>
        ))}
      </div>
      {note && <p>{note}</p>}
      <p style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button type="button" onClick={handleConfirm}>
          Confirm my choices
        </button>
        <button type="button" onClick={handleAcceptAll}>
          Accept All
        </button>
      </p>
    </div>
  );
}

export default CookieCaptcha;

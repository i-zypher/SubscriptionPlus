import { useState, useEffect } from "react";
import { useGameStore } from "../state/gameStore";

const QUEUE_WAIT_MS = 3 * 60 * 1000;
const QUEUE_TICK_MS = 35 * 1000;

function randomQueuePosition() {
  return 1 + Math.floor(Math.random() * 100000);
}

function ChatBubble() {
  const goToStage = useGameStore((state) => state.goToStage);

  const [open, setOpen] = useState(false);
  const [queuePosition, setQueuePosition] = useState(randomQueuePosition);

  // While the panel is open: shuffle the queue number every few seconds,
  // and send them to the CAPTCHAs after 3 minutes. Closing the panel
  // (or leaving Home) cancels this, so they lose their spot.
  useEffect(() => {
    if (!open) return;
    const tick = setInterval(() => {
      setQueuePosition(randomQueuePosition());
    }, QUEUE_TICK_MS);
    const done = setTimeout(() => {
      setOpen(false);
      goToStage("captcha");
    }, QUEUE_WAIT_MS);
    return () => {
      clearInterval(tick);
      clearTimeout(done);
    };
  }, [open, goToStage]);

  return (
    <div
      style={{
        position: "fixed",
        right: "20px",
        bottom: "20px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "10px",
        textAlign: "left",
      }}
    >
      {open && (
        <div
          role="dialog"
          aria-label="Live support"
          style={{
            width: "280px",
            maxWidth: "calc(100vw - 40px)",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            boxShadow: "var(--shadow)",
            padding: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <strong>Live Support · Brad</strong>
            <button aria-label="Close" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
          <p>🟢 Brad is online and excited to help!</p>
          <p>
            You are <strong>#{queuePosition.toLocaleString()}</strong> in line.
          </p>
          <p style={{ fontSize: "0.85em" }}>
            To protect your account, please verify you're human before
            connecting.
          </p>
        </div>
      )}

      <button
        aria-label="Open live support chat"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "none",
          background: "var(--accent)",
          color: "#fff",
          fontSize: "28px",
          cursor: "pointer",
          boxShadow: "var(--shadow)",
        }}
      >
        💬
      </button>
    </div>
  );
}

export default ChatBubble;
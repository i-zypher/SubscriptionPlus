import { useState, useEffect } from "react";
import { useGameStore } from "../state/gameStore";
import "../stages/home/home.css";

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
    <div className="chatw">
      {open && (
        <div role="dialog" aria-label="Live support" className="chatw-panel">
          <div className="chatw-head">
            <div className="chatw-avatar" aria-hidden="true">B</div>
            <div>
              <strong>Live Support · Brad</strong>
              <small>Brad is online and excited to help!</small>
            </div>
            <button className="chatw-close" aria-label="Close" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
          <div className="chatw-queue">
            <small>Your place in line</small>
            <strong>#{queuePosition.toLocaleString()}</strong>
          </div>
          <p className="chatw-note">
            To protect your account, please verify you're human before
            connecting.
          </p>
        </div>
      )}

      <button
        className="chatw-button"
        aria-label="Open live support chat"
        onClick={() => setOpen((prev) => !prev)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12Z" />
          <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
        </svg>
      </button>
    </div>
  );
}

export default ChatBubble;
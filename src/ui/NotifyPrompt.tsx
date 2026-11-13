import { useState } from "react";
import {
  enableNotifications,
  markNotificationsAsked,
  shouldAskForNotifications,
} from "../notifications";
import "./notify-prompt.css";

// Brad asks, once, whether he can send reminders (apps only). Saying yes
// brings up the phone's own permission prompt. Required to be a real choice.
function NotifyPrompt() {
  const [open, setOpen] = useState(shouldAskForNotifications);
  if (!open) return null;

  function close() {
    markNotificationsAsked();
    setOpen(false);
  }

  return (
    <div
      className="np-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="np-title"
    >
      <div className="np-card">
        <div className="np-avatar" aria-hidden="true">
          B
        </div>
        <h2 id="np-title">Can I remind you about your subscription?</h2>
        <p>You can say no. (Please don't say no.)</p>
        <button
          className="np-yes"
          onClick={() => {
            enableNotifications();
            close();
          }}
        >
          Yes, remind me
        </button>
        <button className="np-no" onClick={close}>
          No thanks
        </button>
        <small>
          A few reminders only if you stop playing. Turn them off anytime in
          Settings.
        </small>
      </div>
    </div>
  );
}

export default NotifyPrompt;

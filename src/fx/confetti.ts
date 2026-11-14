import realConfetti from "canvas-confetti";
import type { Options } from "canvas-confetti";
import { prefersLessMotion } from "../settings/applySettings";

// One full-screen confetti canvas drawn on the page itself. The library's
// default draws in a background worker, which some Android web views
// (including the app's) don't run reliably.
const cannon = realConfetti.create(undefined, {
  resize: true,
  useWorker: false,
});

// Stays quiet when Reduce Motion is on (the game's setting or the phone's).
// Our own check decides, so drop the library's separate one.
function confetti(options?: Options) {
  if (prefersLessMotion()) return null;
  return cannon({ ...options, disableForReducedMotion: false });
}
confetti.reset = () => cannon.reset();

export default confetti;

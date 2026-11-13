import realConfetti from "canvas-confetti";
import type { Options } from "canvas-confetti";
import { prefersLessMotion } from "../settings/applySettings";

// canvas-confetti, but it stays quiet when Reduce Motion is on (the game's
// setting or the phone's)
function confetti(options?: Options) {
  if (prefersLessMotion()) return null;
  return realConfetti(options);
}
confetti.reset = () => realConfetti.reset();

export default confetti;

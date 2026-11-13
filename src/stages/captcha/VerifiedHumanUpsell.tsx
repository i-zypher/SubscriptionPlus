import { useGameStore } from "../../state/gameStore";
import { playMoneyAddedTone } from "../../audio/sounds";

const VERIFIED_HUMAN_PRICE = 4.99;

export type CaptchaProps = { onPass: () => void };

// --- Shared: what you see after failing a CAPTCHA ---

export function VerifiedHumanUpsell({
  onRetry,
  onPass,
}: {
  onRetry: () => void;
  onPass: () => void;
}) {
  const addToTotal = useGameStore((state) => state.addToTotal);

  function handleSkip() {
    addToTotal(VERIFIED_HUMAN_PRICE, "Verified Human+ (failed a CAPTCHA and paid to skip it)");
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

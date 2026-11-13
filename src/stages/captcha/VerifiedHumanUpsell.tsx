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
    <div className="cap-upsell">
      <div className="cap-upsell-icon" aria-hidden="true">✕</div>
      <p className="cap-upsell-title">Verification failed.</p>
      <p>That's okay, nobody's perfect!</p>
      <div className="cap-upsell-offer">
        Skip verification forever with <strong>Verified Human+</strong>
        <span>${VERIFIED_HUMAN_PRICE}/mo</span>
      </div>
      <button className="cap-upsell-buy" onClick={handleSkip}>
        Yes! Verify me with money
      </button>
      <button className="cap-upsell-retry" onClick={onRetry}>
        No thanks, I'll prove myself
      </button>
    </div>
  );
}

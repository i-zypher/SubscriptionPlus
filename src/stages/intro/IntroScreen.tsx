import { useGameStore } from "../../state/gameStore"
import { playSuccessTone } from "../../audio/sounds"
import "./intro.css"
import { isApp } from "../../platform"
import { PRIVACY_URL } from "../../links"

function IntroScreen() {
  const goToStage = useGameStore((state) => state.goToStage)
  const startTrial = useGameStore((state) => state.startTrial)

  function handleClick() {
    startTrial()
    goToStage("avalanche")
    playSuccessTone()
  }

  return (
    <div className="intro">
      <main className="intro-card">
        <div className="intro-brand">
          <img src={`${import.meta.env.BASE_URL}brand/logo-mark.png`} alt="" />
          <div className="intro-wordmark">
            Subscription <span>Plus</span>
          </div>
        </div>

        <div className="intro-check" aria-hidden="true">✓</div>
        <h2>Thank you for your purchase!</h2>
        <p className="intro-sub">Your free trial starts now.</p>

        <section className="intro-trial">
          <div className="intro-trial-label">Free trial remaining</div>
          <div className="intro-trial-time">10:00</div>
          <div className="intro-trial-note">Cancel anytime before it ends.</div>
        </section>

        <div className="intro-card-on-file">
          <div className="intro-cc" aria-hidden="true" />
          <div className="intro-cc-text">
            <strong>Card ending in 6767</strong>
            <br />
            will be charged when your trial ends
          </div>
        </div>

        <button className="intro-cta" onClick={handleClick}>
          Start My Free Trial
        </button>

        <p className="intro-disclosure">
          Heads up: this is a parody game, and no real money is charged.
          Brad, the support agent, is an AI. What you type to him is sent to
          our AI provider (Anthropic) to write his replies, and isn't stored.
          If you report one of his replies, we keep that reply so we can
          review it. Please don't share personal information.{" "}
          <a href={PRIVACY_URL} target={isApp ? undefined : "_blank"} rel="noopener noreferrer">
            Privacy Policy
          </a>
        </p>
      </main>
    </div>
  )
}

export default IntroScreen

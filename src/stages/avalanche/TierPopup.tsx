import { useEffect, useState } from "react"
import confetti from "canvas-confetti"
import { useGameStore } from "../../state/gameStore"
import { tiers } from "./tiers"
import { playMoneyAddedTone } from "../../audio/sounds"
import "./avalanche.css"

const COLORS = ["#1cd1ee", "#33d4a8", "#ffffff", "#ffd166", "#0b0f14"]

// A little confetti at first, more every tier, and the last tier fills the
// screen for about a second
function celebrate(level: number) {
  const last = level === tiers.length - 1
  if (!last) {
    confetti({
      particleCount: [30, 70, 130, 220][level] ?? 220,
      spread: 60 + level * 25,
      startVelocity: 35 + level * 6,
      origin: { y: 0.65 },
      colors: COLORS,
      disableForReducedMotion: true,
    })
    return
  }

  const end = Date.now() + 1000
  const frame = () => {
    for (const x of [0, 0.25, 0.5, 0.75, 1]) {
      confetti({
        particleCount: 14,
        angle: x < 0.5 ? 60 : x > 0.5 ? 120 : 90,
        spread: 90,
        startVelocity: 55,
        origin: { x, y: x === 0.5 ? 0.9 : 0.7 },
        colors: COLORS,
        scalar: 1.1,
        disableForReducedMotion: true,
      })
    }
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}

function TierPopup() {
  const tierLevel = useGameStore((state) => state.tierLevel)
  const nextTier = useGameStore((state) => state.nextTier)
  const addToTotal = useGameStore((state) => state.addToTotal)
  const goToStage = useGameStore((state) => state.goToStage)
  const monthlyTotal = useGameStore((state) => state.monthlyTotal)

  const tier = tiers[tierLevel]
  // Saying no: "Are you sure?" → "Did you mean yes?" (only button: Yes)
  const [declineStep, setDeclineStep] = useState<"none" | "sure" | "meantYes">("none")

  useEffect(() => {
    celebrate(tierLevel)
  }, [tierLevel])

  // Clear any confetti still falling when the avalanche ends
  useEffect(() => () => {
    confetti.reset()
  }, [])

  function handleClick() {
    setDeclineStep("none")
    addToTotal(tier.price, tier.name)
    playMoneyAddedTone()

    if (tierLevel === tiers.length - 1) {
      goToStage("home")
    } else {
      nextTier()
    }
  }

  return (
    <div className="aval">
      <div className="aval-total" aria-live="polite">
        <span>Monthly total</span>
        <strong key={monthlyTotal}>${monthlyTotal.toFixed(2)}</strong>
      </div>

      <div className="aval-stack">
        {/* Earlier tiers peek out behind the new one */}
        {tiers.slice(0, tierLevel).map((t, i) => {
          const depth = tierLevel - i
          if (depth > 3) return null
          return (
            <div
              key={t.name}
              className="aval-ghost"
              style={{
                transform: `translateY(${-16 * depth}px) scale(${1 - 0.05 * depth})`,
                opacity: 1 - 0.25 * depth,
                zIndex: 10 - depth,
              }}
              aria-hidden="true"
            />
          )
        })}

        <main key={tierLevel} className={`aval-card aval-level-${tierLevel}`}>
          {tier.badges.length > 0 && (
            <div className="aval-badges">
              {tier.badges.map((badge, i) => (
                <span key={badge} className="aval-badge" style={{ rotate: `${(i % 2 ? 1 : -1) * (2 + i * 2)}deg` }}>
                  {badge}
                </span>
              ))}
            </div>
          )}

          {tierLevel >= 3 && (
            <div className="aval-sparkles" aria-hidden="true">
              <span>✦</span>
              <span>✧</span>
              <span>✦</span>
            </div>
          )}

          <div className="aval-step">
            Upgrade {tierLevel + 1} of {tiers.length}
          </div>
          <h2>{tier.name}</h2>

          <div className="aval-price">
            <s>${tier.wasPrice.toFixed(2)}/mo</s>
            <div>
              <strong>${tier.price.toFixed(2)}</strong>
              <span>/mo</span>
            </div>
            <em>You save ${(tier.wasPrice - tier.price).toFixed(2)}!*</em>
          </div>

          <button className="aval-cta" onClick={handleClick}>
            {tier.buttonLabel}
          </button>
          <button className="aval-decline" onClick={() => setDeclineStep("sure")}>
            {tier.declineLabel}
          </button>

          <p className="aval-fine">
            *Savings compared to a price we made up. Charges stack with your
            current plan.
          </p>
        </main>
      </div>

      {declineStep !== "none" && (
        <div className="aval-dialog-backdrop">
          <div className="aval-dialog" role="alertdialog" aria-modal="true" key={declineStep}>
            {declineStep === "sure" ? (
              <>
                <div className="aval-dialog-icon" aria-hidden="true">🥺</div>
                <h3>Are you sure you want to say no?</h3>
                <p>You'll lose access to savings you never had.</p>
                <button className="aval-dialog-yes" onClick={() => setDeclineStep("meantYes")}>
                  Yes, I'm sure
                </button>
                <button className="aval-dialog-back" onClick={() => setDeclineStep("none")}>
                  Never mind
                </button>
              </>
            ) : (
              <>
                <div className="aval-dialog-icon" aria-hidden="true">🤔</div>
                <h3>Did you mean yes?</h3>
                <p>We think you meant yes.</p>
                <button className="aval-cta" onClick={handleClick}>
                  Yes
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TierPopup

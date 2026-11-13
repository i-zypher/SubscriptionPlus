import { useGameStore } from "../../state/gameStore"
import { tiers } from "./tiers"
import {playMoneyAddedTone } from "../../audio/sounds"

function TierPopup() {
  const tierLevel = useGameStore((state) => state.tierLevel)
  const nextTier = useGameStore((state) => state.nextTier)
  const addToTotal = useGameStore((state) => state.addToTotal)
  const goToStage = useGameStore((state) => state.goToStage)

  const tier = tiers[tierLevel]

 function handleClick() {
  addToTotal(tier.price, tier.name)
  playMoneyAddedTone()

  if (tierLevel === tiers.length - 1) {
    goToStage("home")
  } else {
    nextTier()
  }
}

  return (
    <div>
      <h2>{tier.name}</h2>
      <p>${tier.price}/mo</p>
      <button onClick={handleClick}>{tier.buttonLabel}</button>
    </div>
  )
}

export default TierPopup
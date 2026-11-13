import { useGameStore } from "../../state/gameStore"
import { playSuccessTone } from "../../audio/sounds"

function IntroScreen() {
  const goToStage = useGameStore((state) => state.goToStage)
  const startTrial = useGameStore((state) => state.startTrial)

  function handleClick() {
    startTrial()
    goToStage("avalanche")
    playSuccessTone()   
  }

  return (
    <div>
      <h2>Thank you for your purchase!</h2>
      <p>Your free trial starts now.</p>
      <p> You have 10:00 minutes before it expires,
         and your card ending in 6767 will be charged,</p>
         <p> unless you cancel before the free trial ends.</p>
      <p style={{ fontSize: "0.8em", opacity: 0.75, maxWidth: "420px", margin: "16px auto" }}>
        Heads up: this is a parody game, and no real money is charged.
        Brad, the support agent, is an AI. What you type to him is sent to
        our AI provider (Anthropic) to write his replies, and isn't stored.
        Please don't share personal information.
      </p>
      <button onClick={handleClick}>Start My Free Trial</button>
    </div>
  )
}

export default IntroScreen
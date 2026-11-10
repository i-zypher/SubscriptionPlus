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
      <button onClick={handleClick}>Start My Free Trial</button>
    </div>
  )
}

export default IntroScreen
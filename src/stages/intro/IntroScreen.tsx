import { useGameStore } from "../../state/gameStore"

function IntroScreen() {
  const goToStage = useGameStore((state) => state.goToStage);

  return (
    <div>
      <h2>Thank you for your purchase!</h2>
      <p>Your free trial starts now. You have 10:00 minutes before it expires,
         and your card ending in 6767 will be charged, unless you cancel before the free trial ends.</p>
      <button onClick={() => goToStage("avalanche")}>Start My Free Trial</button>
    </div>
  )
}

export default IntroScreen
import { useGameStore } from "../../state/gameStore"
import { playSuccessTone } from "../../audio/sounds"

function CaptchaScreen() {
  const goToStage = useGameStore((state) => state.goToStage)

  return (
    <div>
      <h2>Please verify you are human to continue cancelling.</h2>
      <button onClick={() => {
        goToStage("home");
        playSuccessTone();
      }}>Never mind, I'll stay 😊</button>
    </div>
  )
}

export default CaptchaScreen
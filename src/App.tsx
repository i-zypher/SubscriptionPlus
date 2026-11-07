import { useGameStore } from "./state/gameStore"
import TierPopup from "./stages/avalanche/TierPopup"
import HomeScreen from "./stages/home/HomeScreen"
import IntroScreen from "./stages/intro/IntroScreen"
import GameOverScreen from "./stages/game-over/GameOverScreen"
import Ticker from "./ui/Ticker"
import TrialTimer from "./ui/TrialTimer"

function App() {
  const currentStage = useGameStore((state) => state.currentStage)

  return (
    <div>
      <h1>Subscription Plus</h1>

      {currentStage !== "intro" && <Ticker />}
      {currentStage !== "intro" && currentStage !== "game-over" && <TrialTimer />}

      {currentStage === "intro" && <IntroScreen />}
      {currentStage === "avalanche" && <TierPopup />}
      {currentStage === "home" && <HomeScreen />}
      {currentStage === "game-over" && <GameOverScreen />}
    </div>
  )
}

export default App
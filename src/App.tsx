import { useGameStore } from "./state/gameStore"
import TierPopup from "./stages/avalanche/TierPopup"
import HomeScreen from "./stages/home/HomeScreen"
import IntroScreen from "./stages/intro/IntroScreen"
import Ticker from "./ui/Ticker"

function App() {
  const currentStage = useGameStore((state) => state.currentStage)

  return (
    <div>
      <h1>Subscription Plus</h1>
      {currentStage !== "intro" && <Ticker />}
      {currentStage === "avalanche" && <TierPopup />}
      {currentStage === "home" && <HomeScreen />}
      {currentStage === "intro" && <IntroScreen />}
    </div>
  )
}

export default App
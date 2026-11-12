import { useGameStore } from "./state/gameStore";
import TierPopup from "./stages/avalanche/TierPopup";
import HomeScreen from "./stages/home/HomeScreen";
import IntroScreen from "./stages/intro/IntroScreen";
import GameOverScreen from "./stages/game-over/GameOverScreen";
import Ticker from "./ui/Ticker";
import TrialTimer from "./ui/TrialTimer";
import DesperationMeter from "./ui/DesperationMeter";
import CaptchaScreen from "./stages/captcha/CaptchaScreen";
import BackgroundMusic from "./audio/BackgroundMusic";
import ChatBubble from "./ui/ChatBubble";
import BradScreen from "./stages/brad/BradScreen";
import EndingsScreen from "./stages/endings/EndingsScreen";

function App() {
  const currentStage = useGameStore((state) => state.currentStage);

  return (
    <div>
      <BackgroundMusic />
      <h1>Subscription Plus</h1>

      {currentStage !== "intro" && <Ticker />}
      {currentStage === "home" && <DesperationMeter />}
      {currentStage !== "intro" && currentStage !== "game-over" && (
        <TrialTimer />
      )}
      {currentStage === "home" && <ChatBubble />}

      {currentStage === "intro" && <IntroScreen />}
      {currentStage === "avalanche" && <TierPopup />}
      {currentStage === "home" && <HomeScreen />}
      {currentStage === "game-over" && <GameOverScreen />}
      {currentStage === "captcha" && <CaptchaScreen />}
      {currentStage === "brad" && <BradScreen />}
      {currentStage === "endings" && <EndingsScreen />}
    </div>
  );
}

export default App;

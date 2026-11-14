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
import EndScreen from "./stages/end-screen/EndScreen";
import Captions from "./ui/Captions";
import NotifyPrompt from "./ui/NotifyPrompt";
import StartGate from "./stages/start/StartGate";
import { useState } from "react";

// The disclaimer is shown once per device; after that, straight to the game
const DISCLAIMER_KEY = "sp-disclaimer-seen";
function hasSeenDisclaimer() {
  try {
    return localStorage.getItem(DISCLAIMER_KEY) === "1";
  } catch {
    return false;
  }
}
function rememberDisclaimer() {
  try {
    localStorage.setItem(DISCLAIMER_KEY, "1");
  } catch {
    // private mode: they'll just see it next visit
  }
}

function App() {
  const currentStage = useGameStore((state) => state.currentStage);
  // Plain-words disclaimer first, once per device (replays skip it). Nothing
  // else mounts until then, so no music starts behind it either.
  const [readyToPlay, setReadyToPlay] = useState(hasSeenDisclaimer);

  if (!readyToPlay) return (
      <StartGate
        onPlay={() => {
          rememberDisclaimer();
          setReadyToPlay(true);
        }}
      />
    );

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
      {currentStage === "home" && <NotifyPrompt />}
      {currentStage === "game-over" && <GameOverScreen />}
      {currentStage === "captcha" && <CaptchaScreen />}
      {currentStage === "brad" && <BradScreen />}
      {currentStage === "endings" && <EndingsScreen />}
      {currentStage === "end-screen" && <EndScreen />}
      <Captions />
    </div>
  );
}

export default App;

import { create } from "zustand";
import { pickJingle } from "../audio/jingleVersions";
import { pickSpotScene } from "../stages/captcha/spotScenes";

export const TRIAL_LENGTH_MS = 10 * 60 * 1000;

export type Stage =
  | "intro"
  | "avalanche"
  | "home"
  | "captcha"
  | "brad"
  | "endings"
  | "ad-boss"
  | "end-screen"
  | "game-over";

type Ending = "brad-admits-bot" | "player-is-bot" | "cancel-plus";

type Message = {
  from: "brad" | "player";
  text: string;
};

interface GameState {
  currentStage: Stage;
  monthlyTotal: number;
  ending: Ending | null;
  trialEndsAt: number | null;
  tierLevel: number;
  desperation: number;
  captchaLevel: number;
  transferCount: number;
  adPhase: number;
  bradMode: "ai" | "lite";
  muteWaiverSigned: boolean;
  messages: Message[];
  jingleVersion: string | null;
  spotSceneId: string | null;
  musicPaused: boolean;
}

const initialState: GameState = {
  currentStage: "intro",
  monthlyTotal: 0,
  ending: null,
  trialEndsAt: null,
  tierLevel: 0,
  desperation: 0,
  captchaLevel: 0,
  transferCount: 0,
  adPhase: 0,
  bradMode: "lite",
  muteWaiverSigned: false,
  messages: [],
  jingleVersion: null,
  spotSceneId: null,
  musicPaused: false,
};

interface GameActions {
  goToStage: (stage: Stage) => void;
  addToTotal: (amount: number) => void;
  nextTier: () => void;
  addDesperation: () => void;
  nextCaptcha: () => void;
  setMusicPaused: (paused: boolean) => void;
  startTrial: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState & GameActions>()((set) => ({
  ...initialState,

  goToStage: (stage) => set({ currentStage: stage }),
  addToTotal: (amount) =>
    set((state) => ({ monthlyTotal: state.monthlyTotal + amount })),
  nextTier: () => set((state) => ({ tierLevel: state.tierLevel + 1 })),
  addDesperation: () =>
    set((state) => ({ desperation: state.desperation + 1 })),
  nextCaptcha: () =>
    set((state) => ({ captchaLevel: state.captchaLevel + 1 })),
  setMusicPaused: (paused) => set({ musicPaused: paused }),
  startTrial: () =>
    set((state) => ({
      trialEndsAt: Date.now() + TRIAL_LENGTH_MS,
      jingleVersion: pickJingle(state.jingleVersion),
      spotSceneId: pickSpotScene(state.spotSceneId),
    })),
  resetGame: () =>
    set((state) => ({
      ...initialState,
      jingleVersion: state.jingleVersion,
      spotSceneId: state.spotSceneId,
    })),
}));
import { create } from "zustand";
import { pickJingle } from "../audio/jingleVersions";
import { pickSpotScene } from "../stages/captcha/spotScenes";
import { pickCaptchas } from "../stages/captcha/captchaPool";
import type { CaptchaId } from "../stages/captcha/captchaPool";

// A random id per run so the Brad server can cap messages per player
function newRunId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const TRIAL_LENGTH_MS = 10 * 60 * 1000;
export const CANCEL_PLUS_PRICE = 9.99;


export type Stage =
  | "intro"
  | "avalanche"
  | "home"
  | "captcha"
  | "brad"
  | "endings"
  | "end-screen"
  | "game-over";

export type Ending =
  | "brad-admits-bot"
  | "player-is-bot"
  | "cancel-plus"
  | "true-cancel"
  | "timed-out";

export type Message = {
  from: "brad" | "player" | "system";
  name?: string;
  text: string;
};

interface GameState {
  currentStage: Stage;
  monthlyTotal: number;
  // What the player was charged for this run, so AI Brad can bring it up
  receipts: string[];
  ending: Ending | null;
  trialEndsAt: number | null;
  tierLevel: number;
  desperation: number;
  captchaLevel: number;
  captchaOrder: CaptchaId[];
  transferCount: number;
  bradMode: "ai" | "lite";
  runId: string;
  messages: Message[];
  jingleVersion: string | null;
  jingleIntro: "pending" | "playing" | "done";
  spotSceneId: string | null;
  musicPaused: boolean;
  // The jingle is playing (set by jinglePlayer); the hold music waits for it
  jinglePlaying: boolean;
}

const initialState: GameState = {
  currentStage: "intro",
  monthlyTotal: 0,
  receipts: [],
  ending: null,
  trialEndsAt: null,
  tierLevel: 0,
  desperation: 0,
  captchaLevel: 0,
  captchaOrder: [],
  transferCount: 0,
  bradMode: "lite",
  runId: "",
  messages: [],
  jingleVersion: null,
  jingleIntro: "pending",
  spotSceneId: null,
  musicPaused: false,
  jinglePlaying: false,
};

interface GameActions {
  goToStage: (stage: Stage) => void;
  addToTotal: (amount: number, label?: string) => void;
  nextTier: () => void;
  addDesperation: () => void;
  nextCaptcha: () => void;
  setBradMode: (mode: "ai" | "lite") => void;
  setMusicPaused: (paused: boolean) => void;
  setJingleIntro: (status: "pending" | "playing" | "done") => void;
  startTrial: () => void;
  resetGame: () => void;
  addMessage: (message: Message) => void;
  nextTransfer: () => void;
  setEnding: (ending: Ending) => void;
}



export const useGameStore = create<GameState & GameActions>()((set) => ({
  ...initialState,
    addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  nextTransfer: () =>
    set((state) => ({ transferCount: state.transferCount + 1 })),
    // Winning stops the trial clock. Cancel Plus replaces the whole bill;
    // the true cancel wipes it out.
  setEnding: (ending) =>
    set({
      ending,
      trialEndsAt: null,
      ...(ending === "cancel-plus" ? { monthlyTotal: CANCEL_PLUS_PRICE } : {}),
      ...(ending === "true-cancel" ? { monthlyTotal: 0 } : {}),
    }),

  goToStage: (stage) => set({ currentStage: stage }),
  addToTotal: (amount, label) =>
    set((state) => ({
      monthlyTotal: state.monthlyTotal + amount,
      receipts: label
        ? [...state.receipts, `${label} ($${amount.toFixed(2)})`]
        : state.receipts,
    })),
  nextTier: () => set((state) => ({ tierLevel: state.tierLevel + 1 })),
  addDesperation: () =>
    set((state) => ({ desperation: state.desperation + 1 })),
  nextCaptcha: () =>
    set((state) => ({ captchaLevel: state.captchaLevel + 1 })),
  setMusicPaused: (paused) => set({ musicPaused: paused }),
  setBradMode: (mode) => set({ bradMode: mode }),
  setJingleIntro: (status) => set({ jingleIntro: status }),
  startTrial: () =>
    set((state) => ({
      trialEndsAt: Date.now() + TRIAL_LENGTH_MS,
      jingleVersion: pickJingle(state.jingleVersion),
      spotSceneId: pickSpotScene(state.spotSceneId),
      captchaOrder: pickCaptchas(),
      runId: newRunId(),
    })),
  resetGame: () =>
    set((state) => ({
      ...initialState,
      jingleVersion: state.jingleVersion,
      spotSceneId: state.spotSceneId,
    })),
}));
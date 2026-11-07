import { create } from "zustand"

type Stage = "intro" | "avalanche" | "home" | "captcha" | "brad" | "endings" | "ad-boss" | "end-screen"

type Ending = "brad-admits-bot" | "player-is-bot" | "cancel-plus"

type Message = {
  from: "brad" | "player"
  text: string
}

interface GameState {
  currentStage: Stage
  monthlyTotal: number
  ending: Ending | null
  tierLevel: number
  desperation: number
  captchaLevel: number
  transferCount: number
  adPhase: number
  bradMode: "ai" | "lite"
  muteWaiverSigned: boolean
  messages: Message[]
}

const initialState: GameState = {
  currentStage: "intro",
  monthlyTotal: 0,
  ending: null,
  tierLevel: 0,
  desperation: 0,
  captchaLevel: 0,
  transferCount: 0,
  adPhase: 0,
  bradMode: "lite",
  muteWaiverSigned: false,
  messages: [],
}

interface GameActions {
  goToStage: (stage: Stage) => void
  addToTotal: (amount: number) => void
  nextTier: () => void
  addDesperation: () => void
}

export const useGameStore = create<GameState & GameActions>()((set) => ({
  ...initialState,

  goToStage: (stage) => set({ currentStage: stage }),
  addToTotal: (amount) => set((state) => ({ monthlyTotal: state.monthlyTotal + amount })),
  nextTier: () => set((state) => ({ tierLevel: state.tierLevel + 1})),
  addDesperation: () => set((state) => ({ desperation: state.desperation + 1 })),
}))
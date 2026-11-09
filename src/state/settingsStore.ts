import { create } from "zustand";
import { persist } from "zustand/middleware";


export type Theme = "Light" | "Dark" | "System";
export type TextSize = "Small" | "Medium" | "Large";

export type ToggleSettingKey =
  | "push"
  | "reduceMotion"
  | "highContrast"
  | "captions";
export type SliderSettingKey = "masterVolume" | "music" | "soundEffects";
export type ChoiceSettingKey = "theme" | "textSize";

interface SettingsState {
  push: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  captions: boolean;
  theme: Theme;
  textSize: TextSize;
  masterVolume: number;
  music: number;
  soundEffects: number;
}

interface SettingsActions {
  toggleSetting: (key: ToggleSettingKey) => void;
  setSlider: (key: SliderSettingKey, value: number) => void;
  setChoice: (key: ChoiceSettingKey, value: string) => void;
}

const defaultSettings: SettingsState = {
  push: false,
  reduceMotion: false,
  highContrast: false,
  captions: false,
  theme: "System",
  textSize: "Medium",
  masterVolume: 80,
  music: 80,
  soundEffects: 80,
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...defaultSettings,

      toggleSetting: (key) => set((state) => ({ [key]: !state[key] })),
      setSlider: (key, value) => set({ [key]: value }),
      setChoice: (key, value) => set({ [key]: value }),
    }),
    { name: "subscription-plus-settings" },
  ),
);

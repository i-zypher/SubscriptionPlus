export type SettingOption =
  | { kind: "toggle"; label: string; startsOn: boolean; flipMessage?: string }
  | { kind: "real-toggle"; label: string; setting: string }
  | { kind: "choice"; label: string; options: string[] }
  | { kind: "locked"; color: string }
  | { kind: "exit"; color: string }
  | { kind: "slider"; label: string; setting: string; min: number; max: number }
  | { kind: "fake-slider"; label: string; snapsBackTo: number; flipMessage?: string }

export type SettingsSection = {
  title: string
  options: SettingOption[]
}

export const settingsSections: SettingsSection[] = [
  {
    title: "Notifications",
    options: [
      { kind: "real-toggle", label: "Push Notifications", setting: "push" },
      { kind: "toggle", label: "Smoke Signals", startsOn: false, flipMessage: "Smoke signals cannot be enabled during wildfire season" },
      { kind: "toggle", label: "Moon Laser", startsOn: true, flipMessage: "Moon Laser is now set to Stun" },
      { kind: "toggle", label: "Carrier Pigeon", startsOn: true, flipMessage: "Carrier Pigeon is now set to Homing" },
    ],
  },
  {
    title: "Display",
    options: [
      { kind: "choice", label: "Theme", options: ["Light", "Dark", "System"] },
      { kind: "toggle", label: "Braille", startsOn: false, flipMessage: "Braille is available in 2036 with the advent of tactile displays" },
    ],
  },
  {
    title: "Buttons",
    options: [
      { kind: "locked", color: "#F0300A" },
      { kind: "locked", color: "#6A0AF0" },
      { kind: "locked", color: "#0AF029" },
      { kind: "locked", color: "#0A5EF0" },
      { kind: "locked", color: "#F00AD1" },
      { kind: "exit", color: "#616161" },
      { kind: "locked", color: "#F08C0A" },
      { kind: "locked", color: "#450000" },
      { kind: "locked", color: "#0ECFED" },
      { kind: "locked", color: "#FBE602" },
      { kind: "locked", color: "#39045F" },
      { kind: "locked", color: "#26A892" },
    ],
  },
  {
    title: "Accessibility",
    options: [
      { kind: "real-toggle", label: "Reduce Motion", setting: "reduceMotion" },
      { kind: "choice", label: "Text Size", options: ["Small", "Medium", "Large"] },
      { kind: "real-toggle", label: "High Contrast", setting: "highContrast" },
      { kind: "real-toggle", label: "Captions", setting: "captions" },
    ],
  },
  {
    title: "Audio",
    options: [
      { kind: "slider", label: "Master Volume", setting: "masterVolume", min: 0, max: 100 },
      { kind: "slider", label: "Music", setting: "music", min: 0, max: 100 },
      { kind: "slider", label: "Sound Effects", setting: "soundEffects", min: 0, max: 100 },
      { kind: "fake-slider", label: "Your Noisy Neighbor", snapsBackTo: 100, flipMessage: "Your Noisy Neighbor is now set to Max Disturbance" },
    ],
  },
  {
    title: "Privacy",
    options: [
      { kind: "toggle", label: "Spy Satellites", startsOn: true, flipMessage: "Spy Satellites are now set to Passive" },
      { kind: "toggle", label: "Surveillance Van", startsOn: false, flipMessage: "Surveillance Van is now set to Active" },
    ],
  },
]
import { jingleSrc } from "./jingleVersions"
import { useSettingsStore } from "../state/settingsStore"

// One jingle player for the whole run, shared by the ad bursts and Brad's
// holds, so the song always picks up where it left off.
let audio: HTMLAudioElement | null = null
let loadedVersion: string | null = null

export function playJingle(version: string) {
  // A new trial means a new version, which starts the song from the top
  if (!audio || loadedVersion !== version) {
    audio?.pause()
    audio = new Audio(jingleSrc(version))
    audio.loop = true
    loadedVersion = version
  }
  const { masterVolume, music } = useSettingsStore.getState()
  audio.volume = (masterVolume / 100) * (music / 100)
  audio.play().catch(() => {})
}

export function pauseJingle() {
  audio?.pause()
}
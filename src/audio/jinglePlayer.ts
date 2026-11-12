import { jingleSrc } from "./jingleVersions"
import { useSettingsStore } from "../state/settingsStore"
import { showJingleNowPlaying } from "./mediaSession"

// One jingle player for the whole run, shared by the home-screen intro, the ad
// bursts, and Brad's holds, so the song always picks up where it left off.
let audio: HTMLAudioElement | null = null
let loadedVersion: string | null = null
let stopWatchingEnd: (() => void) | null = null

// A new trial means a new version, which starts the song from the top
function getAudio(version: string) {
  if (!audio || loadedVersion !== version) {
    audio?.pause()
    audio = new Audio(jingleSrc(version))
    audio.loop = true
    loadedVersion = version
  }
  const { masterVolume, music } = useSettingsStore.getState()
  audio.volume = (masterVolume / 100) * (music / 100)
  return audio
}

// Loops for as long as it's playing (ad bursts, Brad's holds)
export function playJingle(version: string) {
  showJingleNowPlaying(version)
  getAudio(version).play().catch(() => {})
}

// Plays through to the end of the song once, then calls onDone (home-screen intro)
export function playJingleOnce(version: string, onDone: () => void) {
  const player = getAudio(version)
  player.loop = false

  const handleEnded = () => {
    stopWatchingEnd?.()
    onDone()
  }
  player.addEventListener("ended", handleEnded)
  stopWatchingEnd = () => {
    player.removeEventListener("ended", handleEnded)
    player.loop = true
    stopWatchingEnd = null
  }

  showJingleNowPlaying(version)
  player.play().catch(() => {})
}

export function pauseJingle() {
  stopWatchingEnd?.()
  audio?.pause()
}

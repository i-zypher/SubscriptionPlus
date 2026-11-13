import { jingleSrc } from "./jingleVersions"
import { useSettingsStore } from "../state/settingsStore"
import { showJingleNowPlaying } from "./mediaSession"
import { captionJingle } from "./captions"

// One jingle player for the whole run, shared by the home-screen intro, the ad
// bursts, and Brad's holds, so the song always picks up where it left off.
let audio: HTMLAudioElement | null = null
let loadedVersion: string | null = null
let stopWatchingEnd: (() => void) | null = null

function jingleVolume() {
  const { masterVolume, music } = useSettingsStore.getState()
  return (masterVolume / 100) * (music / 100)
}

// Volume sliders apply right away, even mid-song
useSettingsStore.subscribe(() => {
  if (audio) audio.volume = jingleVolume()
})

// A new trial means a new version, which starts the song from the top
function getAudio(version: string) {
  if (!audio || loadedVersion !== version) {
    audio?.pause()
    audio = new Audio(jingleSrc(version))
    audio.loop = true
    loadedVersion = version
  }
  audio.volume = jingleVolume()
  return audio
}

// Loops for as long as it's playing (ad bursts, Brad's holds)
export function playJingle(version: string) {
  showJingleNowPlaying(version)
  captionJingle(version)
  getAudio(version).play().catch(() => {})
}

// Plays through to the end of the song once, then calls onDone (home-screen intro)
export function playJingleOnce(version: string, onDone: () => void) {
  stopWatchingEnd?.() // a newer request replaces any older one
  const player = getAudio(version)
  player.loop = false

  const handleEnded = () => {
    stopWatchingEnd?.()
    captionJingle(null)
    onDone()
  }
  // "pause" here means the phone stopped it (media controls, switching apps),
  // since pauseJingle() stops watching before it pauses. Either way, move on.
  const endEvents = ["ended", "pause", "error"]
  endEvents.forEach((e) => player.addEventListener(e, handleEnded))
  stopWatchingEnd = () => {
    endEvents.forEach((e) => player.removeEventListener(e, handleEnded))
    player.loop = true
    stopWatchingEnd = null
  }

  showJingleNowPlaying(version)
  captionJingle(version)
  // If the browser blocks playback, skip the intro instead of waiting forever
  player.play().catch(handleEnded)
}

export function pauseJingle() {
  stopWatchingEnd?.()
  captionJingle(null)
  audio?.pause()
}

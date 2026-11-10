import { useEffect, useRef } from "react"
import { useGameStore } from "../state/gameStore"
import type { Stage } from "../state/gameStore"
import { useSettingsStore } from "../state/settingsStore"

function trackFor(stage: Stage): string | null {
  switch (stage) {
    case "avalanche":
    case "home":
    case "captcha":
      return "/audio/background.mp3"
    case "brad":
    case "endings":
      return "/audio/glitchy.mp3"
    default:
      return null
  }
}

function musicVolume(master: number, music: number) {
  return (master / 100) * (music / 100)
}

function BackgroundMusic() {
  const stage = useGameStore((state) => state.currentStage)
  const masterVolume = useSettingsStore((state) => state.masterVolume)
  const music = useSettingsStore((state) => state.music)
  const musicPaused = useGameStore((state) => state.musicPaused)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const track = trackFor(stage)

  useEffect(() => {
    if (!track) return

    const { masterVolume, music } = useSettingsStore.getState()
    const audio = new Audio(track)
    audio.loop = true
    audio.volume = musicVolume(masterVolume, music)
    if (!useGameStore.getState().musicPaused) {
      audio.play().catch(() => {})
    }
    audioRef.current = audio

    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [track])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume(masterVolume, music)
    }
  }, [masterVolume, music])

  // Pause/resume when something (like the audio CAPTCHA) needs quiet
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (musicPaused) {
      audio.pause()
    } else {
      audio.play().catch(() => {})
    }
  }, [musicPaused])

  return null
}

export default BackgroundMusic
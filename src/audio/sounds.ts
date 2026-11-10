import { useSettingsStore } from "../state/settingsStore"

let audioCtx: AudioContext | null = null

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume()
  }
  return audioCtx
}

function getEffectsVolume() {
  const { masterVolume, soundEffects } = useSettingsStore.getState()
  return (masterVolume / 100) * (soundEffects / 100)
}

type Note = { freq: number; start: number; duration: number; vol?: number }

function playNotes(notes: Note[], type: OscillatorType, peak: number, slide = 1, attack = 0.01) {
  const volume = getEffectsVolume()
  if (volume === 0) return

  const ctx = getAudioContext()

  notes.forEach(({ freq, start, duration, vol }) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(freq, start)
    if (slide !== 1) {
      osc.frequency.exponentialRampToValueAtTime(freq * slide, start + duration)
    }

    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime((vol ?? peak) * volume, start + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(start)
    osc.stop(start + duration)
  })
}

export function playSuccessTone() {
  const now = getAudioContext().currentTime
  playNotes(
    [
      { freq: 698.46, start: now, duration: 0.08 },
      { freq: 1046.5, start: now + 0.08, duration: 0.22 },
    ],
    "sine",
    0.25
  )
}

export function playFailureTone() {
  const now = getAudioContext().currentTime
  playNotes(
    [
      { freq: 160, start: now, duration: 0.11 },
      { freq: 120, start: now + 0.13, duration: 0.16 },
    ],
    "triangle",
    0.3,
    0.8
  )
}

export function playMoneyAddedTone() {
  const now = getAudioContext().currentTime

  playNotes(
    [
      { freq: 659.25, start: now, duration: 0.08, vol: 0.15 },
      { freq: 830.61, start: now + 0.06, duration: 0.08, vol: 0.2 },
      { freq: 1174.66, start: now + 0.12, duration: 0.22, vol: 0.25 },
    ],
    "sine",
    0.25,
    1,
    0.008
  )

  playNotes(
    [{ freq: 2400, start: now, duration: 0.02 }],
    "triangle",
    0.08,
    800 / 2400,
    0.002
  )
}
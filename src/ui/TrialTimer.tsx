import { useState, useEffect } from "react"
import { useGameStore } from "../state/gameStore"

function TrialTimer() {
  const trialEndsAt = useGameStore((state) => state.trialEndsAt)
  const goToStage = useGameStore((state) => state.goToStage)
  const setEnding = useGameStore((state) => state.setEnding)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (trialEndsAt !== null && now >= trialEndsAt) {
      // Running out the clock is an ending too: it gets a receipt
      setEnding("timed-out")
      goToStage("game-over")
    }
  }, [now, trialEndsAt, goToStage, setEnding])

  if (trialEndsAt === null) return null

  const remaining = trialEndsAt - now
  const minutes = Math.floor(remaining / 60000)
  const seconds = String(Math.floor(remaining / 1000) % 60).padStart(2, "0")

  return (
    <p>Free trial ends in {minutes}:{seconds}</p>
  )
}

export default TrialTimer
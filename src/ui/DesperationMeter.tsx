import { useGameStore } from "../state/gameStore"
import { desperationHints, DESPERATION_MAX } from "../stages/home/desperationHints"
import "../stages/home/home.css"

function DesperationMeter() {
  const desperation = useGameStore((state) => state.desperation)

  if (desperation === 0) return null

  const percent = Math.min(desperation / DESPERATION_MAX, 1) * 100
  const unlocked = desperationHints.filter((hint) => hint.at <= desperation)
  const latestHint = unlocked.at(-1)

  return (
    <div className="desp">
      <small>Desperation</small>
      <div className="desp-bar">
        <div style={{ width: `${percent}%` }} />
      </div>
      {latestHint && <p>{latestHint.text}</p>}
    </div>
  )
}

export default DesperationMeter
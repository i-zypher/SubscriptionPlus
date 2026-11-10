import { useGameStore } from "../state/gameStore"
import { desperationHints, DESPERATION_MAX } from "../stages/home/desperationHints"

function DesperationMeter() {
  const desperation = useGameStore((state) => state.desperation)

  if (desperation === 0) return null

  const percent = Math.min(desperation / DESPERATION_MAX, 1) * 100
  const unlocked = desperationHints.filter((hint) => hint.at <= desperation)
  const latestHint = unlocked.at(-1)

  return (
    <div
      style={{
        position: "fixed",
        bottom: "16px",
        left: "16px",
        width: "260px",
        padding: "12px",
        background: "#222",
        borderRadius: "12px",
        textAlign: "left",
      }}
    >
      <p>Desperation</p>
      <div style={{ height: "8px", background: "#444", borderRadius: "4px" }}>
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: "#F0300A",
            borderRadius: "4px",
          }}
        />
      </div>
      {latestHint && <p>{latestHint.text}</p>}
    </div>
  )
}

export default DesperationMeter
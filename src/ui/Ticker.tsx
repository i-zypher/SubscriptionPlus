import { useGameStore } from "../state/gameStore"

function Ticker() {
  const monthlyTotal = useGameStore((state) => state.monthlyTotal)

  return (
    <div>
      <p>Monthly Total: ${monthlyTotal.toFixed(2)}</p>
    </div>
  )
}

export default Ticker
import { useGameStore } from "../../state/gameStore"

function GameOverScreen() {
  const monthlyTotal = useGameStore((state) => state.monthlyTotal)
  const resetGame = useGameStore((state) => state.resetGame)

  return (
    <div>
      <h1>Your free trial has ended.</h1>
      <p>Your card ending in 6767 has been charged ${monthlyTotal.toFixed(2)}.</p>
      <p>Thank you for your loyalty. 💳</p>
      <button onClick={resetGame}>Play Again</button>
    </div>
  )
}

export default GameOverScreen
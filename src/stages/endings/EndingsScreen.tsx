import { useGameStore } from "../../state/gameStore"

function EndingsScreen() {
  const ending = useGameStore((state) => state.ending)
  return <h2>Ending reached: {ending ?? "none"}</h2>
}


export default EndingsScreen
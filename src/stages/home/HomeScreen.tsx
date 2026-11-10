import { useState, useEffect } from "react"
import { perks, affirmations, libraryRows } from "./homeContent"
import { TRIAL_LENGTH_MS } from "../../state/gameStore"
import SettingsScreen from "./SettingsScreen"


const totalCharacters = affirmations.join("").length
const msPerCharacter = TRIAL_LENGTH_MS / totalCharacters

function Affirmations() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const duration = affirmations[index].length * msPerCharacter

    const timeout = setTimeout(() => {
      setIndex((current) => (current + 1) % affirmations.length)
    }, duration)

    return () => clearTimeout(timeout)
  }, [index])

  return (
    <div>
      <h3>Affirmation of the Day</h3>
      <p>{affirmations[index]}</p>
    </div>
  )
}

function ContentLibrary() {
  return (
    <div>
      <h3>Your Subscription Library</h3>
      {libraryRows.map((row) => (
        <div key={row.title}>
          <h4>{row.title}</h4>
          {row.tiles.map((tile, i) => (
            <span key={i}>{tile}</span>
          ))}
        </div>
      ))}
    </div>
  )
}

function HomeScreen() {
  const [showSettings, setShowSettings] = useState(false)

  if (showSettings) {
    return <SettingsScreen onClose={() => setShowSettings(false)} />
  }

  return (
    <div>
      <h2>Welcome Home, Valued Subscriber!</h2>
      <button onClick={() => setShowSettings(true)}>⚙️ Settings</button>

      <Affirmations />

      <h3>Your Subscription Perks</h3>
      <ul style={{ listStylePosition: "inside" }}>
        {perks.map((perk) => (
          <li key={perk}>{perk}</li>
        ))}
      </ul>

      <ContentLibrary />
    </div>
  )
}

export default HomeScreen
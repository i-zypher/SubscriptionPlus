import { useState, useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import { perks, affirmations, libraryRows } from "./homeContent";
import { TRIAL_LENGTH_MS, useGameStore } from "../../state/gameStore";
import SettingsScreen from "./SettingsScreen";
import AdBursts from "./AdBursts";
import JingleIntro from "./JingleIntro";

const totalCharacters = affirmations.join("").length;
const msPerCharacter = TRIAL_LENGTH_MS / totalCharacters;

const ERRANT_CLICKS_PER_DESPERATION = 5;

function Affirmations() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const duration = affirmations[index].length * msPerCharacter;

    const timeout = setTimeout(() => {
      setIndex((current) => (current + 1) % affirmations.length);
    }, duration);

    return () => clearTimeout(timeout);
  }, [index]);

  return (
    <div>
      <h3>Affirmation of the Day</h3>
      <p>{affirmations[index]}</p>
    </div>
  );
}

function ContentLibrary() {
  return (
    <div>
      <h3>Your Subscription Library</h3>
      <p>Explore your subscription content below:</p>
      {libraryRows.map((row) => (
        <div key={row.title}>
          <h4>{row.title}</h4>
          {row.tiles.map((tile, i) => (
            <span key={i}>{tile}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

function HomeScreen() {
  const [showSettings, setShowSettings] = useState(false);
  const addDesperation = useGameStore((state) => state.addDesperation);
  const errantClicks = useRef(0);

  function handleErrantClick(e: MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    // Clicks on real controls don't count as errant
    if (target.closest("button, a, input, label, select, textarea")) return;

    errantClicks.current += 1;
    if (errantClicks.current % ERRANT_CLICKS_PER_DESPERATION === 0) {
      addDesperation();
    }
  }

  return (
    <>
      {/* Home stays mounted while Settings is open, just hidden,
          so the affirmation rotation keeps its place */}
      <div hidden={showSettings} onClick={handleErrantClick}>
        <h2>Welcome Home, Valued Subscriber!</h2>
        <button
          onClick={() => setShowSettings(true)}
          aria-label="Menu"
          style={{
            background: "none",
            border: "none",
            padding: "8px",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: "block",
                width: "26px",
                height: "3px",
                borderRadius: "2px",
                background: "currentColor",
              }}
            />
          ))}
        </button>

        <Affirmations />

        <h3>Your Subscription Perks</h3>
        <ul style={{ listStylePosition: "inside" }}>
          {perks.map((perk) => (
            <li key={perk}>{perk}</li>
          ))}
        </ul>

        <ContentLibrary />
      </div>

      <JingleIntro />
      <AdBursts paused={showSettings} />

      {showSettings && (
        <SettingsScreen onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}

export default HomeScreen;
import { useState, useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import { perks, affirmations, libraryRows } from "./homeContent";
import { TRIAL_LENGTH_MS, useGameStore } from "../../state/gameStore";
import SettingsScreen from "./SettingsScreen";
import AdBursts from "./AdBursts";
import JingleIntro from "./JingleIntro";
import "./home.css";

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
    <section className="home-card">
      <p className="home-label">Affirmation of the Day</p>
      <p key={index} className="home-affirm">
        {affirmations[index]}
      </p>
    </section>
  );
}

function ContentLibrary() {
  return (
    <section className="home-card">
      <p className="home-label">Your Subscription Library</p>
      <h3>Explore your subscription content</h3>
      {libraryRows.map((row) => (
        <div key={row.title} className="home-row">
          <h4>{row.title}</h4>
          <div className="home-tiles">
            {row.tiles.map((tile, i) => (
              <div
                key={i}
                className={`home-tile${tile.includes("Loading") ? " is-loading" : ""}`}
              >
                {tile}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

// The two chips at the top: what you owe, and how long until it counts
function StatusChips() {
  const monthlyTotal = useGameStore((state) => state.monthlyTotal);
  const trialEndsAt = useGameStore((state) => state.trialEndsAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const remaining = Math.max(0, (trialEndsAt ?? now) - now);
  const minutes = Math.floor(remaining / 60000);
  const seconds = String(Math.floor(remaining / 1000) % 60).padStart(2, "0");

  return (
    <div className="home-status">
      <div className="home-chip">
        <small>Monthly total</small>
        <strong>${monthlyTotal.toFixed(2)}</strong>
      </div>
      <div className={`home-chip is-trial${remaining < 60000 ? " is-urgent" : ""}`}>
        <small>Free trial ends in</small>
        <strong>
          {minutes}:{seconds}
        </strong>
      </div>
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
      <div className="home" hidden={showSettings} onClick={handleErrantClick}>
        <div className="home-inner">
          <header className="home-top">
            <div className="home-logo">
              <img src={`${import.meta.env.BASE_URL}brand/logo-mark.png`} alt="" />
              <div>
                Subscription <span>Plus</span>
              </div>
            </div>
            <button
              className="home-menu"
              onClick={() => setShowSettings(true)}
              aria-label="Menu"
            >
              <span />
              <span />
              <span />
            </button>
          </header>

          <StatusChips />

          <section className="home-hero">
            <span className="home-member">Founding Lifetime Member</span>
            <h2>Welcome Home, Valued Subscriber!</h2>
            <p>Member since just now. Member until forever.</p>
          </section>

          <Affirmations />

          <section className="home-card">
            <p className="home-label">Your Subscription Perks</p>
            <ul className="home-perks">
              {perks.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
          </section>

          <ContentLibrary />
        </div>
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
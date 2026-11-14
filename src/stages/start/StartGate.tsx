import "./start.css";
import { isApp } from "../../platform";
import { PRIVACY_URL, TERMS_URL } from "../../links";

// The one screen that isn't part of the joke. Players were pausing at the
// "Card ending in 6767" screen, worried a real card would be charged, so
// the game now starts here, in plain words, before anything else.
function StartGate({ onPlay }: { onPlay: () => void }) {
  const linkTarget = isApp ? undefined : "_blank";
  return (
    <div className="start">
      <main className="start-card" aria-labelledby="start-title">
        <img
          className="start-logo"
          src={`${import.meta.env.BASE_URL}brand/logo-mark.png`}
          alt=""
        />
        <h1 id="start-title">Before you play</h1>
        <p className="start-lede">
          Subscription Plus is a <strong>parody game</strong> about
          subscriptions you can't cancel. It's going to try very hard to make
          you think you're being charged. You aren't.
        </p>

        <ul className="start-list">
          <li>
            <span aria-hidden="true">💳</span>
            <div>
              <strong>No real money, ever.</strong> Every charge, price and
              plan in the game is fake. The card ending in 6767 isn't yours, or
              anyone's.
            </div>
          </li>
          <li>
            <span aria-hidden="true">🔒</span>
            <div>
              <strong>Nothing to enter.</strong> The game never asks for a
              card, an account or any payment details.
            </div>
          </li>
          <li>
            <span aria-hidden="true">🤖</span>
            <div>
              <strong>Brad is an AI.</strong> What you type to him is sent to
              Anthropic to write his replies and isn't stored. Please don't
              share personal information.
            </div>
          </li>
        </ul>

        <button className="start-cta" onClick={onPlay}>
          Let's play
        </button>

        <p className="start-links">
          Best with sound on ·{" "}
          <a href={PRIVACY_URL} target={linkTarget} rel="noopener noreferrer">
            Privacy
          </a>{" "}
          ·{" "}
          <a href={TERMS_URL} target={linkTarget} rel="noopener noreferrer">
            Terms
          </a>
        </p>
      </main>
    </div>
  );
}

export default StartGate;

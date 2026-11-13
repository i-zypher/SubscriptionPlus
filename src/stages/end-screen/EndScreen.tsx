import { useGameStore } from "../../state/gameStore";
import type { Ending } from "../../state/gameStore";
import { jingleVersions } from "../../audio/jingleVersions";
import { useState } from "react";
import "./receipt.css";

// Receipt lines are saved as "Name (details) ($4.99)"
function parseReceipt(line: string) {
  const match = line.match(/^(.*) \(\$([\d.,]+)\)$/);
  if (!match) return { name: line, amount: null as number | null };
  return { name: shortName(match[1]), amount: Number(match[2].replace(/,/g, "")) };
}

// Tier names are whole congratulations speeches; a receipt just wants the plan
function shortName(name: string) {
  if (/^Congratulations, you're subscribed!?$/i.test(name)) return "Subscription Plus (base plan)";
  const trimmed = name.replace(
    /^Congratulations, (You're now a |You have now joined |You now have |You're now )/i,
    "",
  );
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

const money = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const endingLabels: Record<Ending, string> = {
  "brad-admits-bot": "Broke Brad 🤖",
  "player-is-bot": "Accepted I'm a Bot 🤖",
  "cancel-plus": "Subscribed to Cancel Plus 💳",
  "true-cancel": "Actually Cancelled 🏆",
};
// Replace with the real link once the game is hosted
const GAME_URL = "https://subscriptionplusgame.com";

function EndScreen() {
  const monthlyTotal = useGameStore((state) => state.monthlyTotal);
  const ending = useGameStore((state) => state.ending);
  const jingleVersion = useGameStore((state) => state.jingleVersion);
  const resetGame = useGameStore((state) => state.resetGame);
  const receipts = useGameStore((state) => state.receipts);
  const runId = useGameStore((state) => state.runId);
  const [printedAt] = useState(() => new Date());

  const edition = jingleVersions.find((v) => v.id === jingleVersion)?.edition;

  const [copied, setCopied] = useState(false);

  const shareText = [
    "I escaped Subscription Plus 💳",
    `Final monthly total: $${monthlyTotal.toFixed(2)} (${receipts.length} charges)`,
    ending ? `Ending: ${endingLabels[ending]}` : "",
    edition ? `Jingle: ${edition}` : "",
    "",
    `Can you cancel? ${GAME_URL}`,
  ]
    .filter((line, i, all) => line !== "" || i === all.length - 2)
    .join("\n");

  async function handleShare() {
    // Phones: the native share sheet. Everywhere else: copy to clipboard.
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // They closed the share sheet; nothing to do
      }
      return;
    }
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const items = receipts.map(parseReceipt);
  const subtotal = items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const adjustment = monthlyTotal - subtotal;
  const cancelled = ending === "true-cancel";
  const orderNumber = (runId || "000000").replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase();

  return (
    <div className="rcpt-page">
      <div className="rcpt-wrap">
        <article className={`rcpt${cancelled ? " is-cancelled" : ""}`} aria-label="Your receipt">
          <header className="rcpt-head">
            <img src={`${import.meta.env.BASE_URL}brand/logo-mark.png`} alt="" />
            <h2>SUBSCRIPTION PLUS</h2>
            <p>Customer copy · Keep for your records forever</p>
            <p>
              {printedAt.toLocaleDateString()} {printedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              {"  ·  "}Order #{orderNumber}
            </p>
            <p>Card •••• 6767</p>
          </header>

          <div className="rcpt-rule" />

          <ul className="rcpt-items">
            {items.length === 0 && (
              <li>
                <span>Nothing! (somehow)</span>
                <span>{money(0)}</span>
              </li>
            )}
            {items.map((item, i) => (
              <li key={i}>
                <span>{item.name}</span>
                <span>{item.amount === null ? "" : money(item.amount)}</span>
              </li>
            ))}
            {Math.abs(adjustment) >= 0.01 && (
              <li className="rcpt-adjust">
                <span>
                  {ending === "cancel-plus"
                    ? "Cancel Plus (replaces everything above, forever)"
                    : cancelled
                      ? "Cancelled by BRAD (he needs to lie down)"
                      : "Adjustments we don't have to explain"}
                </span>
                <span>{adjustment < 0 ? `-${money(-adjustment)}` : money(adjustment)}</span>
              </li>
            )}
          </ul>

          <div className="rcpt-rule" />

          <div className="rcpt-total">
            <span>MONTHLY TOTAL</span>
            <strong>{money(monthlyTotal)}</strong>
          </div>
          <p className="rcpt-renews">
            {cancelled ? "NOTHING RENEWS. YOU ARE FREE." : "Renews automatically. Forever."}
          </p>

          {cancelled && <div className="rcpt-stamp">CANCELLED</div>}

          <div className="rcpt-rule" />

          <dl className="rcpt-meta">
            {ending && (
              <>
                <dt>Ending</dt>
                <dd>{endingLabels[ending]}</dd>
              </>
            )}
            {edition && (
              <>
                <dt>Your jingle</dt>
                <dd>{edition}</dd>
              </>
            )}
            <dt>Charges</dt>
            <dd>{items.length}</dd>
          </dl>

          <div className="rcpt-barcode" aria-hidden="true" />
          <p className="rcpt-thanks">
            THANK YOU FOR YOUR LOYALTY
            <br />
            No refunds · No returns · No escape
          </p>
        </article>

        <div className="rcpt-actions">
          <button className="rcpt-share" onClick={handleShare}>
            {copied ? "Copied! ✅" : "Share my receipt"}
          </button>
          <button className="rcpt-again" onClick={resetGame}>
            Start a New Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}

export default EndScreen;

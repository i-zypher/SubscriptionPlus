import { useGameStore } from "../../state/gameStore";
import type { Ending } from "../../state/gameStore";
import { jingleVersions, ALBUM_TRACKS } from "../../audio/jingleVersions";
import { useState, useEffect, useRef } from "react";
import { toBlob } from "html-to-image";
import { Share } from "@capacitor/share";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { isApp } from "../../platform";
import "./receipt.css";

// Receipt lines are saved as "Name (details) ($4.99)"
function parseReceipt(line: string) {
  const match = line.match(/^(.*) \(\$([\d.,]+)\)$/);
  if (!match) return { name: line, amount: null as number | null };
  return {
    name: shortName(match[1]),
    amount: Number(match[2].replace(/,/g, "")),
  };
}

// Tier names are whole congratulations speeches; a receipt just wants the plan
function shortName(name: string) {
  if (/^Congratulations, you're subscribed!?$/i.test(name))
    return "Subscription Plus (base plan)";
  const trimmed = name.replace(
    /^Congratulations, (You're now a |You have now joined |You now have |You're now )/i,
    ""
  );
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

const money = (n: number) =>
  `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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

  const jingle = jingleVersions.find((v) => v.id === jingleVersion);
  const edition = jingle?.edition;

  const [copied, setCopied] = useState(false);

  const shareText = [
    "I escaped Subscription Plus 💳",
    `Final monthly total: $${monthlyTotal.toFixed(2)} (${
      receipts.length
    } charges)`,
    ending ? `Ending: ${endingLabels[ending]}` : "",
    edition ? `Jingle: ${edition}` : "",
    "",
    `Can you cancel? ${GAME_URL}`,
  ]
    .filter((line, i, all) => line !== "" || i === all.length - 2)
    .join("\n");

  // The receipt as a picture, made ahead of time so the share sheet opens
  // straight from the tap (iPhones refuse to share after a slow await).
  // The Share button waits until it's ready, so nobody gets text only.
  const shotRef = useRef<HTMLDivElement | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [picture, setPicture] = useState<"making" | "ready" | "failed">(
    "making"
  );

  useEffect(() => {
    let alive = true;

    async function makePicture() {
      const node = shotRef.current;
      if (!node) throw new Error("receipt not on screen");
      node.classList.add("is-capturing");
      try {
        await document.fonts.ready;
        const blob = await toBlob(node, {
          pixelRatio: 2,
          cacheBust: true,
          style: { margin: "0" },
        });
        if (!blob) throw new Error("no picture");
        return new File([blob], "subscription-plus-receipt.png", {
          type: "image/png",
        });
      } finally {
        node.classList.remove("is-capturing");
      }
    }

    // Wait for the print and stamp animations, then make it. Give up after
    // 10 seconds so a slow phone still gets a working (text) Share button.
    const start = setTimeout(() => {
      const giveUp = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("too slow")), 10000)
      );
      Promise.race([makePicture(), giveUp])
        .then((file) => {
          if (!alive) return;
          setReceiptFile(file);
          setPicture("ready");
        })
        .catch((err) => {
          console.error("Receipt picture failed:", err);
          if (alive) setPicture("failed");
        });
    }, 2200);

    return () => {
      alive = false;
      clearTimeout(start);
    };
  }, []);

  // In the apps: save the picture to the app's cache and open the phone's
  // own share sheet with it (the in-app browser can't share files itself)
  async function shareInApp() {
    try {
      if (receiptFile) {
        const data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(",")[1]);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(receiptFile);
        });
        const { uri } = await Filesystem.writeFile({
          path: receiptFile.name,
          data,
          directory: Directory.Cache,
        });
        await Share.share({ text: shareText, files: [uri] });
      } else {
        await Share.share({ text: shareText });
      }
    } catch {
      // They closed the share sheet
    }
  }

  async function handleShare() {
    if (isApp) return shareInApp();
    const files = receiptFile ? [receiptFile] : [];

    // Phones: the share sheet, with the picture when the phone supports it
    if (navigator.share) {
      const withPicture = files.length > 0 && navigator.canShare?.({ files });
      try {
        await navigator.share(
          withPicture ? { files, text: shareText } : { text: shareText }
        );
      } catch (err) {
        // Closing the share sheet is fine. Anything else: try text only.
        if (withPicture && (err as Error).name !== "AbortError") {
          try {
            await navigator.share({ text: shareText });
          } catch {
            // Closed it again
          }
        }
      }
      return;
    }

    // Computers: save the picture and copy the text
    if (receiptFile) {
      const url = URL.createObjectURL(receiptFile);
      const link = document.createElement("a");
      link.href = url;
      link.download = receiptFile.name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // Clipboard blocked; the picture still saved
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const items = receipts.map(parseReceipt);
  const subtotal = items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const adjustment = monthlyTotal - subtotal;
  const cancelled = ending === "true-cancel";
  const orderNumber = (runId || "000000")
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 8)
    .toUpperCase();

  return (
    <div className="rcpt-page">
      <div className="rcpt-wrap">
        <div className="rcpt-shot" ref={shotRef}>
          <article
            className={`rcpt${cancelled ? " is-cancelled" : ""}`}
            aria-label="Your receipt"
          >
            <header className="rcpt-head">
              <img
                src={`${import.meta.env.BASE_URL}brand/logo-mark.png`}
                alt=""
              />
              <h2>SUBSCRIPTION PLUS</h2>
              <p>Customer copy · Keep for your records forever</p>
              <p>
                {printedAt.toLocaleDateString()}{" "}
                {printedAt.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
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
                  <span>
                    {adjustment < 0
                      ? `-${money(-adjustment)}`
                      : money(adjustment)}
                  </span>
                </li>
              )}
            </ul>

            <div className="rcpt-rule" />

            <div className="rcpt-total">
              <span>MONTHLY TOTAL</span>
              <strong>{money(monthlyTotal)}</strong>
            </div>
            <p className="rcpt-renews">
              {cancelled
                ? "NOTHING RENEWS. YOU ARE FREE."
                : "Renews automatically. Forever."}
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
                  <dd>
                    {edition}
                    <small className="rcpt-album">
                      Track {jingle?.track}/{ALBUM_TRACKS} · Now on iTunes,
                      Amazon &amp; Google Play
                    </small>
                  </dd>
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
            {ending === "cancel-plus" && (
              <p className="rcpt-fine">
                Cancel Plus can only be removed by BRAD.
              </p>
            )}
          </article>
          <p className="rcpt-url">
            Can you cancel? <strong>subscriptionplusgame.com</strong>
          </p>
        </div>

        <div className="rcpt-actions">
          <button
            className="rcpt-share"
            onClick={handleShare}
            disabled={picture === "making"}
          >
            {picture === "making"
              ? "Printing your copy…"
              : copied
              ? receiptFile
                ? "Saved + text copied ✅"
                : "Copied! ✅"
              : "Share my receipt"}
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

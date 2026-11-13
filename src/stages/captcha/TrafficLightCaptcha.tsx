import { useState } from "react";
import { playSuccessTone, playFailureTone } from "../../audio/sounds";
import { VerifiedHumanUpsell } from "./VerifiedHumanUpsell";
import type { CaptchaProps } from "./VerifiedHumanUpsell";

// Three rounds of "select all squares with…". Getting round one right
// just earns a "Please try again." Round three is hidden fees: every square.

// "either" = a photo where you could argue it both ways (tiny bikes in the
// background), so selecting it or not are both fine
type Tile = { label: string; emoji?: string; image?: string; match: boolean | "either" };

const STREET = [
  { label: "Car", emoji: "🚗" },
  { label: "Tree", emoji: "🌳" },
  { label: "House", emoji: "🏠" },
  { label: "Bus", emoji: "🚌" },
  { label: "Dog", emoji: "🐕" },
  { label: "Cone", emoji: "🚧" },
  { label: "Stop sign", emoji: "🛑" },
  { label: "Mailbox", emoji: "📮" },
];

const FEES = [
  "Service fee",
  "Convenience fee",
  "Processing fee",
  "Paper billing fee",
  "Paperless billing fee",
  "Fee fee",
  "Loyalty fee",
  "Cancellation fee",
  "Fee for reading this",
];

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function streetGrid(target: { label: string; emoji: string }): Tile[] {
  const matches = 3 + Math.floor(Math.random() * 2); // 3 or 4
  const others = shuffle(STREET)
    .slice(0, 9 - matches)
    .map((t) => ({ ...t, match: false }));
  const hits = Array.from({ length: matches }, () => ({ ...target, match: true }));
  return shuffle([...others, ...hits]);
}

// Real photos for the bicycles round (public/captcha-tiles/bicycles/)
const BIKE_PHOTOS = [
  { file: "mountain-bike", label: "Bicycle against a brick wall" },
  { file: "old-bike", label: "Penny-farthing" },
  { file: "recumbent-bike", label: "Recumbent bike" },
  { file: "tightrope-bike", label: "Bicycle on a tightrope over a canyon" },
  { file: "street-bike", label: "Cyclist in a bike lane" },
  { file: "tandem-bike", label: "Tandem bicycle in a park" },
];
const OTHER_PHOTOS: { file: string; label: string; match: false | "either" }[] = [
  { file: "city-bus", label: "City bus", match: false },
  { file: "city-street-2", label: "City avenue", match: false },
  { file: "crosswalk", label: "Crosswalk full of people", match: false },
  { file: "yellow-cab", label: "Yellow taxi", match: false },
  // Two bikes parked far in the background. Does that count? Either way.
  { file: "city-street-1", label: "Street with parked cars", match: "either" },
];

function photo(file: string) {
  return `${import.meta.env.BASE_URL}captcha-tiles/bicycles/${file}.jpg`;
}

function bicycleGrid(): Tile[] {
  const bikeCount = 4 + Math.floor(Math.random() * 3); // 4 to 6
  const bikes = shuffle(BIKE_PHOTOS)
    .slice(0, bikeCount)
    .map((p) => ({ label: p.label, image: photo(p.file), match: true }));
  const others = shuffle(OTHER_PHOTOS)
    .slice(0, 9 - bikeCount)
    .map((p) => ({ label: p.label, image: photo(p.file), match: p.match }));
  return shuffle([...bikes, ...others]);
}

const ROUNDS = [
  {
    prompt: "Select all squares with traffic lights",
    build: () => streetGrid({ label: "Traffic light", emoji: "🚦" }),
  },
  {
    prompt: "Select all squares with bicycles",
    build: bicycleGrid,
  },
  {
    prompt: "Select all squares with hidden fees",
    build: (): Tile[] =>
      shuffle(FEES).map((label) => ({ label, emoji: "💸", match: true })),
  },
];

function TrafficLightCaptcha({ onPass }: CaptchaProps) {
  const [round, setRound] = useState(0);
  const [tiles, setTiles] = useState(() => ROUNDS[0].build());
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [note, setNote] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  function startRound(next: number, message: string | null) {
    setRound(next);
    setTiles(ROUNDS[next].build());
    setPicked(new Set());
    setNote(message);
  }

  function toggle(index: number) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleVerify() {
    const correct = tiles.every(
      (tile, i) => tile.match === "either" || tile.match === picked.has(i),
    );

    if (correct && round === ROUNDS.length - 1) {
      playSuccessTone();
      onPass();
    } else if (correct) {
      // Right answer, wrong vibe
      playFailureTone();
      startRound(round + 1, "Please try again.");
    } else if (round === ROUNDS.length - 1) {
      playFailureTone();
      setNote("You missed some. (They were all hidden fees.)");
      setFailed(true);
    } else {
      playFailureTone();
      setFailed(true);
    }
  }

  if (failed) {
    return (
      <div>
        {note && <p>{note}</p>}
        <VerifiedHumanUpsell
          onRetry={() => {
            setFailed(false);
            startRound(0, null);
          }}
          onPass={onPass}
        />
      </div>
    );
  }

  return (
    <div>
      {note && <p>{note}</p>}
      <p>
        <strong>{ROUNDS[round].prompt}</strong>
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "6px",
          maxWidth: "360px",
          margin: "0 auto 12px",
        }}
      >
        {tiles.map((tile, i) => (
          <button
            key={`${round}-${i}`}
            type="button"
            aria-pressed={picked.has(i)}
            aria-label={tile.label}
            onClick={() => toggle(i)}
            style={{
              aspectRatio: "1",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              padding: "4px",
              border: picked.has(i) ? "4px solid #1a73e8" : "1px solid #ccc",
              background: picked.has(i) ? "#e8f0fe" : "#fff",
              color: "#222",
              cursor: "pointer",
            }}
          >
            {tile.image ? (
              <img
                src={tile.image}
                alt=""
                draggable={false}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <span style={{ fontSize: "32px" }}>{tile.emoji}</span>
            )}
            {round === ROUNDS.length - 1 && (
              <span style={{ fontSize: "11px", lineHeight: 1.2 }}>{tile.label}</span>
            )}
          </button>
        ))}
      </div>
      <button type="button" onClick={handleVerify}>
        Verify
      </button>
    </div>
  );
}

export default TrafficLightCaptcha;

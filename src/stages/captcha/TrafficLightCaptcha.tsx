import { useState } from "react";
import { playSuccessTone, playFailureTone } from "../../audio/sounds";
import { VerifiedHumanUpsell } from "./VerifiedHumanUpsell";
import type { CaptchaProps } from "./VerifiedHumanUpsell";

// Two rounds of "select all squares with…": one photo set (bicycles, parks
// or traffic lights, picked per run), then hidden fees. Getting the photo
// round right just earns a "Please try again." Hidden fees: every square.

// "either" = a photo you could argue both ways (something tiny in the
// background), so selecting it or not are both fine
type Tile = { label: string; emoji?: string; image?: string; match: boolean | "either" };
type Photo = { file: string; label: string };
type PhotoSet = {
  prompt: string;
  hits: Photo[];
  misses: (Photo & { either?: boolean })[];
};

// Wrong answers every set can use (public/captcha-tiles/filler/)
const FILLER: Photo[] = [
  { file: "filler/emergency-room", label: "Emergency room" },
  { file: "filler/impossible-stairs", label: "Impossible staircase" },
  { file: "filler/vulture", label: "Vulture on a fence post" },
  { file: "filler/marble-bust", label: "Marble bust" },
  { file: "filler/leaf-pile", label: "Jumping into a leaf pile" },
  { file: "filler/purple-bird", label: "Purple bird" },
];

// Files live in public/captcha-tiles/<folder>/<name>.jpg. Each set mixes the
// shared filler with photos borrowed from the other sets.
const PHOTO_SETS: PhotoSet[] = [
  {
    prompt: "Select all squares with bicycles",
    hits: [
      { file: "bicycles/mountain-bike", label: "Bicycle against a brick wall" },
      { file: "bicycles/old-bike", label: "Penny-farthing" },
      { file: "bicycles/recumbent-bike", label: "Recumbent bike" },
      { file: "bicycles/tightrope-bike", label: "Bicycle on a tightrope over a canyon" },
      { file: "bicycles/street-bike", label: "Cyclist in a bike lane" },
      { file: "bicycles/tandem-bike", label: "Tandem bicycle in a park" },
    ],
    misses: [
      { file: "bicycles/city-bus", label: "City bus" },
      { file: "bicycles/city-street-2", label: "City avenue" },
      { file: "bicycles/crosswalk", label: "Crosswalk full of people" },
      { file: "bicycles/yellow-cab", label: "Yellow taxi" },
      { file: "parks/parking-lot", label: "Parking lot" },
      { file: "parks/water-park", label: "Water park" },
      { file: "traffic-lights/old-west", label: "Old West street" },
      ...FILLER,
      { file: "filler/old-map", label: "Old city map" },
      { file: "filler/city-skyline", label: "City skyline" },
      // Two bikes parked far in the background. Does that count? Either way.
      { file: "bicycles/city-street-1", label: "Street with parked cars", either: true },
    ],
  },
  {
    prompt: "Select all squares with parks",
    hits: [
      { file: "parks/city-park", label: "City park" },
      { file: "parks/hiking-trail", label: "Mountain trail" },
      { file: "parks/skate-park", label: "Skate park" },
      { file: "parks/ballpark", label: "Ballpark" },
      { file: "parks/parking-lot", label: "Parking lot" },
      { file: "parks/amusement-park", label: "Amusement park" },
      { file: "parks/water-park", label: "Water park" },
    ],
    misses: [
      { file: "bicycles/city-bus", label: "City bus" },
      { file: "bicycles/yellow-cab", label: "Yellow taxi" },
      { file: "bicycles/crosswalk", label: "Crosswalk full of people" },
      { file: "bicycles/recumbent-bike", label: "Recumbent bike" },
      { file: "bicycles/old-bike", label: "Penny-farthing" },
      { file: "traffic-lights/too-many-lights", label: "Street full of traffic lights" },
      { file: "traffic-lights/stop-sign", label: "Stop sign" },
      { file: "traffic-lights/old-west", label: "Old West street" },
      ...FILLER,
      // Parks drawn on a map, and a little green park in the skyline: either way
      { file: "filler/old-map", label: "Old city map", either: true },
      { file: "filler/city-skyline", label: "City skyline", either: true },
    ],
  },
  {
    prompt: "Select all squares with traffic lights",
    hits: [
      { file: "traffic-lights/signal-pole", label: "Overloaded signal pole" },
      { file: "traffic-lights/old-west", label: "Old West street" },
      { file: "traffic-lights/too-many-lights", label: "Street full of traffic lights" },
      { file: "traffic-lights/avenue-lights", label: "Avenue with traffic lights" },
      { file: "traffic-lights/green-light", label: "Green traffic light" },
    ],
    misses: [
      { file: "parks/hiking-trail", label: "Mountain trail" },
      { file: "parks/skate-park", label: "Skate park" },
      { file: "parks/ballpark", label: "Ballpark" },
      { file: "parks/parking-lot", label: "Parking lot" },
      { file: "parks/water-park", label: "Water park" },
      { file: "parks/city-park", label: "City park" },
      { file: "bicycles/old-bike", label: "Penny-farthing" },
      { file: "bicycles/tandem-bike", label: "Tandem bicycle in a park" },
      ...FILLER,
      { file: "filler/old-map", label: "Old city map" },
      // Too far away to tell if there are traffic lights down there
      { file: "filler/city-skyline", label: "City skyline", either: true },
      // Traffic lights far down the street behind the stop sign
      { file: "traffic-lights/stop-sign", label: "Stop sign", either: true },
    ],
  },
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

function photoSrc(file: string) {
  return `${import.meta.env.BASE_URL}captcha-tiles/${file}.jpg`;
}

function photoGrid(set: PhotoSet): Tile[] {
  const hitCount = 4 + Math.floor(Math.random() * 2); // 4 or 5
  const hits = shuffle(set.hits)
    .slice(0, hitCount)
    .map((p) => ({ label: p.label, image: photoSrc(p.file), match: true }));
  const misses = shuffle(set.misses)
    .slice(0, 9 - hitCount)
    .map((p) => ({
      label: p.label,
      image: photoSrc(p.file),
      match: p.either ? ("either" as const) : false,
    }));
  return shuffle([...hits, ...misses]);
}

// Never the same photo set twice in a row
let lastSet: PhotoSet | null = null;
function pickPhotoSet() {
  const options = PHOTO_SETS.filter((set) => set !== lastSet);
  lastSet = options[Math.floor(Math.random() * options.length)];
  return lastSet;
}

type Round = { prompt: string; build: () => Tile[] };

function buildRounds(): Round[] {
  const set = pickPhotoSet();
  return [
    { prompt: set.prompt, build: () => photoGrid(set) },
    {
      prompt: "Select all squares with hidden fees",
      build: () => shuffle(FEES).map((label) => ({ label, emoji: "💸", match: true })),
    },
  ];
}

function TrafficLightCaptcha({ onPass }: CaptchaProps) {
  const [rounds] = useState(buildRounds);
  const [round, setRound] = useState(0);
  const [tiles, setTiles] = useState(() => rounds[0].build());
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [note, setNote] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  function startRound(next: number, message: string | null) {
    setRound(next);
    setTiles(rounds[next].build());
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

    if (correct && round === rounds.length - 1) {
      playSuccessTone();
      onPass();
    } else if (correct) {
      // Right answer, wrong vibe
      playFailureTone();
      startRound(round + 1, "Please try again.");
    } else if (round === rounds.length - 1) {
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
        <strong>{rounds[round].prompt}</strong>
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
            {round === rounds.length - 1 && (
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

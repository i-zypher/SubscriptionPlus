// Spot the Bot scenes. Files live in public/spotbot/<id>.jpg
// Each bot is a box in percent of the image (x, y = top-left corner).
// Tapping any bot in the scene counts, so the mall (2) and call center (3) are easier.
export type BotBox = { x: number; y: number; w: number; h: number };
export type SpotTheBotScene = { id: string; name: string; bots: BotBox[] };

export const spotTheBotScenes: SpotTheBotScene[] = [
  { id: "mall", name: "at the mall", bots: [{ x: 74.2, y: 67.3, w: 4.9, h: 20.5 }, { x: 79.1, y: 72.0, w: 4.1, h: 18.9 }] },
  { id: "callcenter", name: "in the call center", bots: [{ x: 65.6, y: 11.5, w: 3.1, h: 11.1 }, { x: 47.4, y: 68.8, w: 4.2, h: 11.1 }, { x: 63.4, y: 89.6, w: 4.3, h: 9.4 }] },
  { id: "blackfriday", name: "at the Black Friday sale", bots: [{ x: 81.1, y: 2.5, w: 3.8, h: 14.5 }] },
  { id: "dmv", name: "at the DMV", bots: [{ x: 28.8, y: 48.0, w: 5.6, h: 17.9 }] },
  { id: "stadium", name: "at the stadium", bots: [{ x: 84.5, y: 50.8, w: 5.7, h: 17.8 }] },
  { id: "airport", name: "at the airport", bots: [{ x: 89.2, y: 49.7, w: 4.3, h: 17.0 }] },
  { id: "subway", name: "on the subway platform", bots: [{ x: 8.9, y: 60.5, w: 6.0, h: 17.0 }] },
  { id: "beach", name: "at the beach", bots: [{ x: 50.9, y: 50.4, w: 3.9, h: 12.5 }] },
];

export function spotTheBotSrc(id: string) {
  return `${import.meta.env.BASE_URL}spotbot/${id}.jpg`;
}

// Never the same scene twice in a row
let lastSceneId: string | null = null;
export function pickSpotTheBotScene() {
  const options = spotTheBotScenes.filter((scene) => scene.id !== lastSceneId);
  const scene = options[Math.floor(Math.random() * options.length)];
  lastSceneId = scene.id;
  return scene;
}

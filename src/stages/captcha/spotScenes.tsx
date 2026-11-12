// Each scene is a pair of images: the normal one, and a copy with one tiny change.
// Files live in public/spot/  →  <id>-a.jpeg (normal) and <id>-b.jpeg (different)
export type SpotScene = {
  id: string;
};

export const spotScenes: SpotScene[] = [
  { id: "livingroom" },
  { id: "kitchen" },
  { id: "desk" },
  { id: "park" },
];

export function spotImageSrc(id: string, odd: boolean) {
  return `${import.meta.env.BASE_URL}spot/${id}-${odd ? "b" : "a"}.jpeg`;
}

// Same idea as pickJingle: never repeat last run's scene
export function pickSpotScene(previous: string | null) {
  const options = spotScenes.filter((scene) => scene.id !== previous);
  const index = Math.floor(Math.random() * options.length);
  return options[index].id;
}

// Each scene is a pair of images: the normal one, and a copy with one tiny change.
// Files live in public/spot/  →  <id>-a.png (normal) and <id>-b.png (different)
export type SpotScene = {
  id: string
}

export const spotScenes: SpotScene[] = [
  { id: "living-room" },
  { id: "kitchen" },
  { id: "desk" },
  { id: "park" },
]

export function spotImageSrc(id: string, odd: boolean) {
     return `/spot/${id}-${odd ? "b" : "a"}.jpg`
}

// Same idea as pickJingle: never repeat last run's scene
export function pickSpotScene(previous: string | null) {
  const options = spotScenes.filter((scene) => scene.id !== previous)
  const index = Math.floor(Math.random() * options.length)
  return options[index].id
}
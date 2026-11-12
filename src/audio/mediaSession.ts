import { jingleVersions } from "./jingleVersions"

// What the phone's lock screen / notification media controls show
function showNowPlaying(title: string, artist: string) {
  if (!("mediaSession" in navigator)) return
  navigator.mediaSession.metadata = new MediaMetadata({
    title,
    artist,
    album: "Subscription Plus™",
    artwork: [{ src: `${import.meta.env.BASE_URL}media-art.png`, sizes: "512x512", type: "image/png" }],
  })
}

export function showJingleNowPlaying(versionId: string) {
  const edition = jingleVersions.find((version) => version.id === versionId)?.edition ?? "Classic Edition"
  showNowPlaying(`Subscription Plus™ Jingle — ${edition}`, "Your Free Trial Is Playing")
}

export function showMusicNowPlaying(track: string) {
  const title = track.endsWith("glitchy.mp3")
    ? "Customer Support Hold Music (Your Call Is Important)"
    : "Subscription Plus™ Lobby Music (Ad-Supported)"
  showNowPlaying(title, "Your Free Trial Is Playing")
}

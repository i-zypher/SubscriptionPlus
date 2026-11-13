export type JingleVersion = {
  id: string;
  edition: string;
  track: number; // its track number on the real album
};

// Subscription Plus! The Album: every edition is a real track
export const ALBUM_URL =
  "https://distrokid.com/hyperfollow/natemiller2/subscription-plus-the-album";
export const ALBUM_TRACKS = 8;

export const jingleVersions: JingleVersion[] = [
  {
    id: "original",
    edition: "Classic Edition (Now with Auto-Renew)",
    track: 1,
  },
  { id: "ballad", edition: "Emotional Support Edition", track: 5 },
  { id: "polka", edition: "Oktober-Renew-Fest Edition", track: 4 },
  { id: "bluegrass", edition: "The Moonshine Membership Edition", track: 2 },
  { id: "death-metal", edition: "Premium Plus Ultra Doom", track: 3 },
  { id: "acapella", edition: "Vocals-Only Lite Plan", track: 6 },
];

export function jingleSrc(id: string) {
  return `${import.meta.env.BASE_URL}audio/jingle-${id}.mp3`;
}

export function captchaSrc(id: string) {
  return `${import.meta.env.BASE_URL}audio/captcha-${id}.mp3`;
}
export function pickJingle(previous: string | null) {
  const options = jingleVersions.filter((version) => version.id !== previous);
  const index = Math.floor(Math.random() * options.length);
  return options[index].id;
}

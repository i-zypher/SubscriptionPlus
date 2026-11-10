export type JingleVersion = {
  id: string
  edition: string
}

export const jingleVersions: JingleVersion[] = [
  { id: "original", edition: "Classic Edition (Now With Auto-Renew)" },
  { id: "ballad", edition: "Emotional Support Edition" },
  { id: "polka", edition: "Oktober-Renew-Fest Edition" },
  { id: "bluegrass", edition: "The Moonshine Membership Edition" },
  { id: "death-metal", edition: "Premium Plus Ultra Doom" },
  { id: "acapella", edition: "Vocals-Only Lite Plan" },
]

export function jingleSrc(id: string) {
  return `/audio/jingle-${id}.mp3`
}

export function captchaSrc(id: string) {
  return `/audio/captcha-${id}.mp3`
}

export function pickJingle(previous: string | null) {
  const options = jingleVersions.filter((version) => version.id !== previous)
  const index = Math.floor(Math.random() * options.length)
  return options[index].id
}
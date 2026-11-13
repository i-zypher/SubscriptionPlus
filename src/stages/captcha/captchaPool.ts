// Every run gets a random handful of CAPTCHAs. The checkbox always opens.
export type CaptchaId =
  | "checkbox"
  | "spotDifference"
  | "audio"
  | "trafficLights"
  | "wobblyText"
  | "cookies"
  | "spotTheBot";

export const CAPTCHAS_PER_RUN = 4;

const OPTIONAL: CaptchaId[] = [
  "spotDifference",
  "audio",
  "trafficLights",
  "wobblyText",
  "cookies",
  "spotTheBot",
];

export function pickCaptchas(): CaptchaId[] {
  const shuffled = [...OPTIONAL].sort(() => Math.random() - 0.5);
  return ["checkbox", ...shuffled.slice(0, CAPTCHAS_PER_RUN - 1)];
}

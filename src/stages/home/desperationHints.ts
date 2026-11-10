export type DesperationHint = {
  at: number
  text: string
}

export const desperationHints: DesperationHint[] = [
  { at: 3, text: "Hints are a Plus feature 😊 Cancellation is free!" },
  { at: 6, text: "Our support team is standing by! (Average wait: forever)" },
  { at: 10, text: "Not every button needs to be colorful." },
  { at: 15, text: "It's the gray one. Please don't press the gray one. 🥺" },
]

export const DESPERATION_MAX = 15
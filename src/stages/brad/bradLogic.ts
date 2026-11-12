import { intentKeywords, bradReplies, chargedReplies, FEATURE_FEE } from "./bradScript"
import type { Intent } from "./bradScript"

// Checked in this order. "I'm a bot" must win over "are you a bot",
// and "yes" comes last so "yes, cancel it" still counts as cancel.
const intentOrder: Exclude<Intent, "other">[] = [
  "iAmBot",
  "askBot",
  "insult",
  "transfer",
  "cancel",
  "yes",
]

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// Whole words only, so "ok" doesn't match "book"
function mentions(text: string, keyword: string) {
  return new RegExp(`\\b${escapeRegex(keyword)}\\b`).test(text)
}

export function detectIntent(message: string): Intent {
  const text = message.toLowerCase().replace(/’/g, "'")
  for (const intent of intentOrder) {
    if (intentKeywords[intent].some((keyword) => mentions(text, keyword))) {
      return intent
    }
  }
  return "other"
}

export function pickReply(intent: Intent) {
  const lines = bradReplies[intent]
  return lines[Math.floor(Math.random() * lines.length)]
}

export function pickOtherReply() {
  const plain = bradReplies.other
  const i = Math.floor(Math.random() * (plain.length + chargedReplies.length))

  if (i < plain.length) {
    return { text: plain[i], charge: 0 }
  }

  const line = chargedReplies[i - plain.length]
  return {
    text: line.replaceAll("{fee}", `$${FEATURE_FEE.toFixed(2)}`),
    charge: FEATURE_FEE,
  }
}
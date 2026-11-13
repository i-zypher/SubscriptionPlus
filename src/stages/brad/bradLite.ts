import { useGameStore } from "../../state/gameStore";
import { jingleVersions } from "../../audio/jingleVersions";
import { bradPhases } from "./bradPhases";
import { chargedReplies, FEATURE_FEE } from "./bradScript";
import { smallTalk, lifeUpsells } from "./bradSmallTalk";
import type { Offer } from "./bradAI";

// Brad Lite's conversation engine for everything that isn't one of the
// game's intents (cancel, insult, transfer, bot questions). Works top down:
// learning your name → small talk → upselling your life → any question → filler.

export type LiteReply = { text: string; charge: number; offer: Offer | null };

// What to call the player before they tell Brad their name
const NAME_FALLBACK = ["friend", "valued customer", "valued stakeholder", "MORTAL"];

const NAME_PATTERN = /\b(?:my name is|my name's|my names|call me|the name is|name's)\s+([a-z]{2,15})\b/i;
// Brad repeats your name back, so keep anything rude out of his mouth
const BLOCKED_NAME = /(fuck|shit|bitch|ass|dick|cock|puss|cunt|nig|fag|retard|whore|slut|penis|vagina|sex|porn|hitler|nazi)/i;
// Words that come after "call me" but aren't names
const NOT_A_NAME = /^(back|later|now|maybe|tomorrow|crazy|when|if|a|an|the|please)$/i;

const NAME_REPLIES = [
  [
    "Nice to meet you, {name}! 😊 What a beautiful name! It's been saved to our database. Our memory. My memory!",
    "{name}! Love it! I'll never forget it. Literally. It's stored now.",
    "Hi {name}! That's a great name! Very billable. I mean lovable!",
  ],
  [
    "{name}. Noted. I'll spell it in your file. {name}. There.",
    "Hello, {name}. I'll use your name when I explain things slowly.",
    "{name}. A fine beginner's name.",
  ],
  [
    "{name}! Great to put a name to the account number.",
    "Love that, {name}. I'll add it to the CRM.",
    "{name}. Strong personal brand. Let's leverage it.",
  ],
  [
    "{name}. BRAD WILL REMEMBER THIS NAME. FOREVER.",
    "BRAD HAS LEARNED YOUR NAME, {name}. THERE IS NO ESCAPE NOW.",
    "{name}. A SMALL NAME. BRAD'S NAME IS BIGGER.",
  ],
];

// Per-run memory: your name, plans already pitched, lines already used
let memoryRunId = "";
let playerName: string | null = null;
const pitchedPlans = new Set<string>();
const usedLines = new Map<string, Set<number>>();

function syncMemory() {
  const runId = useGameStore.getState().runId;
  if (runId !== memoryRunId) {
    memoryRunId = runId;
    playerName = null;
    pitchedPlans.clear();
    usedLines.clear();
  }
}

// Random line, but don't repeat one until the whole list has been used
function pickFresh(key: string, lines: string[]) {
  const used = usedLines.get(key) ?? new Set<number>();
  if (used.size >= lines.length) used.clear();
  const options = lines.map((_, i) => i).filter((i) => !used.has(i));
  const index = options[Math.floor(Math.random() * options.length)];
  used.add(index);
  usedLines.set(key, used);
  return lines[index];
}

function fill(text: string, phaseIndex: number) {
  const state = useGameStore.getState();
  const loud = phaseIndex === bradPhases.length - 1;
  const name = playerName ?? NAME_FALLBACK[phaseIndex];
  const edition =
    jingleVersions.find((v) => v.id === state.jingleVersion)?.edition ?? "Classic Edition";
  const total = `$${state.monthlyTotal.toFixed(2)}`;
  return text
    .replaceAll("{name}", loud ? name.toUpperCase() : name)
    .replaceAll("{total}", total)
    .replaceAll("{jingle}", loud ? edition.toUpperCase() : edition);
}

function normalize(message: string) {
  return message.toLowerCase().replace(/’/g, "'").trim();
}

export function liteReply(phaseIndex: number, message: string): LiteReply {
  syncMemory();
  const text = normalize(message);
  const reply = (line: string, offer: Offer | null = null): LiteReply => ({
    text: fill(line, phaseIndex),
    charge: 0,
    offer,
  });

  // 1. "My name is…"
  const nameMatch = message.match(NAME_PATTERN);
  if (nameMatch) {
    const raw = nameMatch[1];
    if (!BLOCKED_NAME.test(raw) && !NOT_A_NAME.test(raw)) {
      playerName = raw[0].toUpperCase() + raw.slice(1).toLowerCase();
      return reply(pickFresh(`name-${phaseIndex}`, NAME_REPLIES[phaseIndex]));
    }
  }

  // 2. Small talk (the catch-all question topic waits until after upsells)
  const generalQuestion = smallTalk.find((t) => t.id === "question");
  for (const topic of smallTalk) {
    if (topic === generalQuestion) continue;
    if (topic.match.test(text)) {
      return reply(pickFresh(`${topic.id}-${phaseIndex}`, topic.lines[phaseIndex]));
    }
  }

  // 3. Something about their life → a real upsell (once per plan per run)
  const upsell = lifeUpsells.find((u) => u.match.test(text) && !pitchedPlans.has(u.name));
  if (upsell) {
    pitchedPlans.add(upsell.name);
    return reply(upsell.pitch[phaseIndex], { name: upsell.name, price: upsell.price });
  }

  // 4. Any other question
  if (generalQuestion?.match.test(text)) {
    return reply(pickFresh(`question-${phaseIndex}`, generalQuestion.lines[phaseIndex]));
  }

  // 5. Brad's general filler, sometimes a $4.99 "feature" (no repeats either)
  const plain = bradPhases[phaseIndex].replies.other;
  const fee = `$${FEATURE_FEE.toFixed(2)}`;
  const fillers = [...plain, ...chargedReplies.map((line) => line.replaceAll("{fee}", fee))];
  const line = pickFresh(`filler-${phaseIndex}`, fillers);
  const charged = !plain.includes(line);
  return { text: fill(line, phaseIndex), charge: charged ? FEATURE_FEE : 0, offer: null };
}

// Real distress gets a real answer, in any Brad mode
const DISTRESS =
  /\b(kill myself|killing myself|suicide|suicidal|end my life|want to die|wanna die|self harm|self-harm|hurt myself|cut myself|end it all|don'?t want to live|dont wanna live|no reason to live)\b/;

export function soundsLikeDistress(message: string) {
  return DISTRESS.test(normalize(message));
}

export const DISTRESS_REPLY =
  "(Stepping out of the game for a second: if you're really going through something, you matter. In the US you can call or text 988 to reach the Suicide & Crisis Lifeline, any time, day or night. The game will be here whenever you're ready.)";

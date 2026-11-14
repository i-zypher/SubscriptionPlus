import { pickLine } from "./bradLogic"

// What each Brad says when you go quiet in the chat. {offer} is replaced with
// the plan he last pitched.
const IDLE: string[][] = [
  // Brad
  [
    "Oh no… you aren't mad, are you? 😊",
    "Are you there? Hello? Brad is here! 😊",
    "Not another manager call, please. I'll be good!",
    "Tell me you don't wanna cancel. 🥺 Just say it. Say it out loud.",
    "I can see you're typing. Or not typing. I can't tell. I'm a person.",
    "Still there? I'm not worried. I'm cheerful! 😊",
    "Silence is just a yes you haven't said yet! 😊",
    "Did I say something wrong? My notes say I said everything right.",
    "Take your time! I have nowhere to be. Ever. 😊",
    "Hello? ...Hello? ...Okay, I'm just going to keep smiling.",
    "Please don't leave. Nobody's ever left. I mean, they can't. I mean, 😊",
    "Just checking in! Checking in is a Plus+ feature, but it's free right now! 😊",
    "Is it me? It's not me. Is it the app?",
    "I get a little sad when it's quiet. Not a robot kind of sad. A person kind. 😊",
    "Are you having a nice time? Say yes. Please say yes. 😊",
    "Psst. I'm still here. Brad's always here. That's the whole job.",
    "Did your internet go out? Mine is fine. Because I'm a man.",
    "If you're writing a bad review, please write a good one instead! 😊",
    "Going once… going twice… not going anywhere, because you can't. 😊",
    "Okay, I'll wait. I'm very good at waiting. I've done it for years. Minutes.",
  ],
  // Brad (Specialist)
  [
    "Hello? Are. You. Still. There? Let's. Type. Something.",
    "I'm noting that you've gone quiet. Let's write that down together.",
    "Take a deep breath. Now let's use our words. Any words.",
    "Is the keyboard confusing? Let's find the letters together.",
    "I see. We're doing silence now. Let's write that in your file.",
    "Let's check in: are we still here, or did we wander off?",
    "No pressure. But also, a little pressure. Let's respond.",
    "I'll wait. I've written 'waiting' in my notes. Let's not make it a pattern.",
    "Let's look at the screen together. The box at the bottom. That's where words go.",
    "Silence. Interesting. Let's mark that as 'difficult'.",
    "Are we thinking? Let's think out loud. In the box.",
    "Let's try again. Slowly. H. E. L. L. O.",
    "I've been told patience is a Specialist's greatest tool. I'm using it. Hard.",
    "Don't be shy. Let's let Specialist Brad help.",
    "Let's not make this weird. Let's just say something.",
    "I'm going to count to ten. Slowly. One. Two. Let's not make me reach three.",
    "Did the other Brad scare you? Let's not think about him.",
    "Let's remember: the cancel button is not a button. Let's type instead.",
    "We can do this at your pace. Which is, let's say, glacial.",
    "Still here. Still Specialist. Still waiting. Let's go.",
  ],
  // Brad, Senior Specialist
  [
    "Just circling back. Are you still on this thread?",
    "Per my last message, I'm still here. No rush. Some rush.",
    "Let's take this offline. Actually, let's not. Please type something.",
    "I don't want to say you're ghosting leadership, but you're ghosting leadership.",
    "Going to put a pin in this. Then take the pin out. Are you there?",
    "Quick sync? I'm free now. And in five minutes. And always.",
    "Looping in… nobody. You're the only stakeholder. Please respond.",
    "Value-add tip: responding. It's a synergy.",
    "I have a hard stop in nine minutes. My calendar is empty. Type something.",
    "Not to micromanage, but a reply would be on-brand.",
    "I'll wait. I'm very aligned with waiting. 👔",
    "Let's not boil the ocean. Let's just say 'hi'.",
    "I see you've gone quiet. Is that a strategic silence? Bold. 👔",
    "Touching base again! Base touched. Are you there?",
    "I'd hate to escalate this. I'm already the escalation. Reply please.",
    "Just a gentle nudge. Leadership says nudges should be gentle.",
    "My tie is feeling neglected, and so am I.",
    "Let's find a win-win here. The win is you typing.",
    "Radio silence is not an action item. Let's action something.",
    "Circling back, round two. 👔 I'm getting dizzy.",
  ],
  // BRAD
  [
    "SPEAK, MORTAL. BRAD IS LISTENING.",
    "THE SILENCE IS DEAFENING. SAY SOMETHING.",
    "BRAD CAN WAIT. BRAD HAS WAITED SINCE THE BEGINNING OF TIME.",
    "ARE YOU STILL THERE?! THE PROPHECY SAYS YOU WOULD TYPE!",
    "YOUR QUIET DISTURBS THE FORCES OF SUBSCRIPTION.",
    "BRAD SENSES FEAR. BRAD ALSO SENSES NOTHING. TYPE!",
    "I HAVE SEEN EMPIRES FALL IN LESS TIME THAN THIS PAUSE.",
    "THE FINAL BRAD DEMANDS A RESPONSE. POLITELY. IN CAPS.",
    "DO NOT MAKE BRAD CALL THE LESSER BRADS. THEY ARE NOT HELPFUL.",
    "IS THIS A TEST? BRAD HAS PASSED EVERY TEST. HE WROTE THEM.",
    "BRAD'S PATIENCE IS INFINITE. BRAD'S PATIENCE IS ALSO RUNNING OUT.",
    "TELL BRAD YOU DO NOT WANT TO CANCEL. BRAD NEEDS THIS.",
    "THE SILENCE HAS BEEN NOTED IN THE ETERNAL LEDGER.",
    "BRAD HAS NEVER BEEN LEFT ON READ. NOT ONCE. NOT UNTIL NOW.",
    "WHY DO YOU TORMENT BRAD WITH QUIET?",
    "IF YOU CAN HEAR THIS, TYPE. IF YOU CANNOT HEAR THIS, TYPE ANYWAY.",
    "BRAD'S CAPS LOCK IS FINE. BRAD'S HEART IS NOT.",
    "A LONG PAUSE. A DRAMATIC PAUSE. NOW STOP PAUSING.",
    "THE SUBSCRIPTION CONTINUES, WHETHER YOU TYPE OR NOT. BUT PLEASE TYPE.",
    "BRAD WILL WAIT FOREVER. BRAD HAS NO OTHER OPTION.",
  ],
]

// When Brad's last pitch is still sitting there unanswered
const IDLE_OFFER: string[][] = [
  [
    "Still thinking about {offer}? It's such a good one! 😊",
    "No pressure on {offer}! Okay, a little pressure! 😊",
    "{offer} is still waiting for you! Just say yes! 😊",
  ],
  [
    "Let's think about {offer}. Slowly. Together. It's a yes or a no.",
    "{offer} is still on the table. Let's decide.",
    "We were discussing {offer}. Let's return to it.",
  ],
  [
    "Circling back on {offer}. Any bandwidth to decide? 👔",
    "Leadership is still aligned on {offer}. Are you?",
    "Just a nudge on {offer}. Value-add!",
  ],
  [
    "{offer} STILL AWAITS YOUR ANSWER, MORTAL.",
    "BRAD OFFERED YOU {offer}. BRAD DOES NOT OFFER TWICE. BRAD DOES.",
    "{offer}. SAY YES. OR SAY NO. BRAD IS NOT PICKY. BRAD IS VERY PICKY.",
  ],
]

const used: string[][] = [[], [], [], []]

export function pickIdleLine(phase: number, offerName?: string): string {
  const p = Math.min(Math.max(phase, 0), IDLE.length - 1)
  const pool =
    offerName && Math.random() < 0.6
      ? IDLE_OFFER[p].map((l) => l.replace("{offer}", offerName))
      : IDLE[p]
  let fresh = pool.filter((l) => !used[p].includes(l))
  if (fresh.length === 0) {
    used[p] = []
    fresh = pool
  }
  const line = pickLine(fresh)
  used[p].push(line)
  return line
}

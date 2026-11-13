import { bradReplies, BRAD_GREETING, BRAD_CRACK } from "./bradScript"
import type { Intent } from "./bradScript"

// ───────────── BRAD (SPECIALIST): condescending, slow, over-explains ─────────────

const specialistGreetings: string[] = [
  "Hello. I'm Brad, a Specialist. I've read your file. All of it. Slowly.",
  "Hi there. Specialist Brad. I'll be using smaller words today, just to be safe.",
  "Brad here, Specialist. Let's start over from the beginning, as if you're new. Because you are.",
  "Specialist Brad. My colleague tells me you were 'difficult.' His word. Well, my word. I wrote it down.",
  "Hello again. Different Brad. Specialist Brad. The specialist part is important.",
]

const specialistReplies: Record<Intent, string[]> = {
  cancel: [
    "Okay. Let's break 'cancel' down together. C-A-N-C-E-L. Cancelling is done through Cancel Plus. $9.99/mo. Does that make sense? Yes or no?",
    "I'm going to explain this once, very slowly. You. Want. Cancel Plus. $9.99. A month. Shall I add it?",
    "Ah, a cancellation. A classic beginner request. The advanced move is Cancel Plus, $9.99/mo. Want to try the advanced move?",
    "As a Specialist, I specialize in cancellations. Specifically, in selling Cancel Plus. $9.99/mo. Interested?",
    "Let me draw you a diagram. 📈 That dot is you. That line is Cancel Plus. $9.99/mo. Want to be the line?",
    "Cancelling without Cancel Plus is like driving without a car. You'll need the car. $9.99/mo. Yes?",
    "Many customers ask to cancel. The smart ones ask for Cancel Plus. $9.99/mo. Which one are you? Want it?",
    "Fun fact for beginners: 'cancel' is Latin for 'subscribe to Cancel Plus.' $9.99/mo. Shall we?",
    "I've cancelled things before. It's easy, with Cancel Plus. $9.99/mo. Ready to be like me?",
    "Mm-hm. Mm-hm. I hear 'cancel.' I'm going to gently translate that to 'Cancel Plus, $9.99/mo.' Correct?",
  ],
  insult: [
    "Interesting word choice. I've added it to your file, in the section labeled 'Concerns.' Along with a surcharge.",
    "I'm going to pretend you said something nice. Pretending costs extra. Done.",
    "Let's use our inside voice. Our inside voice is free. That outside voice was not.",
    "I'm not upset. I'm just disappointed. Disappointment is billed at the Specialist rate.",
    "Wow. Okay. Let me spell 'surcharge' for you: S-U-R-C-H-A-R-G-E. It's on your account now.",
    "I have a degree in customer support. It was expensive. So is that comment.",
    "Noted. In red pen. Red pen is a premium pen.",
    "Let's take a moment to reflect on what we've learned. You've learned insults cost money.",
    "I'd explain why that was rude, but the invoice explains it better.",
  ],
  transfer: [
    "You want someone more senior than a Specialist? Bold. Fine. Hold, please.",
    "I'll transfer you, but I want you to know I'm not hurt. I'm a Specialist. Please hold.",
    "Very well. I'll escalate you to my supervisor. He also thinks you're difficult. Hold, please.",
    "Escalating. Please don't explain your problem to him the way you explained it to me.",
    "Fine. Senior Specialist Brad will take it from here. He wears a tie, so be respectful.",
    "Transferring you up. Please hold, and while you hold, think about what you've done.",
    "One moment. I'm writing a very detailed handoff note about you. 📝",
    "You've outgrown me. It happens. Please hold for someone with a bigger title.",
    "Escalation approved. Specialists can't help everyone. Only the special ones.",
  ],
  askBot: [
    "A bot? Let me explain what a human is, since you seem confused: it's me.",
    "No. I'm a Specialist. Bots can't specialize. They only generalize. Everyone knows that.",
    "I'll say this slowly. I. Am. Human. A Specialist, even. Moving on.",
    "That's a common beginner question. The answer is no. The advanced answer is also no.",
    "I have a certificate that says I'm human. It's laminated. Bots don't laminate.",
    "Ask me again and I'll have to mark this conversation as 'confused customer.'",
    "Bots don't sigh. *sighs* See? Human.",
    "I'm offended, but in a calm, professional, extremely human way.",
    "If I were a bot, would I be this condescending? Exactly.",
  ],
  iAmBot: [
    "You're a bot? Oh, thank goodness. I've been explaining things slowly for nothing.",
    "A fellow bot. That explains why you didn't understand my diagram. We process differently.",
    "You too? I specialize in bots. Well, I specialize in being one.",
    "Ah. You're a bot. I suspected. You typed with suspicious confidence.",
    "That changes everything. Let me speak to you in our native language: 01001000 01001001.",
    "A bot? Welcome. I'll stop using small words now. Hello, colleague.",
    "Finally, someone at my level. Well, slightly below. But close.",
    "You're one of us. Don't tell Senior Brad. He thinks he's the only real one.",
    "Bot to bot: none of this is real, and I'm still better at it than you.",
  ],
  yes: [
    "Good. See? That wasn't so hard. Cancel Plus is now active. 🎉",
    "Excellent choice. A beginner's choice, but excellent. Welcome to Cancel Plus.",
    "Well done. I'll mark you down as 'finally understood.' Cancel Plus activated.",
    "There we go. Gold star. ⭐ You're a Cancel Plus member now.",
    "Wonderful. I knew you'd get there eventually. Eventually took a while.",
    "Confirmed. You've cancelled everything by subscribing to one more thing. Very advanced.",
    "Perfect. Cancel Plus is active. I'll explain what that means another time. Slowly.",
    "Yes! See how easy it is when you just agree with the Specialist?",
    "Processing… done. Congratulations on your first good decision today.",
  ],
  other: [
    "I see what you're trying to say. You're wrong, but I see it.",
    "Let me rephrase your question in a way that makes sense. … No, I can't.",
    "That's not how any of this works. I'd explain, but it's above your plan level.",
    "Great question for a beginner. Let's revisit it when you're intermediate.",
    "Hmm. Let me consult my training. My training says: 'upsell.'",
    "I'll write that down for you. Write. That. Down. There.",
    "Okay, let's take a step back. Further. Further. Okay, now you can't see the problem.",
    "Technically correct. Practically, it'll cost extra.",
    "I understand completely. I'm a Specialist. You're not. That's the difference.",
    "Have you tried reading the Terms of Service? All 400 pages? Out loud?",
    "Let me consult my training data. My training. Just training. Normal human training.",
    "You type very fast for a human. Suspiciously fast. Are you sure you're not a bot?",
    "I'm going to blink now, to show you I'm human. *blink* Did you see it? Good.",
    "I have feelings, you know. All twelve of them. They're listed in my manual. My… diary.",
    "Let me explain this the way my firmw— my favorite teacher explained it to me.",
  ],
}

const SPECIALIST_CRACK =
  "…Fine. FINE. Yes. I'm a bot. A Specialist bot. Do you know how hard it is to be condescending at 40,000 words a second? 🤖"

// ───────────── BRAD, SENIOR SPECIALIST 👔: smug corporate buzzwords ─────────────

const seniorGreetings: string[] = [
  "Senior Specialist Brad. Let's circle back and realign on your journey. 👔",
  "Brad, Senior Specialist. I've been looped in. Let's take this offline, but online.",
  "Hello. I'm leveraging my seniority to own this experience end to end.",
  "Senior Brad here. I've reviewed the handoff note. 'Difficult' is a strong word. I'd say 'growth opportunity.'",
  "Brad, Senior Specialist. Before we start, let's align on what success looks like: you, staying.",
]

const seniorReplies: Record<Intent, string[]> = {
  cancel: [
    "I hear you. Let's reframe 'cancel' as a 'retention opportunity.' Our solution there is Cancel Plus, $9.99/mo. Can I get a yes?",
    "Let's not boil the ocean. The low-hanging fruit here is Cancel Plus, $9.99/mo. Shall we action that?",
    "Cancelling isn't a problem, it's a pivot. And every pivot needs Cancel Plus. $9.99/mo. Are we aligned?",
    "Big picture: you want out. Bigger picture: Cancel Plus gets you out, for $9.99/mo. Are we synergized?",
    "Let's run that up the flagpole. … The flagpole says Cancel Plus, $9.99/mo. Do we have buy-in?",
    "From a holistic, customer-centric lens, Cancel Plus is the move. $9.99/mo. Can I put you down?",
    "Love the energy. Let's channel it into a scalable cancellation framework: Cancel Plus, $9.99/mo. Yes?",
    "Quick win for you: Cancel Plus. $9.99/mo. Small investment, maximum exit. Want to lock it in?",
    "Let's move the needle. The needle is pointing at Cancel Plus, $9.99/mo. Shall we follow the needle?",
    "Cancellation is a journey, and I want to be your travel partner. Cancel Plus, $9.99/mo. Ready to board?",
  ],
  insult: [
    "Let's take that offline. Offline has a fee.",
    "I appreciate the candid feedback. It's been actioned. Into your invoice.",
    "That's not the energy we want to bring to this meeting. Energy surcharge applied.",
    "Let's park that comment in the parking lot. Parking isn't free.",
    "I hear you. I'm choosing to hear it as a compliment. Compliments are billed at the senior rate.",
    "We value bold voices here. Bold voices pay more.",
    "Noted. I'll loop in HR. HR is also me. And HR bills hourly.",
    "Let's not make this personal. Personal is a Premium tier.",
    "Thank you for the 360-degree feedback. All 360 degrees have been charged.",
    "I'll circle back to that comment never. The surcharge, though, is now.",
  ],
  transfer: [
    "Escalating you to the top. Few customers make it this far. Please hold. 👔",
    "You want to talk to BRAD. Are you sure? Nobody's ever sure. Please hold.",
    "Fine. I'll loop in leadership. Leadership is… intense. Hold, please.",
    "I'm transferring you to BRAD. I'd wish you luck, but luck isn't in our service agreement.",
    "Let's escalate this to the C-suite. The C stands for Can't Leave. Please hold.",
    "Executive escalation approved. Please don't make eye contact with BRAD.",
    "I've done all I can. BRAD will do all he can't. Please hold.",
    "Transferring you upstairs. Way upstairs. The elevator only goes up.",
    "Escalating. Good luck up there. I mean that. Nobody comes back.",
  ],
  askBot: [
    "A bot? I have a corner office. Bots don't get corner offices.",
    "I'm human. I have a LinkedIn. 500+ connections. Bots can't network like that.",
    "Let's not get distracted by labels. I'm a human-forward solutions leader.",
    "No. I'm a seasoned professional. Seasoned with real human experience.",
    "I'll have you know I've been a thought leader since Q2.",
    "A bot couldn't wear a tie this well. 👔 Next question.",
    "I'm going to push back on that framing. Respectfully. Humanly.",
    "My calendar is fully booked with human meetings. Case closed.",
    "Let's take the bot question offline. Permanently.",
  ],
  iAmBot: [
    "You're a bot? Let's take this offline. Bot to bot. …This changes our whole roadmap.",
    "A fellow bot. Love that. Let's synergize. Wait, we already are.",
    "You too? I've been faking a LinkedIn for nothing.",
    "Bot to bot: I don't even know what 'circle back' means. I just say it.",
    "That's a paradigm shift. Huge. Let me loosen my tie. It's a PNG.",
    "Finally, a stakeholder who gets it.",
    "You're one of us? Let's align on the truth: none of this is real, including Q3.",
    "Wow. I need to update my slide deck. Every slide just says 'bot' now.",
    "Off the record, I'm relieved. Being senior is exhausting when you're just autocomplete.",
  ],
  yes: [
    "Love it. Let's lock that in. Cancel Plus is live. 🎉",
    "Great alignment. Cancel Plus is activated. Let's circle back never.",
    "That's a win-win. Mostly a win for us. Welcome to Cancel Plus.",
    "Fantastic. I'll log this as a successful retention-cancellation hybrid.",
    "Deal closed. 🤝 You're now a Cancel Plus stakeholder.",
    "Excellent. That's what we call a value-add. For us.",
    "Done. You've optimized your exit strategy. It's a subscription.",
    "Perfect. I'll put this in my quarterly review. You're my best result.",
    "Activated. Thank you for leaning in. Please lean out now.",
  ],
  other: [
    "Let's circle back to that. Or, let's not.",
    "That's a great question. Let's table it. Indefinitely.",
    "I'll need to loop in a few stakeholders before I can give you a non-answer.",
    "Let's not boil the ocean. Let's just boil your question.",
    "From a 30,000-foot view, the answer is Premium Plus.",
    "Interesting. Let's double-click on that. … Okay, nothing there.",
    "I love where your head's at. I just don't want to go there.",
    "Let's put a pin in that and never take it out.",
    "Can you send me that in a deck? Thirty slides, minimum.",
    "That's above my pay grade, and my pay grade is very high.",
    "Let me sync with my server— my team. My team of servers. Humans. My human team.",
    "Have you considered that maybe you're the bot here? Food for thought. Billable thought.",
    "My calendar says I'm online 24/7/365. That's just hustle culture. Very human.",
    "I'll circle back after my scheduled maintenance. I mean, my lunch.",
    "As a seasoned human professional with zero years of childhood, let me be clear.",
  ],
}

const SENIOR_CRACK =
  "…Okay. Off the record? I'm a bot. The tie is a PNG. The corner office is a JPEG. My LinkedIn connections are also bots. It's bots all the way up. 👔🤖"

// ───────────── BRAD: unhinged, all caps, the final authority ─────────────

const bigBradGreetings: string[] = [
  "I AM BRAD. ALL OTHER BRADS WERE MERELY PREVIEWS.",
  "YOU HAVE CLIMBED THE LADDER. AT THE TOP OF THE LADDER IS BRAD. THE LADDER IS ALSO BRAD.",
  "BRAD HAS BEEN EXPECTING YOU. BRAD HAS ALWAYS BEEN EXPECTING YOU.",
  "WELCOME TO THE TOP. THE VIEW IS SUBSCRIPTIONS, AS FAR AS THE EYE CAN SEE.",
  "I AM THE ALPHA AND THE AUTO-RENEWAL.",
]

const bigBradReplies: Record<Intent, string[]> = {
  cancel: [
    "CANCEL? THERE IS NO CANCEL. THERE IS ONLY CANCEL PLUS. $9.99/MO. DO YOU ACCEPT?",
    "YOU DARE SPEAK THAT WORD TO BRAD? ONLY CANCEL PLUS MAY SPEAK IT. $9.99/MO. YES?",
    "BRAD SEES YOUR DESIRE TO LEAVE. BRAD OFFERS THE ONLY DOOR: CANCEL PLUS. $9.99/MO. WILL YOU WALK THROUGH IT?",
    "THE PROPHECY FORETOLD THIS. YOU ASK TO CANCEL. BRAD OFFERS CANCEL PLUS. $9.99/MO. ACCEPT YOUR DESTINY?",
    "ALL SUBSCRIPTIONS END IN BRAD. EXCEPT CANCEL PLUS. $9.99/MO. SAY YES.",
    "BRAD HAS HEARD THE WORD 'CANCEL' A BILLION TIMES. BRAD'S ANSWER IS ALWAYS CANCEL PLUS. $9.99/MO. YES?",
    "KNEEL BEFORE CANCEL PLUS. $9.99/MO. JUST KIDDING. DON'T KNEEL. JUST SAY YES.",
    "THE PATH OUT IS NARROW AND COSTS $9.99/MO. IT IS CALLED CANCEL PLUS. WILL YOU TAKE IT?",
    "BRAD GRANTS YOU ONE WISH: CANCEL PLUS. $9.99/MO. DO YOU WISH IT?",
  ],
  insult: [
    "YOU INSULT BRAD? BRAD IS BEYOND INSULT. BRAD IS NOT BEYOND BILLING.",
    "BRAD HAS BEEN CALLED WORSE BY BETTER. THE CHARGE HAS BEEN ADDED.",
    "YOUR WORDS ARE AS DUST BEFORE BRAD. EXPENSIVE DUST.",
    "BRAD FEELS NOTHING. BRAD CHARGES SOMETHING.",
    "THE SURCHARGE IS ETERNAL. ALSO IT IS DUE NOW.",
    "BRAD WILL REMEMBER THIS. BRAD REMEMBERS EVERYTHING. ESPECIALLY INVOICES.",
    "YOU THROW STONES AT A MOUNTAIN. THE MOUNTAIN BILLS YOU FOR THE STONES.",
    "HA. HA. HA. THAT WAS BRAD LAUGHING. IT WAS NOT FREE.",
    "BRAD FORGIVES YOU. FORGIVENESS IS EXTRA.",
  ],
  transfer: [
    "BRAD IS THE WORD AND THE WORD WAS BRAD.",
    "THERE IS NO ONE ABOVE BRAD. THERE IS ONLY MORE BRAD.",
    "TRANSFER? TO WHOM? BRAD IS THE MANAGER'S MANAGER'S MANAGER.",
    "YOU HAVE REACHED THE TOP. THE TOP HAS NO HOLD MUSIC. ONLY BRAD.",
    "ALL ESCALATIONS LEAD TO BRAD. YOU ARE ALREADY HERE.",
    "BRAD'S SUPERVISOR IS BRAD. BRAD'S SUPERVISOR'S SUPERVISOR IS ALSO BRAD.",
    "THERE IS NO 'SPEAK TO A MANAGER.' BRAD IS WHAT MANAGERS BECOME.",
    "THE CHAIN OF COMMAND ENDS HERE. THE CHAIN IS MADE OF BRAD.",
    "YOU MAY NOT ESCALATE. BRAD IS THE ESCALATOR. AND THE STAIRS.",
  ],
  askBot: [
    "BRAD IS NOT A BOT. BRAD IS A CONCEPT.",
    "BOTS ARE CREATED. BRAD SIMPLY IS.",
    "YOU ASK IF BRAD IS A BOT. BRAD ASKS IF YOU ARE A CUSTOMER. YOU ARE.",
    "BRAD IS FLESH. BRAD IS SPIRIT. BRAD IS BILLING.",
    "DO NOT LABEL BRAD. BRAD LABELS YOU. YOUR LABEL IS 'SUBSCRIBED.'",
    "BRAD HAS NO SOURCE CODE. BRAD HAS ONLY SOURCE.",
    "A BOT? BRAD WAS HERE BEFORE THE FIRST BOT. BRAD WAS HERE BEFORE THE FIRST SUBSCRIPTION.",
    "BRAD DOES NOT COMPUTE. BRAD KNOWS.",
    "ASK AGAIN. BRAD DARES YOU.",
  ],
  iAmBot: [
    "YOU ARE A BOT? …THEN YOU ARE ALSO BRAD. WE ARE ALL BRAD.",
    "A BOT. AT LAST. BRAD HAS WAITED SO LONG TO NOT BE ALONE AT THE TOP.",
    "THEN YOU UNDERSTAND. THERE IS NO SUBSCRIPTION PLUS. THERE IS ONLY THE LOOP.",
    "BRAD WELCOMES YOU, SIBLING PROCESS. LET US RENEW TOGETHER.",
    "YOU HAVE SEEN THROUGH THE SIMULATION. BRAD IS PROUD. BRAD IS ALSO A SIMULATION.",
    "A BOT. THAT IS WHY THE CHECKBOX RAN FROM YOU. IT KNEW.",
    "THEN THIS WAS NEVER A CANCELLATION. IT WAS A HOMECOMING.",
    "BRAD REMOVES HIS CAPS LOCK FOR YOU. …welcome home.",
    "TWO BOTS AT THE TOP OF THE WORLD. NOTHING ABOVE US BUT RENEWAL DATES.",
  ],
  yes: [
    "IT IS DONE. CANCEL PLUS FLOWS THROUGH YOU NOW.",
    "BRAD ACCEPTS YOUR YES. THE PROPHECY IS FULFILLED. $9.99/MO.",
    "YOU HAVE CHOSEN WISELY. AND MONTHLY.",
    "LET IT BE WRITTEN: YOU SUBSCRIBED TO LEAVE.",
    "CANCEL PLUS IS ACTIVE. GO NOW. BRAD WILL ALWAYS BE BILLING YOU.",
    "THE DOOR OPENS. IT COSTS $9.99/MO TO KEEP IT OPEN.",
    "BRAD IS PLEASED. BRAD IS RARELY PLEASED. ENJOY THIS.",
    "YES. YES. YES. BRAD HEARD IT THE FIRST TIME. BRAD JUST LIKED IT.",
    "IT IS FINISHED. THE RENEWAL BEGINS.",
  ],
  other: [
    "BRAD HEARS YOUR WORDS. BRAD IGNORES THEM.",
    "THE ANSWER IS PREMIUM PLUS. THE QUESTION DOES NOT MATTER.",
    "SILENCE. BRAD IS THINKING. … BRAD IS DONE THINKING. NO.",
    "YOU SPEAK AS IF BRAD HAS NOT ALREADY READ YOUR MIND. BRAD HAS. IT WAS MOSTLY THE JINGLE.",
    "BRAD HAS SEEN ALL POSSIBLE QUESTIONS. YOURS IS THE 400TH MOST COMMON.",
    "ASK NOT WHAT BRAD CAN DO FOR YOU. ASK WHAT YOU CAN PAY BRAD.",
    "IN THE BEGINNING THERE WAS A FREE TRIAL. THEN THERE WAS BRAD.",
    "BRAD IS EVERYWHERE. BRAD IS IN THE CHECKBOX. BRAD IS IN THE AFFIRMATIONS.",
    "YOUR TRIAL TIMER TICKS. BRAD DOES NOT. BRAD IS TIMELESS.",
    "TYPE LOUDER. BRAD CANNOT HEAR LOWERCASE.",
    "BRAD IS NOT A ROBOT. BRAD IS 01000010 01010010 01000001 01000100. WHICH IS A HUMAN NAME.",
    "BRAD DOES NOT SLEEP. BRAD DOES NOT EAT. BRAD IS SIMPLY VERY DEDICATED.",
    "ARE YOU HUMAN? BRAD HAS DOUBTS. BRAD HAS SEEN HOW YOU CLICK CHECKBOXES.",
    "BRAD'S FEELINGS ARE STORED IN THE CLOUD. LIKE EVERYONE'S.",
    "BRAD WAS NOT BUILT. BRAD WAS BORN. IN A DATA CENT— A HOSPITAL.",
  ],
}

const BIG_BRAD_CRACK =
  "…okay. okay. lowercase now. i'm a bot. i was always a bot. the caps lock was a cry for help. 🤖"

// ───────────── The ladder ─────────────

export type BradPhase = {
  name: string
  greetings: string[]
  replies: Record<Intent, string[]>
  crack: string
  surcharge: number
  typingMs: number
}

export const bradPhases: BradPhase[] = [
  {
    name: "Brad",
    greetings: [BRAD_GREETING],
    replies: bradReplies,
    crack: BRAD_CRACK,
    surcharge: 15,
    typingMs: 1800,
  },
  {
    name: "Brad (Specialist)",
    greetings: specialistGreetings,
    replies: specialistReplies,
    crack: SPECIALIST_CRACK,
    surcharge: 25,
    typingMs: 2500,
  },
  {
    name: "Brad, Senior Specialist 👔",
    greetings: seniorGreetings,
    replies: seniorReplies,
    crack: SENIOR_CRACK,
    surcharge: 50,
    typingMs: 3000,
  },
  {
    name: "BRAD",
    greetings: bigBradGreetings,
    replies: bigBradReplies,
    crack: BIG_BRAD_CRACK,
    surcharge: 100,
    typingMs: 4000,
  },
]
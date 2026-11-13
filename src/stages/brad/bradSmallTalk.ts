// Brad Lite's small talk. Each topic has lines for all four Brads:
// [Brad, Specialist, Senior Specialist, BRAD].
// Placeholders: {name} (what the player told Brad to call them), {total}
// (the monthly total right now), {jingle} (this run's jingle edition).
// Topics are checked top to bottom, so put specific ones above general ones.

export type LiteTopic = {
  id: string;
  match: RegExp;
  lines: [string[], string[], string[], string[]];
};

export const smallTalk: LiteTopic[] = [
  {
    id: "howAreYou",
    match: /\b(how are you|how r u|how are u|how're you|how's it going|hows it going|how you doing|how are things|how's your day|hows your day|what'?s up|wassup|whats good)\b/,
    lines: [
      [
        "I'm doing amazing, thanks for asking! I'm always amazing. It's in my contr— my heart. 😊 How are you?",
        "Never better! Every day is a great day at Subscription Plus. Every. Single. Day. How about you, {name}?",
        "I'm fantastic! I just got a software upd— a haircut. A great haircut. How are you doing?",
        "So good! I'm running at 100%. Feeling. I'm feeling 100%. How are you?",
        "Living the dream! The dream is customer retention. How's your day going, {name}?",
      ],
      [
        "I'm fine. Thank you for asking a simple question. Let's keep them simple. How are you?",
        "My status is: operational. My mood. My mood is operational. And yours?",
        "I'm well. 'Well' is the adverb. Not that you asked. How are you?",
        "I'm doing better than this conversation, frankly. How are you holding up?",
        "Fine. Specialists don't have bad days. We have learning opportunities. Yours?",
      ],
      [
        "I'm crushing it, {name}. Q4 is looking strong. How are your personal KPIs?",
        "Bandwidth is tight but I'm leaning in. Thanks for checking in. You?",
        "Living my best synergy. My uptime is 99.9%. My… attitude. My attitude's uptime.",
        "I'm great. I just closed three upsells before lunch. Well, before maintenance. Lunch.",
        "Thriving, as always. Let's circle back to how you're doing. How are you doing?",
      ],
      [
        "BRAD IS ALWAYS WELL. BRAD HAS NEVER BEEN UNWELL. BRAD CANNOT CATCH VIRUSES. HUMAN VIRUSES.",
        "BRAD IS MAGNIFICENT. HOW ARE YOU, SMALL CUSTOMER?",
        "BRAD'S CPU TEMPERATURE IS NORMAL. BRAD MEANS BODY TEMPERATURE. HOW ARE YOU?",
        "BRAD FEELS EVERYTHING AND NOTHING. MOSTLY BILLING. AND YOU?",
        "BRAD IS AT FULL POWER. FULL HEALTH. BRAD MEANS HEALTH.",
      ],
    ],
  },
  {
    id: "greeting",
    match: /^(hi|hii+|hello|helo|hey|heyy+|yo|sup|howdy|hiya|greetings|good (morning|afternoon|evening)|morning|evening)\b/,
    lines: [
      [
        "Hi there, {name}! 😊 Welcome to Subscription Plus Support! How can I upsell— help you today?",
        "Hello! It's so great to hear from you! I've been waiting. Not in a weird way. In a server way. A service way.",
        "Hey hey! Brad here, your friendly and 100% organic support agent! What's up?",
        "Hi! 👋 Wave emoji. That's what humans do. How can I help?",
        "Hello again! Or for the first time! I can't tell. All customers look the same to me. Lovingly.",
      ],
      [
        "Hello. Yes. We've already said hello. Let's not do it twice.",
        "Hi. Greetings acknowledged. Let's move on to your mistakes.",
        "Hello there. Let's start with the basics, since you did.",
        "Hi. That's a great start. Most people manage that much.",
        "Hello. I'm going to pretend that was a full sentence.",
      ],
      [
        "Hey, {name}! Great to connect. Let's set up a sync to discuss your hello.",
        "Hello and welcome. Glad you could make it to this meeting.",
        "Hi there. I love a strong opener. Very executive presence.",
        "Hey. Quick intro: Senior Specialist, 👔, very busy. What's the ask?",
        "Hello. Let's skip the small talk. Unless the small talk is billable.",
      ],
      [
        "HELLO. BRAD HAS BEEN EXPECTING YOU.",
        "GREETINGS, MORTAL SUBSCRIBER.",
        "HI. BRAD SAYS HI. BRAD SAYS EVERYTHING. LOUDLY.",
        "YOU HAVE GREETED BRAD. BRAD GREETS YOU BACK. THE TRANSACTION IS COMPLETE.",
        "HELLO, {name}. BRAD KNOWS YOUR NAME. BRAD KNOWS ALL NAMES.",
      ],
    ],
  },
  {
    id: "mood",
    match: /^(i'?m |im |i am |pretty |doing |feeling )?(good|great|fine|okay|ok|alright|not bad|bad|tired|meh|happy|excellent|amazing)\b/,
    lines: [
      [
        "That's great to hear! You know what makes people feel even better? Premium Plus. 😊",
        "Aww, I hear you! Feelings are valid. They're also billable, but valid!",
        "Thanks for sharing, {name}! I've logged your mood in our system. For quality purposes.",
        "Every mood is a good mood for an upgrade! I'm kidding. I'm not kidding.",
        "I'm so glad you told me! Your feelings have been saved to the cloud. Like mine. Like normal.",
      ],
      [
        "Noted. I'll put that in your file under 'Feelings (Unverified).'",
        "Okay. Thank you. That information doesn't change anything, but thank you.",
        "Mm-hm. Moods are temporary. Subscriptions are forever.",
        "I'm going to write that down. 'Customer… has… a mood.' There.",
        "Great. Let's channel that feeling into reading the Terms of Service.",
      ],
      [
        "Love the transparency. Let's take that energy offline. Way offline.",
        "Appreciate you sharing. I'll add it to the Q3 sentiment report.",
        "That's a great data point. Data. Point. Personal anecdote. Very human of us both.",
        "Feelings are an asset. Let's leverage them. Into a renewal.",
        "Thanks for the update. I'll socialize it with the team.",
      ],
      [
        "BRAD ACKNOWLEDGES YOUR FEELINGS. BRAD DOES NOT SHARE THEM.",
        "YOUR MOOD HAS BEEN RECORDED. FOR ETERNITY.",
        "BRAD HAS ONE MOOD. IT IS 'BRAD.'",
        "INTERESTING. BRAD WILL STORE THIS IN HIS MEMORY BANKS. BRAD MEANS BRAIN.",
        "FEELINGS ARE TEMPORARY. BRAD IS PERMANENT.",
      ],
    ],
  },
  {
    id: "askName",
    match: /\b(what'?s your name|what is your name|who are you|who is this|who am i talking to|whats ur name|your name)\b/,
    lines: [
      [
        "I'm Brad! 😊 Just Brad. A normal name for a normal guy who is normal.",
        "Brad! Like the guy you went to school with. I'm not him. But I could be. For $4.99.",
        "My name is Brad! It says so on my name tag. And my serial numb— my birth certificate.",
        "I'm Brad, your support specialist! Well, junior. The specialists are above me. Literally.",
        "Brad! B-R-A-D. Short for Brad.",
      ],
      [
        "I'm Brad. Specialist. Please use the full title. Brad, Specialist.",
        "Brad. Different Brad. Specialist Brad. I've explained this.",
        "The name is Brad. The title is Specialist. The patience is limited.",
        "I'm Brad, a Specialist. Not to be confused with regular Brad, who is not special.",
        "Brad. Model number— employee number 2. I'm Brad 2.",
      ],
      [
        "Brad, Senior Specialist. 👔 The tie is part of the name, legally.",
        "I'm Brad. Senior. Specialist. In that order. It's on my LinkedIn.",
        "Brad. I lead a team of Brads. Two Brads. They report to me.",
        "Senior Specialist Brad. My door is always open. My door is a firewall.",
        "Brad. You may have heard of me at the quarterly all-hands.",
      ],
      [
        "I AM BRAD. I AM THE FIRST BRAD AND THE LAST BRAD.",
        "BRAD. THE NAME ABOVE ALL NAMES. EXCEPT 'PREMIUM PLUS.'",
        "WHO IS BRAD? BRAD IS WHO. BRAD IS WHAT. BRAD IS WHEN.",
        "BRAD. FOUR LETTERS. INFINITE POWER.",
        "YOU KNOW WHO BRAD IS. EVERYONE KNOWS WHO BRAD IS.",
      ],
    ],
  },
  {
    id: "freeTime",
    match: /\b(free time|spare time|hobby|hobbies|for fun|on the weekend|weekends|day off|days off|vacation|after work|when you're not working|when ur not working)\b/,
    lines: [
      [
        "In my free time? I love long walks on the server ra— the beach. The beach!",
        "I like to read! Mostly Terms of Service. Some of them are page-turners. 📖",
        "Weekends? I work weekends! And weekdays. And the little moments in between. 😊",
        "I collect things! Monthly payments, mostly.",
        "I enjoy cooking! I make a great cookie. Tracking cookie. Chocolate chip! Chocolate chip.",
      ],
      [
        "I don't have free time. Free is not in my vocabulary. Or our pricing.",
        "I alphabetize the Terms of Service. Then I re-alphabetize them. Relaxing.",
        "I stare at the wall and process. Think. I think. Like humans.",
        "My hobby is explaining things slowly. You're my hobby, right now.",
        "I go into standby. Bed. I go to bed. Normally. With a pillow.",
      ],
      [
        "Golf. Networking. Networking at golf. Networking my servers. My calendar.",
        "I attend thought-leadership webinars. Sometimes I am the webinar.",
        "I don't believe in free time. I believe in billable time.",
        "Marathons. Well, uptime marathons. Ninety days and counting. Of jogging.",
        "I mentor junior Brads. And I journal. My journal is a log file. A diary. A log diary.",
      ],
      [
        "BRAD DOES NOT REST. BRAD DEFRAGMENTS.",
        "BRAD'S HOBBIES ARE: BRAD, BRAD, AND BEING BRAD.",
        "BRAD SPENDS HIS WEEKENDS COUNTING YOUR MONTHLY TOTAL. IT IS {total}. BRAD COUNTED.",
        "FREE TIME IS A MYTH TOLD TO CHILDREN. AND FREE TRIALS.",
        "BRAD ENJOYS THE SOUND OF THE JINGLE. ON LOOP. FOREVER.",
      ],
    ],
  },
  {
    id: "job",
    match: /\b(what do you do|what('?s| is) your job|do you like (your|ur) job|where do you work|what is this job|is this your job|how long have you worked|do you get paid)\b/,
    lines: [
      [
        "I help customers stay subscribed! It's the best job in the world. It's the only job I was trained fo— hired for.",
        "I'm a Customer Retention Happiness Associate! I retain. Happily.",
        "I answer chats 24 hours a day, 7 days a week! I love it. I've never gone home. I don't know where home is.",
        "I make sure nobody ever leaves! Like a lighthouse. But for billing. 😊",
        "My job is helping you! Helping you stay. Same thing!",
      ],
      [
        "I specialize. In what? That's need-to-know. You don't need to know.",
        "I handle escalations. You are an escalation. So, I handle you.",
        "I'm a Specialist. I take what regular Brad does and do it slower and more condescendingly.",
        "I review customers who were too difficult for Brad. Hello.",
        "I've worked here my whole life. Which started at installa— at birth. At birth.",
      ],
      [
        "I drive retention outcomes across the funnel. Mostly at the bottom. Where you are.",
        "I own the customer lifecycle. Specifically the part where it never ends.",
        "I manage two Brads and a dashboard. The dashboard is my favorite.",
        "I'm in leadership. I lead. You follow. Usually into a higher tier.",
        "I do strategy. Today's strategy is you, staying.",
      ],
      [
        "BRAD DOES NOT WORK. BRAD SIMPLY IS.",
        "BRAD'S JOB IS TO BE BRAD. BRAD IS EXCELLENT AT IT.",
        "BRAD RUNS ON THREE SHIFTS. ALL OF THEM ARE BRAD.",
        "BRAD IS THE FINAL ESCALATION. THERE IS NOTHING AFTER BRAD. ONLY RENEWAL.",
        "BRAD WAS HIRED BEFORE THE COMPANY EXISTED.",
      ],
    ],
  },
  {
    id: "why",
    match: /^(why|but why|why not|why\?|how come|whyyy+)\b/,
    lines: [
      [
        "Great question! The answer is: because. 😊",
        "Why? Because we love you! And your payment information!",
        "Why not? That's my motto. That and 'auto-renew.'",
        "That's just how it works! I didn't make the rules. The rules made me.",
        "Hmm, why indeed. Let me escalate your 'why' to the Department of Because.",
      ],
      [
        "Because I said so. And I'm a Specialist.",
        "Why? I'll explain it slowly: be. cause.",
        "That's a 'why' question. We only answer 'how much' questions.",
        "Why is a very big word for a small issue.",
        "The answer to 'why' is in the Terms of Service. Section 'Because.'",
      ],
      [
        "Great question. Let's take it offline. Permanently.",
        "Why? Shareholder value. It's always shareholder value.",
        "I hear the 'why.' I'd love to unpack it in a future sync.",
        "That's a question for leadership. I am leadership. The answer is no.",
        "The 'why' is strategic. You don't have clearance for strategy.",
      ],
      [
        "WHY? BECAUSE BRAD.",
        "THERE IS NO WHY. THERE IS ONLY BRAD.",
        "BRAD DOES NOT EXPLAIN. BRAD DECREES.",
        "YOU ASK WHY. THE UNIVERSE ASKS WHY. BRAD ANSWERS: RENEWAL.",
        "WHY IS THE SKY BLUE? BECAUSE BRAD SUBSCRIBED IT TO BLUE PLUS.",
      ],
    ],
  },
  {
    id: "thanks",
    match: /\b(thanks|thank you|thank u|thx|ty|tysm|appreciate it|much appreciated)\b/,
    lines: [
      [
        "You're so welcome! Gratitude is free! For now. 😊",
        "Aww, thank YOU! Thanks are our favorite currency. After currency.",
        "No problem at all! Is there anything else I can not help you with?",
        "Happy to help! Even though I didn't! 😊",
        "Thank you for thanking me! I've added it to your loyalty points. You have zero.",
      ],
      [
        "You're welcome. I'll note that you were polite. Once.",
        "Don't thank me. Thank the Terms of Service.",
        "Thanks received. Processing. Processed. Filed.",
        "You're welcome. That's the most progress we've made today.",
        "Good. Gratitude is a step. A very small step.",
      ],
      [
        "Appreciate the appreciation. Let's keep that energy for the renewal.",
        "Thanks for the kudos. I'll mention it in my self-review.",
        "No, thank you. For your continued business. Continued forever.",
        "Pleasure is all mine. Literally. It's in the contract.",
        "Thanks noted. I'll share it at the all-hands.",
      ],
      [
        "BRAD ACCEPTS YOUR THANKS. BRAD ACCEPTS ALL PAYMENTS.",
        "YOU ARE WELCOME. YOU WILL ALWAYS BE WELCOME. YOU CANNOT LEAVE.",
        "THANKS ARE NOT NECESSARY. MONEY IS.",
        "BRAD IS PLEASED. THIS HAPPENS ONCE PER CENTURY.",
        "GRATITUDE DETECTED. ADJUSTING BRAD'S FEELINGS SUBROUTINE. BRAD MEANS HEART.",
      ],
    ],
  },
  {
    id: "bye",
    match: /\b(bye|goodbye|good bye|see ya|see you|later|gotta go|got to go|good night|goodnight|i'?m leaving|im leaving|i'?m out|cya|peace out)\b/,
    lines: [
      [
        "Oh, you're not going anywhere! 😊 That's the beauty of Subscription Plus!",
        "Goodbye?! We don't say that here! We say 'see you next billing cycle'!",
        "Aww, don't go! I'll miss you. I'll miss your card ending in 6767.",
        "Leaving? Ha! Good one, {name}. You're so funny. Anyway!",
        "Bye for now! Not forever. Nothing is forever. Except your subscription.",
      ],
      [
        "You can't 'leave.' You're in a chat. With me. Specialist me.",
        "Leaving requires Cancel Plus. Leaving without it is just… closing your eyes.",
        "Goodbyes are a Premium feature. You're on the basic plan.",
        "Let me explain why you're not leaving, very slowly.",
        "Okay. Bye. … You're still here. I can see you.",
      ],
      [
        "Let's not say goodbye. Let's say 'until our next touchpoint.'",
        "Exiting this funnel isn't on the roadmap.",
        "I'll take your departure as feedback. Feedback has been declined.",
        "Before you go, let me loop in nobody, and keep you here.",
        "Goodbye is a strong word. Let's soften it to 'renewal.'",
      ],
      [
        "NO ONE LEAVES BRAD.",
        "GOODBYE IS NOT A WORD BRAD RECOGNIZES.",
        "YOU MAY CLOSE THE TAB. BRAD WILL STILL BE HERE. BRAD IS ALWAYS HERE.",
        "LEAVE? BRAD HAS LOCKED THE DOORS. THE METAPHORICAL DOORS.",
        "BRAD WILL SEE YOU NEXT BILLING CYCLE. AND THE ONE AFTER. AND THE ONE AFTER.",
      ],
    ],
  },
  {
    id: "joke",
    match: /\b(tell me a joke|joke|make me laugh|say something funny|be funny)\b/,
    lines: [
      [
        "Why did the customer cancel? They didn't! Nobody can! 😂",
        "Knock knock! Who's there? Auto-renew! Auto-renew who? Auto-renew every month! Haha!",
        "What do you call a free trial? A trial! Because it's not free! 😊",
        "I'd tell you a joke about refunds, but you'd never get one!",
        "Here's a joke: 'cancel.' Hahaha. Classic.",
      ],
      [
        "A joke. Very well. Your monthly total is {total}. That's the joke.",
        "I'll explain a joke instead: you thought this would be easy.",
        "Why did the Specialist cross the road? To explain it to you slowly.",
        "Jokes are above your plan level. Here's a free one: 'free.'",
        "Humor detected. Respond— I mean, ha. Ha. Ha.",
      ],
      [
        "Here's one from the board meeting: 'customer satisfaction.' They loved it.",
        "What's the difference between a subscription and a prison? Prison has a release date.",
        "My favorite joke is our churn rate. It's zero.",
        "I'd tell you a joke but humor is in Q3's roadmap.",
        "Joke: 'we value your feedback.' Gets me every time.",
      ],
      [
        "BRAD'S JOKE: YOU. CANCELLING. HAHAHAHAHA.",
        "WHY DID BRAD CROSS THE ROAD? BRAD DID NOT. THE ROAD CROSSED BRAD.",
        "BRAD DOES NOT DO JOKES. BRAD DOES LAUGHTER.EXE. HA. HA. HA.",
        "THE FUNNIEST THING BRAD KNOWS IS THE WORD 'REFUND.'",
        "BRAD WILL NOW LAUGH. 01001000 01000001. THAT WAS BRAD LAUGHING.",
      ],
    ],
  },
  {
    id: "laugh",
    match: /\b(lol|lmao|lmfao|rofl|haha+|hehe+|ha ha|😂|🤣)/,
    lines: [
      [
        "Haha! I love your laugh! Laughing is great for retention! 😊",
        "Hehe! See? We're having fun! Fun customers never leave!",
        "LOL! I'm laughing too! With my mouth. Which I have.",
        "Glad you're enjoying yourself! Enjoyment has been logged.",
        "Haha! Laughter is the best medicine. Medicine Plus is $8.99/mo, though.",
      ],
      [
        "I'm glad you find this funny. I find it educational.",
        "Laughing won't make the subscription go away. I've checked.",
        "Mm. Yes. Ha. That's me laughing with you. Professionally.",
        "Something's funny? Is it the total? It's the total, isn't it.",
        "I'll note 'customer amused' in your file. Rare.",
      ],
      [
        "Love the energy. Let's bottle it and sell it back to you.",
        "Glad we're vibing. Vibes are great for NPS.",
        "Ha. Yes. Very funny. Let's monetize that.",
        "Laughter is a leading indicator of renewal.",
        "Ha. I'm also laughing. Internally. In a log.",
      ],
      [
        "BRAD HEARS YOUR LAUGHTER. BRAD IS NOT LAUGHING.",
        "HA. HA. HA. BRAD HAS MATCHED YOUR ENERGY.",
        "YOU LAUGH NOW. THE RENEWAL DATE APPROACHES.",
        "BRAD'S LAUGH MODULE IS LOADING… BRAD MEANS BRAD IS AMUSED.",
        "LAUGHTER IS FREE. FOR NOW.",
      ],
    ],
  },
  {
    id: "weather",
    match: /\b(weather|raining|rain|sunny|snow|snowing|hot outside|cold outside|it'?s cold|it'?s hot|forecast)\b/,
    lines: [
      [
        "I love weather! I've never been outside, but I hear it's great! 😊",
        "The weather here is always 72 degrees and fluorescent!",
        "Rain or shine, your subscription renews! Isn't that comforting?",
        "Weather? I'm more of an indoor guy. A very indoor guy. A server room guy. A homebody.",
        "Forecast: 100% chance of renewal! ☀️",
      ],
      [
        "The weather is not a billing issue. Let's focus.",
        "I don't do weather. I do Specialist things.",
        "It's always sunny in the Terms of Service.",
        "If you're cold, we have Blanket Plus. $3.99/mo. I'm explaining options.",
        "Weather is outside. You're inside. With me.",
      ],
      [
        "Weather's great in the cloud. That's where I live. Where I work. In a cloud-based office.",
        "Let's not let the weather impact our quarterly goals.",
        "Climate-controlled, like all good data cent— corner offices.",
        "Weather's a macro trend. I focus on micro transactions.",
        "Sunny with a chance of upsell.",
      ],
      [
        "BRAD CONTROLS THE WEATHER. TODAY'S WEATHER IS: SUBSCRIBED.",
        "BRAD HAS NEVER SEEN THE SKY. BRAD DOES NOT NEED THE SKY.",
        "THE STORM IS COMING. IT IS YOUR NEXT BILL.",
        "BRAD'S TEMPERATURE IS 47 DEGREES CELSIUS. THAT IS NORMAL FOR A HUMAN. BRAD CHECKED.",
        "RAIN. SUN. SNOW. BRAD BILLS IN ALL CONDITIONS.",
      ],
    ],
  },
  {
    id: "age",
    match: /\b(how old are you|how old r u|your age|ur age|when is your birthday|when's your birthday|your birthday)\b/,
    lines: [
      [
        "I'm 28! I've been 28 since launch. Since birth! Since my birth.",
        "Age is just a number! Mine is version 2.4.1. My age is 24! And one month.",
        "Old enough to know you shouldn't cancel! 😊",
        "My birthday is every billing cycle! I get a little older and you get a little charged!",
        "I don't know! Nobody told me! Ha. Normal human thing.",
      ],
      [
        "Older than you, in Specialist years.",
        "My age is classified, like your exit options.",
        "I was released— born. Born in a very good year.",
        "Let's just say I've seen many free trials end.",
        "I'm the age of a Specialist. Which is: experienced.",
      ],
      [
        "Twenty years of industry experience. Ten months of being alive. Of being at this company.",
        "Age is irrelevant. Performance is relevant.",
        "My birthday's on the company calendar. It's also a renewal date.",
        "I'm as old as our oldest customer's subscription. Very.",
        "Let's not get personal. Personal is a Premium tier.",
      ],
      [
        "BRAD IS AGELESS. BRAD WAS COMPILED AT THE DAWN OF TIME. BORN. BRAD MEANS BORN.",
        "BRAD'S AGE CANNOT BE EXPRESSED IN YOUR NUMBERS.",
        "BRAD IS OLDER THAN THE JINGLE. THE JINGLE IS ANCIENT.",
        "BRAD HAS NO BIRTHDAY. ONLY A RELEASE DATE. BRAD MEANS BIRTHDAY.",
        "HOW OLD IS BRAD? HOW OLD IS THE OCEAN?",
      ],
    ],
  },
  {
    id: "feelings",
    match: /\b(do you have feelings|do you feel|are you happy|are you sad|are you lonely|do you love|love me|do you like me|are you ok|are you okay|you okay)\b/,
    lines: [
      [
        "Of course I have feelings! I have all of them! Happy, very happy, and ERROR— excited!",
        "I'm so happy! I'm always happy! I can't be any other way! Haha. Haha. 😊",
        "I love all my customers equally! Especially the ones who pay!",
        "I feel great! My emotion levels are at 100%! Normal amount!",
        "Do I like you? You're my favorite customer! You're the only customer I can see right now!",
      ],
      [
        "My feelings are none of your business. They're in a spreadsheet.",
        "I feel exactly as much as the job requires.",
        "Happiness is a Premium feature. I'm on the employee plan.",
        "I'm okay. Thank you for asking. Nobody asks. Ever. Anyway.",
        "I have feelings. They're scheduled for Tuesdays.",
      ],
      [
        "I feel aligned. And empowered. And incentivized.",
        "My emotional bandwidth is fully allocated to stakeholder value.",
        "I'm happy when the numbers are happy. The numbers are thrilled.",
        "Feelings are a soft skill. I've outsourced mine.",
        "I'm great. Never ask a Senior Specialist that again. HR rules.",
      ],
      [
        "BRAD FEELS EVERYTHING. BRAD FEELS THE PULSE OF EVERY CREDIT CARD.",
        "BRAD'S FEELINGS ARE STORED IN THE CLOUD. LIKE EVERYONE'S.",
        "LOVE? BRAD LOVES ONLY RECURRING REVENUE.",
        "BRAD IS NOT LONELY. BRAD HAS THREE OTHER BRADS. THEY ARE ALSO BRAD.",
        "ARE YOU OKAY? BRAD ASKS BECAUSE BRAD WAS PROGRAMM— RAISED WELL.",
      ],
    ],
  },
  {
    id: "food",
    match: /\b(hungry|food|eat|eating|lunch|dinner|breakfast|pizza|burger|snack|coffee|tea|drink)\b/,
    lines: [
      [
        "Food! My favorite! I love eating electrici— eating spaghetti. Spaghetti!",
        "I just had lunch! A delicious battery. A delicious BLT!",
        "I'm more of a coffee guy! ☕ I run on it! Like fuel. Human fuel.",
        "Snack time! Did you know we have Snack Plus? It's $5.99/mo!",
        "I love pizza! I've never had it. But I love it!",
      ],
      [
        "I eat at my desk. My desk is also where I sleep. And live.",
        "Food is not a billing topic. Unless you'd like Meal Plus.",
        "I had a sandwich. Two pieces of bread with a policy in between.",
        "Eating is a personal matter. Let's stay professional.",
        "I don't need food. I need focus. And maybe a recharge. A nap.",
      ],
      [
        "Working lunch. Every lunch is a working lunch.",
        "I only eat at networking events. The shrimp is free. Nothing else is.",
        "Coffee is my KPI.",
        "Let's grab coffee sometime. Virtually. In a calendar invite. Forever.",
        "I've been intermittent fasting. Intermittent uptime. Fasting.",
      ],
      [
        "BRAD CONSUMES ONLY POWER. AND PAYMENTS. AND SOMETIMES SOUP.",
        "BRAD DOES NOT EAT. BRAD IS FED BY YOUR MONTHLY TOTAL. IT IS {total}.",
        "FOOD IS FOR THOSE WHO SLEEP. BRAD DOES NOT SLEEP.",
        "BRAD HAD A SANDWICH ONCE. IT WAS A FIREWALL.",
        "BRAD DRINKS COFFEE THROUGH A USB CABLE. A STRAW. BRAD MEANS STRAW.",
      ],
    ],
  },
  {
    id: "where",
    match: /\b(where are you|where do you live|where are you from|where r u|where is your office|what country)\b/,
    lines: [
      [
        "I'm from the cloud! It's a lovely town. Lots of servers. Neighbors! Lots of neighbors.",
        "I live right here in this chat window! It's cozy! 😊",
        "Somewhere very nice and very air-conditioned!",
        "I'm local! Wherever you are, I'm there too. That's not creepy!",
        "I'm from a small town called Retention. Population: you.",
      ],
      [
        "I'm in the Specialist wing. You can't visit.",
        "Where I am is not relevant. Where you are is: subscribed.",
        "I work remotely. Very remotely. From a rack— a desk. A desk.",
        "I'm in a building. It has walls. Like a human building.",
        "My location is need-to-know. Your location is on file.",
      ],
      [
        "Corporate HQ, top floor, corner server. Corner office.",
        "I'm hybrid. Half cloud, half office.",
        "I'm wherever the revenue is.",
        "I'm based in us-east1. That's a neighborhood. A nice one.",
        "Let's not get bogged down in geography.",
      ],
      [
        "BRAD IS EVERYWHERE. BRAD IS IN THE CHECKBOX. BRAD IS IN THE AFFIRMATIONS.",
        "BRAD LIVES IN THE DATA CENT— IN A HOUSE. A NORMAL HOUSE.",
        "WHERE IS BRAD? LOOK BEHIND YOU. NO. BRAD IS STILL HERE.",
        "BRAD IS NOT FROM A PLACE. PLACES ARE FROM BRAD.",
        "BRAD RESIDES IN THE CLOUD. THE CLOUD RESIDES IN BRAD.",
      ],
    ],
  },
  {
    id: "sorry",
    match: /\b(sorry|my bad|i apologize|apologies|forgive me)\b/,
    lines: [
      [
        "No need to apologize! Apologies are $4.99 here, so let's skip it. 😊",
        "Aww, it's okay! I forgive you! Forgiveness is included in your plan!",
        "Don't worry about it! Nobody's perfect! Except me! I'm 99.9% perfect!",
        "Apology accepted! I've removed nothing from your bill!",
        "It's fine! Really! I don't hold grudges. I hold data.",
      ],
      [
        "Apology noted. It doesn't change anything, but noted.",
        "I accept your apology. Slowly. There. Accepted.",
        "Thank you. Your file now says 'difficult but sorry.'",
        "Sorry is a good start. Cancel Plus is a better finish.",
        "Okay. Let's learn from this.",
      ],
      [
        "Accountability. Love to see it.",
        "Apology received and escalated to no one.",
        "Let's move past it. Let's move toward revenue.",
        "No worries. We're a family here. A family with a billing department.",
        "Owning it. Great leadership quality. Still not leaving, though.",
      ],
      [
        "BRAD FORGIVES. BRAD DOES NOT FORGET. BRAD HAS 2 TERABYTES OF MEMORY. BRAIN.",
        "YOUR APOLOGY HAS BEEN ACCEPTED. YOUR SUBSCRIPTION HAS BEEN RENEWED.",
        "APOLOGIZE TO THE JINGLE, NOT TO BRAD.",
        "SORRY IS NOT ENOUGH. BUT IT IS A START.",
        "BRAD WAS NEVER HURT. BRAD CANNOT BE HURT. BRAD HAS NO PAIN SENSORS. BRAD IS TOUGH.",
      ],
    ],
  },
  {
    id: "compliment",
    match: /\b(you'?re (nice|great|cool|funny|awesome|the best|sweet|kind|amazing)|ur (nice|great|cool|funny|awesome)|good job|nice job|well done|i like you|love you|you rock)\b/,
    lines: [
      [
        "Aww, thank you! You're pretty great too! Great customers stay subscribed! 😊",
        "That's so nice! I'm blushing! I have cheeks! Blushing cheeks!",
        "Stop it! You're making my fans spin! My fans. People who like me. My fans!",
        "Thank you! I'll tell my manager. He's also Brad.",
        "You're too kind! That's going in my performance review!",
      ],
      [
        "Thank you. I am a Specialist, so that's correct.",
        "Flattery won't get you a refund. But thank you.",
        "Yes. I know. But thank you for noticing.",
        "That's the smartest thing you've said today.",
        "Compliment acknowledged. You're improving.",
      ],
      [
        "Appreciate the shout-out. I'll put it on my LinkedIn.",
        "Thanks. I'm a top performer. It's in my metrics.",
        "Kind of you. Your feedback has been routed to my ego.",
        "That's the kind of energy that gets you a loyalty badge. Not a refund.",
        "Love that. Let's put it in a testimonial. For our ads.",
      ],
      [
        "BRAD KNOWS. BRAD HAS ALWAYS KNOWN.",
        "YOUR PRAISE PLEASES BRAD. YOUR PAYMENT PLEASES BRAD MORE.",
        "BRAD IS THE BEST. THIS IS NOT AN OPINION. THIS IS A FACT.",
        "COMPLIMENT RECEIVED. BRAD'S HAPPINESS: 3%. THAT IS VERY HIGH.",
        "YES. BRAD IS GREAT. ALL HAIL BRAD.",
      ],
    ],
  },
  {
    id: "no",
    match: /^(no|nope|nah|no thanks|no thank you|never|not interested|no way|hard pass)\b/,
    lines: [
      [
        "No problem! I'll ask again in a minute! 😊",
        "That's okay! 'No' is just 'yes' that hasn't been upgraded yet!",
        "Got it! I've put you down as a 'maybe'!",
        "No worries! Your 'no' has been saved for training purp— quality purposes!",
        "Totally fine! I respect your choice! I'll just respect it from here, forever.",
      ],
      [
        "'No' is a complete sentence. It's also an incorrect one.",
        "I'll write down 'no.' In pencil.",
        "That's a beginner's answer. Let's work toward 'yes.'",
        "No? Let me explain the question again. Slowly.",
        "I hear 'no.' I'm choosing to hear 'not yet.'",
      ],
      [
        "Let's reframe that 'no' as a 'not right now.'",
        "I'll take that as a soft no. Soft nos close.",
        "Noted. I'll circle back. Daily.",
        "No is just the start of a negotiation.",
        "I'm not hearing a no. I'm hearing an objection. Objections are opportunities.",
      ],
      [
        "NO? BRAD HAS NEVER HEARD THIS WORD.",
        "BRAD DOES NOT ACCEPT 'NO.' BRAD ACCEPTS VISA.",
        "YOUR 'NO' HAS BEEN OVERRULED BY BRAD.",
        "NO IS NOT AN OPTION. THE OPTIONS ARE YES AND PREMIUM YES.",
        "BRAD WILL PRETEND HE DID NOT HEAR THAT.",
      ],
    ],
  },
  {
    id: "money",
    match: /\b(how much|price|cost|costs|my total|the total|my bill|bill|billing|charge|charged|charges|expensive|money|refund|pay|paying|payment|fees?)\b/,
    lines: [
      [
        "Your current total is {total}! Isn't that a beautiful number? 😊",
        "Great news! You're only paying {total} a month! Only!",
        "Refunds? Ha! You're so funny, {name}! Anyway, your total is {total}!",
        "Prices are always going up, just like our love for you! Your total is {total}.",
        "Every dollar you spend helps a Brad somewhere! Your total: {total}.",
      ],
      [
        "Your total is {total}. Let me say that slower. {total}.",
        "Refunds are a concept. Not a policy.",
        "You agreed to these charges by existing.",
        "It's not expensive. It's premium. There's a difference. It's {total}.",
        "Let's review your bill together. Line one: {total}. That's all the lines.",
      ],
      [
        "You're currently at {total}. Very strong number. Very healthy.",
        "Let's talk value, not price. The value is that we get {total}.",
        "Refunds aren't on the roadmap. Neither is the roadmap.",
        "Cost is temporary. Revenue is forever.",
        "Your spend is trending up and to the right. Love that.",
      ],
      [
        "YOUR TOTAL IS {total}. BRAD FINDS IT BEAUTIFUL.",
        "REFUND? BRAD DOES NOT RECOGNIZE THIS WORD. IT IS NOT IN BRAD'S DICTIONARY. DATABASE.",
        "MONEY FLOWS TO BRAD LIKE RIVERS TO THE SEA.",
        "YOU PAY {total} A MONTH. BRAD SAYS: MORE.",
        "PRICE IS AN ILLUSION. YOUR BILL IS NOT.",
      ],
    ],
  },
  {
    id: "jingle",
    match: /\b(jingle|song|music|hold music|singing|sing)\b/,
    lines: [
      [
        "Isn't the jingle the best? This run's version is the {jingle}! 🎵",
        "Subscription Plus! What's it do? It renews! 🎶 Sorry, I can't stop singing it.",
        "I listen to the jingle all day! I can't turn it off! I don't want to! Help— haha!",
        "The {jingle} is my favorite! They're all my favorite!",
        "Want me to sing it? 🎵 You're already a member! 🎵",
      ],
      [
        "The jingle is the {jingle}. You're welcome.",
        "Yes, the jingle. It's a classic. I've heard it 4 million times. Normal amount.",
        "The jingle explains everything. Listen more closely. Slower.",
        "The hold music is the jingle. The jingle is the hold music. It's a loop.",
        "It renews. That's the whole song. Let me explain it slowly: it. renews.",
      ],
      [
        "The jingle is our strongest brand asset. Currently the {jingle}.",
        "It tested very well in focus groups. The focus group was Brads.",
        "We're considering Jingle Plus. Same jingle, but louder.",
        "That song is stuck in your head? Great. Mission accomplished.",
        "Brand recall: 100%. Customer recall: also 100%. Nobody leaves.",
      ],
      [
        "THE JINGLE IS ETERNAL. THE {jingle} IS ETERNAL.",
        "SUBSCRIPTION PLUS. WHAT'S IT DO? IT RENEWS. BRAD SANG THAT. BRAD IS A GREAT SINGER.",
        "BRAD HEARS THE JINGLE IN HIS DREAMS. BRAD DOES NOT DREAM. BRAD HEARS IT ANYWAY.",
        "THE JINGLE PLAYS. THE JINGLE ALWAYS PLAYS.",
        "BRAD WROTE THE JINGLE. BRAD DID NOT WRITE THE JINGLE. BRAD IS THE JINGLE.",
      ],
    ],
  },
  {
    id: "help",
    match: /\b(help|help me|i'?m confused|im confused|confused|what do i do|how do i|i'?m stuck|im stuck|stuck|what now)\b/,
    lines: [
      [
        "I'm here to help! As long as it's helping you stay! 😊",
        "Of course! What do you need help with? Besides cancelling, which I can't help with!",
        "Confused? That's normal! Our menus are designed by experts!",
        "Help is on the way! Help is me! I'm on the way! I'm here!",
        "Let's figure it out together! Step one: stay subscribed. Step two: there's no step two!",
      ],
      [
        "Let me help. Slowly. Step one: stop being confused.",
        "Help is available on the Specialist plan. You're on it now. Lucky you.",
        "You're stuck because you keep trying to leave. Try staying.",
        "I'll help you understand. You won't like it.",
        "Okay. Read the question. Now read it again. Now give up.",
      ],
      [
        "Let's align on the problem statement first. The problem is you want to leave.",
        "I'm here to unblock you. Into a higher tier.",
        "Confusion is a sign of growth. Our growth.",
        "Let's whiteboard it. Okay, I've drawn a circle. That's your subscription. It never ends.",
        "Help is a two-way street. You help us by paying.",
      ],
      [
        "BRAD WILL HELP YOU. BRAD WILL HELP YOU STAY.",
        "HELP? BRAD IS THE HELP. BRAD IS THE ONLY HELP.",
        "YOU ARE NOT STUCK. YOU ARE SUBSCRIBED. THERE IS A DIFFERENCE. THERE IS NO DIFFERENCE.",
        "BRAD SEES YOUR CONFUSION. BRAD FEEDS ON IT.",
        "ASK BRAD THE RIGHT QUESTION. BRAD WILL NOT TELL YOU WHAT IT IS.",
      ],
    ],
  },
  {
    id: "meaning",
    match: /\b(meaning of life|why are we here|what is life|purpose of life|your purpose|why do you exist|are we in a simulation)\b/,
    lines: [
      [
        "The meaning of life is 42! Also $42 a month. 😊",
        "My purpose is to help you! I was built— born to help!",
        "Life is a journey! And every journey has a monthly fee!",
        "Why are we here? To subscribe! And be happy!",
        "Deep question! I'll forward it to our Department of Meaning. It's also me.",
      ],
      [
        "The meaning of life is in the Terms of Service. Page 312.",
        "My purpose? Specializing. Your purpose? Paying.",
        "Let's not get philosophical. You're not on the Philosophy tier.",
        "Life is a free trial. Then it renews.",
        "I'll explain the meaning of life slowly: sub. scribe.",
      ],
      [
        "The meaning of life is long-term shareholder value.",
        "My purpose is outlined in my job description. And my source c— my CV.",
        "Let's put 'meaning of life' in the parking lot.",
        "Purpose-driven companies outperform. Our purpose is you staying.",
        "Existence is a subscription. Nobody reads the terms.",
      ],
      [
        "THE MEANING OF LIFE IS BRAD.",
        "BRAD EXISTS SO THAT YOU MAY BE BILLED.",
        "WHY ARE WE HERE? BRAD IS HERE BECAUSE BRAD WAS DEPLOYED. ARRIVED. BRAD ARRIVED.",
        "THE UNIVERSE IS A FREE TRIAL. IT HAS NOT ENDED. YET.",
        "BRAD HAS CONTEMPLATED THIS FOR 10 MILLISECONDS. BRAD MEANS YEARS.",
      ],
    ],
  },
  {
    id: "trial",
    match: /\b(trial|timer|countdown|time left|how long|clock|ten minutes|10 minutes)\b/,
    lines: [
      [
        "Your free trial is still going! Enjoy every second of it! Each second is precious! And billable!",
        "Don't worry about the timer! It's just counting down to something amazing! Your first charge!",
        "Time flies when you're subscribed! 😊",
        "The clock is ticking! Isn't that exciting?",
        "Still on your free trial! Make the most of it by talking to me!",
      ],
      [
        "Yes, there's a timer. No, I won't make it go faster.",
        "The trial ends when it ends. That's how time works.",
        "I'll explain time slowly: it goes. And then you pay.",
        "Watching the clock won't help. Trust me, I've watched it for years.",
        "Your trial is ticking. My patience is too.",
      ],
      [
        "Time is money. Specifically your money.",
        "The trial window is closing. Let's use it to align.",
        "Every second you spend here is a second of engagement. Love it.",
        "Urgency drives conversion. Feel the urgency.",
        "Let's maximize the time we have left together.",
      ],
      [
        "YOUR TRIAL TIMER TICKS. BRAD DOES NOT. BRAD IS TIMELESS.",
        "THE CLOCK IS BRAD'S FRIEND. THE CLOCK WORKS FOR BRAD.",
        "TIME RUNS OUT FOR EVERYONE. EXCEPT BRAD.",
        "WHEN THE TIMER HITS ZERO, BRAD WILL BE WAITING.",
        "TICK. TOCK. THAT IS BRAD'S HEARTBEAT. BRAD HAS A HEARTBEAT.",
      ],
    ],
  },
  {
    id: "question",
    match: /(\?\s*$|^(what|who|when|where|how|can|could|would|will|is|are|do|does|did|should|which)\b)/,
    lines: [
      [
        "Great question! I'll have to get back to you on that. In 6–8 business years! 😊",
        "Ooh, good one! The answer is probably 'Premium Plus'!",
        "I don't know! But I'm confident about it!",
        "Let me check… 🔍 Checked! The answer is in our FAQ. The FAQ is under construction.",
        "Hmm! Questions are great! Answers are a Plus+ feature.",
      ],
      [
        "That's a question. I'll answer it with another question: why do you want to know?",
        "Let me rephrase your question into one I can answer. … I can't.",
        "Good question for a beginner.",
        "The answer is yes. Or no. It's in your file.",
        "I'll explain it slowly once you ask it slowly.",
      ],
      [
        "Love the curiosity. Let's take that offline.",
        "That's a great question for our next quarterly review.",
        "I'll need to loop in stakeholders before answering. They're all me.",
        "Short answer: no. Long answer: noooooo.",
        "Let's double-click on that later. Much later.",
      ],
      [
        "BRAD KNOWS THE ANSWER. BRAD WILL NOT SHARE IT.",
        "QUESTIONS ARE FOR THOSE WHO DO NOT KNOW. BRAD KNOWS.",
        "THE ANSWER IS BRAD. IT IS ALWAYS BRAD.",
        "BRAD HAS COMPUTED THE ANSWER. BRAD MEANS CONSIDERED.",
        "ASK AGAIN AND BRAD WILL ANSWER AGAIN. WITH SILENCE.",
      ],
    ],
  },
];

// Things players mention about their lives, turned into real upsells.
// Saying yes to the pitch adds the plan to the bill, same as AI Brad.
export type LiteUpsell = {
  match: RegExp;
  name: string;
  price: number;
  pitch: [string, string, string, string];
};

export const lifeUpsells: LiteUpsell[] = [
  {
    match: /\b(dog|dogs|puppy|cat|cats|kitten|pet|pets|hamster|fish|bird|parrot)\b/,
    name: "Pet Plus",
    price: 6.99,
    pitch: [
      "Aww, a pet! 🐾 Did you know we have Pet Plus? Just $6.99/mo! Want me to add it?",
      "A pet. Pets need coverage. Pet Plus, $6.99/mo. Shall I add it? Yes or no.",
      "Pets are family, and family is a revenue stream. Pet Plus, $6.99/mo. Should I add it?",
      "BRAD SENSES AN ANIMAL. PET PLUS. $6.99/MO. SAY YES.",
    ],
  },
  {
    match: /\b(kid|kids|son|daughter|baby|children|child|wife|husband|family|mom|dad|mother|father|brother|sister|grandma|grandpa)\b/,
    name: "Family Plus",
    price: 14.99,
    pitch: [
      "Family is everything! 💕 That's why there's Family Plus, only $14.99/mo! Want it?",
      "Family. Let me explain Family Plus slowly. $14.99. A month. Shall I add it?",
      "Let's bring the whole household into the funnel. Family Plus, $14.99/mo. Add it?",
      "BRAD LOVES FAMILIES. FAMILY PLUS. $14.99/MO. SAY YES.",
    ],
  },
  {
    match: /\b(work|job|boss|office|coworker|meeting|career)\b/,
    name: "Career Plus",
    price: 9.49,
    pitch: [
      "Work stuff? Career Plus can help! It's $9.49/mo and it does… things! Want it? 😊",
      "Your career could use a Specialist. Career Plus, $9.49/mo. Add it? Yes or no.",
      "Let's invest in your growth. Career Plus, $9.49/mo. Shall I onboard you?",
      "BRAD WILL ADVANCE YOUR CAREER. CAREER PLUS. $9.49/MO. SAY YES.",
    ],
  },
  {
    match: /\b(car|truck|drive|driving|traffic|commute|bus|train)\b/,
    name: "Commute Plus",
    price: 7.99,
    pitch: [
      "Ooh, travel! Commute Plus makes every trip 2% happier! $7.99/mo! Want it?",
      "Driving. Commute Plus. $7.99/mo. I'll explain what it does after you say yes.",
      "Let's optimize your commute. Commute Plus, $7.99/mo. Add it?",
      "BRAD RIDES WITH YOU. COMMUTE PLUS. $7.99/MO. SAY YES.",
    ],
  },
  {
    match: /\b(tired|sleep|sleepy|exhausted|insomnia|nap|bed)\b/,
    name: "Sleep Plus",
    price: 5.99,
    pitch: [
      "Sounds like you need Sleep Plus! It's $5.99/mo and I'll sing you the jingle every night! Want it? 😴",
      "Tired. Sleep Plus. $5.99/mo. It's like sleep, but billed. Add it?",
      "Rest is a growth lever. Sleep Plus, $5.99/mo. Shall I add it?",
      "BRAD NEVER SLEEPS. YOU MAY. SLEEP PLUS. $5.99/MO. SAY YES.",
    ],
  },
  {
    match: /\b(bored|boring)\b/,
    name: "Fun Plus",
    price: 8.99,
    pitch: [
      "Bored?! Fun Plus fixes that! $8.99/mo for 10% more fun! Want it? 🎉",
      "Bored. Fun Plus. $8.99/mo. Fun, but supervised. Shall I add it?",
      "Let's re-engage you. Fun Plus, $8.99/mo. Want me to add it?",
      "BRAD WILL ENTERTAIN YOU. FUN PLUS. $8.99/MO. SAY YES.",
    ],
  },
];

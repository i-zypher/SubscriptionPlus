export type CloseTrick =
  | "bottom"
  | "tinyX"
  | "confirmshame"
  | "countdown"
  | "fakeX"
  | "dodge"
  | "twoButtons"
  | "spawner"

export type Ad = {
  headline: string
  body: string
  cta: string
  decline: string
}

export const ads: Ad[] = [
  {
    headline: "🎉 CONGRATULATIONS! 🎉",
    body: "You are our 1,000,000th visitor! Claim your prize: a free month of Subscription Plus (renews automatically).",
    cta: "CLAIM MY PRIZE",
    decline: "No thanks, I don't like winning",
  },
  {
    headline: "Doctors HATE This One Weird Subscription",
    body: "Local man saves $0 a month with this simple trick. Subscription companies don't want you to know!",
    cta: "SHOW ME THE TRICK",
    decline: "No thanks, I prefer being unhealthy",
  },
  {
    headline: "Only 1% of People Can Close This Ad",
    body: "Are you smart enough? Most people aren't. Prove it.",
    cta: "I'M IN THE 1%",
    decline: "I'm in the 99%",
  },
  {
    headline: "Download More RAM",
    body: "Is your device slow? Subscribe to RAM Plus and get up to 0 GB of extra memory, instantly.",
    cta: "DOWNLOAD RAM",
    decline: "No thanks, I enjoy lag",
  },
  {
    headline: "Get 10% Off Your Subscription!",
    body: "Sign up for our newsletter and save 10% on the subscription you're already paying for. Newsletter is $2.99/mo.",
    cta: "SIGN ME UP",
    decline: "No thanks, I hate saving money",
  },
  {
    headline: "Single Subscriptions In Your Area",
    body: "Lonely? There are 12 single subscriptions within 5 miles of you, and they all want your card number.",
    cta: "MEET THEM",
    decline: "No thanks, I'm already in a committed subscription",
  },
  {
    headline: "Rate Us 5 Stars! ⭐⭐⭐⭐⭐",
    body: "Enjoying Subscription Plus? Of course you are. You're subscribed.",
    cta: "⭐⭐⭐⭐⭐",
    decline: "I'm not enjoying it (this will be reported)",
  },
  {
    headline: "You Left Something In Your Cart!",
    body: "You have 1 item waiting: Subscription Plus. Complete your purchase before it renews!",
    cta: "COMPLETE PURCHASE",
    decline: "No thanks, I abandon things",
  },
  {
    headline: "Your Free Trial Is Almost Over!",
    body: "Upgrade now to keep enjoying the free trial you're currently enjoying. Upgrading extends your trial by 0 days.",
    cta: "EXTEND MY TRIAL",
    decline: "No thanks, I like things ending",
  },
  {
    headline: "Brad Wants To Be Your Friend 👋",
    body: "Brad from Customer Support has sent you a friend request. Accepting is free. Being Brad's friend is $3.99/mo.",
    cta: "ACCEPT BRAD",
    decline: "Decline (Brad will be notified)",
  },
  {
    headline: "This Subscription Pays For Itself!",
    body: "Studies show Subscription Plus pays for itself in just 400 years. Start saving today!",
    cta: "START SAVING",
    decline: "No thanks, I'll pay full price forever",
  },
  {
    headline: "⚡ FLASH SALE ⚡ 0% OFF EVERYTHING",
    body: "For a limited time only, everything is exactly the same price. Act fast, this deal ends never!",
    cta: "GET THE DEAL",
    decline: "No thanks, I'll wait for 0% off later",
  },
  {
    headline: "Spin The Wheel To Win! 🎡",
    body: "Every spin is a winner! Prizes include: Premium Plus, Premium Plus Ultra, and Premium Plus Ultra (Family Plan).",
    cta: "SPIN NOW",
    decline: "No thanks, I don't want to win a subscription",
  },
  {
    headline: "We Value Your Privacy 🍪",
    body: "We use cookies to improve your experience. And to remember you. Forever. Accept all cookies to continue being remembered.",
    cta: "ACCEPT ALL COOKIES",
    decline: "Reject all (cookies will be sad)",
  },
  {
    headline: "Bundle & Save!",
    body: "Add Subscription Plus to your Subscription Plus and save 15% on your second Subscription Plus!",
    cta: "BUNDLE ME",
    decline: "No thanks, one Subscription Plus is enough (it isn't)",
  },
  {
    headline: "10 Subscriptions You Didn't Know You Had",
    body: "Number 7 will shock you! (Number 7 is this one.)",
    cta: "SEE THE LIST",
    decline: "No thanks, I prefer not knowing",
  },
  {
    headline: "⚠️ Only 2 Left In Stock!",
    body: "Subscription Plus is digital and infinite, but somehow only 2 are left. Hurry before they're gone forever.",
    cta: "GRAB ONE",
    decline: "No thanks, let someone else have it",
  },
  {
    headline: "🔥 4,812 People Are Looking At This Right Now",
    body: "And every single one of them clicked close. Be different. Click buy.",
    cta: "BE DIFFERENT",
    decline: "No thanks, I'm a follower",
  },
  {
    headline: "Pull The Pin! 99% Fail This Level",
    body: "Help Brad escape his subscription before the lava reaches him! (This game does not exist. Brad does not escape.)",
    cta: "PLAY NOW",
    decline: "No thanks, Brad can handle it",
  },
  {
    headline: "BUT WAIT, THERE'S MORE!",
    body: "Order now and we'll DOUBLE your subscription! Just pay separate processing, handling, and renewal.",
    cta: "DOUBLE IT",
    decline: "No thanks, one is plenty",
  },
  {
    headline: "Earn $5,000 A Month From Home!",
    body: "Just refer friends to Subscription Plus! Starter kit only $299. Results not typical. Results not possible.",
    cta: "BE MY OWN BOSS",
    decline: "No thanks, I like having friends",
  },
  {
    headline: "Which Subscription Tier Are You?",
    body: "Take our 40-question personality quiz to find out! (Spoiler: it's the most expensive one.)",
    cta: "TAKE THE QUIZ",
    decline: "No thanks, I know who I am",
  },
  {
    headline: "Your Horoscope Says: Stay Subscribed ♈",
    body: "Mercury is in renewal. Avoid big decisions this month, especially cancelling things.",
    cta: "READ MY FORTUNE",
    decline: "No thanks, I make my own destiny",
  },
  {
    headline: "Influencers Are OBSESSED With This",
    body: "\"I literally cannot stop paying for it.\" — someone we paid",
    cta: "JOIN THE TREND",
    decline: "No thanks, I'm not influenced",
  },
  {
    headline: "SPONSORED: Is Cancelling Bad For Your Health?",
    body: "Leading experts (us) say yes. Read the full article for just $1.99.",
    cta: "READ MORE",
    decline: "No thanks, I'll risk it",
  },
  {
    headline: "FREE SHIPPING On Your Subscription!",
    body: "Every month, we'll ship absolutely nothing to your door, free of charge.",
    cta: "SHIP IT",
    decline: "No thanks, I'll pick up nothing myself",
  },
  {
    headline: "You Have 0 Plus Points!",
    body: "Earn 1 point for every $1,000 spent. Redeem 5,000 points for a sticker that says \"Subscribed.\"",
    cta: "EARN POINTS",
    decline: "No thanks, I don't collect stickers",
  },
  {
    headline: "Get The App! 📱",
    body: "Subscription Plus is better in the app. You're already in the app. Download it again anyway.",
    cta: "DOWNLOAD AGAIN",
    decline: "No thanks, once was enough",
  },
  {
    headline: "Quick Survey! (2 Minutes)",
    body: "Question 1 of 87: How likely are you to recommend Subscription Plus to a friend you don't like?",
    cta: "START SURVEY",
    decline: "No thanks, I have opinions but I'm keeping them",
  },
  {
    headline: "Protect Your Subscription!",
    body: "Add SubscriptionCare+ and get coverage against accidental cancellation. Only $6.99/mo.",
    cta: "PROTECT IT",
    decline: "No thanks, I live dangerously",
  },
]

export const exitAds: Ad[] = [
  {
    headline: "WAIT! Before You Go…",
    body: "Here's an exclusive offer just for leavers: stay subscribed and pay the same price!",
    cta: "I'LL STAY",
    decline: "No, really, I'm leaving",
  },
  {
    headline: "Are You SURE?",
    body: "Closing this ad will make the other ads sad. 🥺",
    cta: "KEEP IT OPEN",
    decline: "I'm sure",
  },
]
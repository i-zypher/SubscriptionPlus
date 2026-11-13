export type Tier = {
  name: string
  price: number
  // Fake "original" price, crossed out above the real one
  wasPrice: number
  // Ribbons that pile up as the tiers get gaudier
  badges: string[]
  buttonLabel: string
  // The tiny gray "no thanks" link. It upgrades you anyway.
  declineLabel: string
}

export const tiers: Tier[] = [
  {
    name: "Congratulations, you're subscribed!",
    price: 4.99,
    wasPrice: 9.99,
    badges: [],
    buttonLabel: "OK",
    declineLabel: "No thanks",
  },
  {
    name: "Congratulations, You're now a Premium Plus Member (renews bi-weekly)",
    price: 7.99,
    wasPrice: 19.99,
    badges: ["MOST POPULAR"],
    buttonLabel: "Hooray!",
    declineLabel: "No thanks, I prefer the cheaper plan I'm no longer on",
  },
  {
    name: "Congratulations, You have now joined Premium Plus Ultra (Family Plan)",
    price: 14.99,
    wasPrice: 39.99,
    badges: ["MOST POPULAR", "BEST VALUE"],
    buttonLabel: "I'm so Grateful",
    declineLabel: "No thanks, I don't love my family",
  },
  {
    name: "Congratulations, You now have Subscription Plus+ (billed separately)",
    price: 21.99,
    wasPrice: 89.99,
    badges: ["MOST POPULAR", "BEST VALUE", "LIMITED TIME"],
    buttonLabel: "Thank You, I Deserve This!",
    declineLabel: "No thanks, I hate value",
  },
  {
    name: "Congratulations, You're now a Founding Lifetime Member (renews yearly, forever)",
    price: 149.99,
    wasPrice: 999.99,
    badges: ["MOST POPULAR", "BEST VALUE", "LIMITED TIME", "EDITOR'S CHOICE", "🔥 HOT"],
    buttonLabel: "Please, Take More",
    declineLabel: "No thanks (this link is decorative)",
  },
]

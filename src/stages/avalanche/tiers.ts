 export type Tier = {
  name: string
  price: number
  buttonLabel: string
}
 export const tiers: Tier[] = [
 
  {
    name: "Congratulations, you're subscribed!",
    price: 4.99,
    buttonLabel: "OK",
  },


  {
   name:"Congratulations, You're now a Premium Plus Member (renews bi-weekly)",
   price: 7.99,
   buttonLabel: "Hooray!",
  },

  {
   name: "Congratulations, You have now joined Premium Plus Ultra (Family Plan)",
   price: 14.99,
   buttonLabel: "I'm so Grateful",
  },

  {
   name: "Congratulations, You now have Subscription Plus+ (billed separately)",
   price: 21.99,
   buttonLabel: "Thank You, I Deserve This!",
  },

  {
   name: "Congratulations, You're now a Founding Lifetime Member (renews yearly, forever)",
   price: 149.99,
   buttonLabel: "Please, Take More",
  },
]


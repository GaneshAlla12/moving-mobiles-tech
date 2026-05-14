export const business = {
  name: "Moving Mobiles Tech",
  shortName: "Moving Mobiles",
  tagline: "We'll fix it — fast!",
  heroHeadline: "Fast, expert mobile & device repairs in Wilton, CT.",
  heroSubhead:
    "From cracked screens to motherboard-level repairs — book a same-day appointment with the team trusted by 80+ five-star reviewers across Connecticut.",
  founded: "Founded in Danbury, CT",
  rating: { score: 4.9, count: 81, source: "Google" },
  contact: {
    phone: "+12037609223",
    phoneDisplay: "(203) 760-9223",
    email: "support@movingmobiles.com",
    address: {
      street: "13 Danbury Rd",
      city: "Wilton",
      state: "CT",
      zip: "06897",
      country: "USA",
    },
    hoursDisplay: "Open daily · Closes 7 PM",
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Moving+Mobiles+Tech+13+Danbury+Rd+Wilton+CT+06897",
  },
  // Replace with the real Calendly link once the user sets it up.
  // e.g. "https://calendly.com/moving-mobiles/repair-appointment"
  calendlyUrl: "https://calendly.com/your-link/repair-appointment",
} as const;

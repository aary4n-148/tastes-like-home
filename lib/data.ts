export interface Chef {
  id: string
  name: string
  photo: string
  foodPhotos: string[]
  cuisines: string[]
  hourlyRate: number
  phone: string
  verified: boolean
  bio: string
  // Location fields - optional since they might not be set
  location?: string
  latitude?: number
  longitude?: number
}

export const chefs: Chef[] = [
  {
    id: "gurpreet-kaur",
    name: "Gurpreet Kaur",
    photo: "/chefs/gurpreet-kaur.png",   
    foodPhotos: [
      "/food/black-dhal.webp",
      "/food/chana-masala.webp",
      "/food/aloo-ghobi.webp",
      "/food/palak-paneer.webp"
    ],
    cuisines: ["Punjabi Homestyle", "Vegetarian", "Rotis"],
    hourlyRate: 14,
    phone: "+447712345601",
    verified: true,
    bio: `Sat sri akaal! I'm Gurpreet, a Punjabi housewife who cooks honest, everyday veg meals—dal, chana masala, aloo gobi, the food we eat at home. I'm free any time, three days a week, and I'm happy to travel up to half an hour around Hounslow. While the sabzi simmers, I can also tidy the kitchen or help with light house-cleaning, so you can just enjoy the food.`,
  },
  {
    id: "arshjit-singh",
    name: "Arshjit Singh",
    photo: "/chefs/arshjit-singh.jpg",
    foodPhotos: [
      "/food/butter-chicken.webp",
      "/food/papdi-chaat.webp",
      "/food/samosas.webp",
      "/food/chicken-65.webp",
      "/food/chole-bhature.webp"
    ],
    cuisines: ["Punjabi Non-Veg", "Butter Chicken", "Party Buffets", "Chaat"],
    hourlyRate: 14,
    phone: "+447712345602",
    verified: true,
    bio: `Hello ji, Arshjit here. Weekends I run big Punjabi party buffets, but Monday to Friday I'm ready to bring the same flavour to your home. From buttery chicken and crisp papdi chaat to quick weeknight meals, I cook fast, clean and exactly how you like. I drive all over West London, so just give me the postcode and the menu idea—I'll handle the rest.`,
  },
  {
    id: "manpreet-bains",
    name: "Manpreet Bains",
    photo: "/chefs/manpreet-bains.png",
    foodPhotos: [
      "/food/paneer-tikka.webp",
      "/food/shami-kebab.webp",
      "/food/tandoori-chicken.webp",
      "/food/lamb-curry.webp"
    ],
    cuisines: ["Non-Veg", "Tandoori", "Kebab"],
    hourlyRate: 13,
    phone: "+447712345603",
    verified: false,
    bio: `Hi, I'm Manpreet, born in Punjab, settled in Southall. I love slow-cooking chicken, lamb, paneer and barbecue dishes that make the whole house smell like home. Daytimes any day suit me best; bus rides are no problem. Need a hand with ironing or a quick kitchen clean-up? I'm glad to help while the curry bubbles.`,
  },
  {
    id: "hinal-patel",
    name: "Hinal Patel",
    photo: "/chefs/hinal-patel.jpg",
    foodPhotos: [
      "/food/dhokla.webp",
      "/food/kadhi.webp",
      "/food/thepla.webp"
    ],
    cuisines: ["Gujarati", "Pure Veg"],
    hourlyRate: 17,
    phone: "+447712345604",
    verified: true,
    bio: `Namaste, I'm Hinal from Ealing. Mondays and Wednesdays I'm free to cook soft dhokla, light kadhi, thepla and other Gujarati favourites—simple, fresh, kid-friendly. I can watch little ones and keep the house neat too. English reading is tough for me, so a quick voice note or WhatsApp call works best.`,
  },
  {
    id: "kishan-shah",
    name: "Kishan Shah",
    photo: "/chefs/kishan-shah.png",
    foodPhotos: [
      "/food/chilli-chicken.webp",
      "/food/dhal.webp",
      "/food/chicken-curry.webp",
      "/food/rajma.webp"
    ],
    cuisines: ["Non-Veg", "Chicken", "Sabzi"],
    hourlyRate: 19,
    phone: "+447712345605",
    verified: false,
    bio: `Hello, I'm Kishan. I cook clean, low-oil Indian food—chilli chicken, gentle dals, homestyle chicken curry—nothing fancy, just tasty and good for you. Looking for steady work three to four days a week around Hounslow or Whitton. Tell me what you fancy; I'll shop, cook, and leave your kitchen spotless.`,
  },
  {
    id: "anita-nair",
    name: "Anita Nair",
    photo: "/chefs/anita-nair.png",
    foodPhotos: [
      "/food/dosa.webp",
      "/food/idli.webp",
      "/food/fish-curry.webp"
    ],
    cuisines: ["South Indian", "Dosa / Idli","Sambar"],
    hourlyRate: 14,
    phone: "+447712345606",
    verified: true,
    bio: `Vanakkam! I'm Anita, trained in restaurants but happiest making fresh dosa, fluffy idli and spicy fish curry the Kerala way. I'm on the move with my tawa and grinder every Thursday and Friday and can travel across West London. Need kids minded, clothes ironed or rooms swept while batter ferments? Consider it done—good food and a neat home together.`,
  },
]

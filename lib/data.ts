export interface Chef {
  id: string
  name: string
  photo: string
  foodPhotos: string[]
  cuisines: string[]
  hourlyRate: number
  phone: string
  verified: boolean
}

export const chefs: Chef[] = [
  {
    id: "gurpreet-kaur",
    name: "Gurpreet Kaur",
    photo: "/chefs/gurpreet-kaur.jpg",   // Unsplash portrait
    foodPhotos: [],
    cuisines: ["Punjabi Homestyle", "Vegetarian", "Tandoori Rotis"],
    hourlyRate: 14,
    phone: "+447712345601",
    verified: true,
  },
  {
    id: "arshjit-singh",
    name: "Arshjit Singh",
    photo: "/chefs/arshjit-singh.jpg",
    foodPhotos: [],
    cuisines: ["Punjabi Non-Veg", "Butter Chicken", "Party Buffets"],
    hourlyRate: 14,
    phone: "+447712345602",
    verified: true,
  },
  {
    id: "manpreet-bains",
    name: "Manpreet Bains",
    photo: "/chefs/manpreet-bains.jpg",
    foodPhotos: [],
    cuisines: ["Punjabi Street-Food", "Chole Bhature", "Chaat"],
    hourlyRate: 13,
    phone: "+447712345603",
    verified: false,
  },
  {
    id: "hinal-patel",
    name: "Hinal Patel",
    photo: "/chefs/hinal-patel.jpg",
    foodPhotos: [],
    cuisines: ["Gujarati Thali", "Farsan", "Pure Veg"],
    hourlyRate: 17,
    phone: "+447712345604",
    verified: true,
  },
  {
    id: "kishan-shah",
    name: "Kishan Shah",
    photo: "/chefs/kishan-shah.jpg",
    foodPhotos: [],
    cuisines: ["Gujarati Jain", "Undhiyu", "Sweets"],
    hourlyRate: 19,
    phone: "+447712345605",
    verified: false,
  },
  {
    id: "anita-nair",
    name: "Anita Nair",
    photo: "/chefs/anita-nair.jpg",
    foodPhotos: [],
    cuisines: ["South Indian", "Kerala Fish Curry", "Dosa / Idli"],
    hourlyRate: 14,
    phone: "+447712345606",
    verified: true,
  },
]

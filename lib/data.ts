export interface Chef {
  id: string
  name: string
  photo: string
  cuisines: string[]
  hourlyRate: number
  phone: string
  verified: boolean
}

export const chefs: Chef[] = [
  {
    id: "1",
    name: "Priya Sharma",
    photo: "/placeholder.svg?height=300&width=400",
    cuisines: ["North Indian", "Punjabi", "Vegetarian"],
    hourlyRate: 25,
    phone: "+447123456789",
    verified: true,
  },
  {
    id: "2",
    name: "Rajesh Patel",
    photo: "/placeholder.svg?height=300&width=400",
    cuisines: ["Gujarati", "Street Food", "Sweets"],
    hourlyRate: 22,
    phone: "+447234567890",
    verified: true,
  },
  {
    id: "3",
    name: "Meera Reddy",
    photo: "/placeholder.svg?height=300&width=400",
    cuisines: ["South Indian", "Andhra", "Dosas"],
    hourlyRate: 28,
    phone: "+447345678901",
    verified: false,
  },
  {
    id: "4",
    name: "Amit Kumar",
    photo: "/placeholder.svg?height=300&width=400",
    cuisines: ["Bengali", "Fish Curry", "Sweets"],
    hourlyRate: 30,
    phone: "+447456789012",
    verified: true,
  },
  {
    id: "5",
    name: "Sunita Joshi",
    photo: "/placeholder.svg?height=300&width=400",
    cuisines: ["Maharashtrian", "Vegan", "Traditional"],
    hourlyRate: 24,
    phone: "+447567890123",
    verified: true,
  },
  {
    id: "6",
    name: "Deepak Singh",
    photo: "/placeholder.svg?height=300&width=400",
    cuisines: ["Rajasthani", "Tandoor", "Spicy"],
    hourlyRate: 26,
    phone: "+447678901234",
    verified: false,
  },
]

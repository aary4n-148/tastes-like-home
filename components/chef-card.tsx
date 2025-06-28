import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"
import type { Chef } from "@/lib/data"

interface ChefCardProps {
  chef: Chef
}

export default function ChefCard({ chef }: ChefCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Chef Photo */}
      <div className="relative">
        <Image
          src={chef.photo || "/placeholder.svg"}
          alt={chef.name}
          width={400}
          height={300}
          className="w-full h-48 object-cover"
        />
        {chef.verified && (
          <Badge className="absolute top-3 right-3 bg-green-600 hover:bg-green-700">
            <Shield className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{chef.name}</h3>

        {/* Cuisines */}
        <div className="flex flex-wrap gap-1 mb-3">
          {chef.cuisines.map((cuisine) => (
            <Badge key={cuisine} variant="secondary" className="text-xs bg-orange-100 text-orange-700">
              {cuisine}
            </Badge>
          ))}
        </div>

        {/* Price */}
        <p className="text-lg font-bold text-orange-600 mb-4">From £{chef.hourlyRate} per hour</p>

        {/* View Button */}
        <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
          <Link href={`/chef/${chef.id}`}>View Chef</Link>
        </Button>
      </div>
    </div>
  )
}

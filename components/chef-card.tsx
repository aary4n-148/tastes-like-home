import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, ArrowRight, MapPin, Star } from "lucide-react"
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
          height={400}
          className="w-full aspect-square object-cover"
        />
        {chef.verified && (
          <Badge className="absolute top-3 right-3 bg-accent hover:bg-accent/90 text-accent-foreground">
            <Shield className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">{chef.name}</h3>

        {/* Rating Display */}
        {chef.avgRating && chef.reviewCount && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="font-semibold text-foreground">
                {chef.avgRating.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({chef.reviewCount} review{chef.reviewCount !== 1 ? 's' : ''})
            </span>
          </div>
        )}

        {/* Location */}
        {chef.location && (
          <div className="flex items-center gap-1 mb-3 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{chef.location}</span>
          </div>
        )}

        {/* Cuisines */}
        <div className="flex flex-wrap gap-1 mb-3">
          {chef.cuisines.map((cuisine) => (
            <Badge key={cuisine} variant="secondary" className="text-xs">
              {cuisine}
            </Badge>
          ))}
        </div>

        {/* Price */}
        <p className="text-lg font-bold text-primary mb-4">From £{chef.hourlyRate} per hour</p>

        {/* View Button */}
        <Button asChild className="w-full group bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 font-semibold text-primary-foreground border-0 h-12">
          <Link href={`/chef/${chef.id}`}>
            <span className="flex items-center justify-center gap-2">
              View Chef Profile
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </Button>
      </div>
    </div>
  )
}

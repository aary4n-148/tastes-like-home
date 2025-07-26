import { createSupabaseServerClient } from "@/lib/supabase-server"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MessageCircle, Shield } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"

interface ChefPageProps {
  params: Promise<{ id: string }>
}

export default async function ChefPage({ params }: ChefPageProps) {
  const { id } = await params
  
  // Check if environment variables are available (prevents build failures)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Chef Profile</h1>
        <p className="text-red-600">Environment variables not configured. Please set up Supabase environment variables.</p>
      </div>
    )
  }
  
  // Fetch chef data from Supabase database
  const supabase = await createSupabaseServerClient()
  
  const { data: chefData, error } = await supabase
    .from('chefs')
    .select(`
      id,
      name,
      bio,
      phone,
      hourly_rate,
      verified,
      photo_url,
      chef_cuisines(cuisine),
      food_photos(photo_url, display_order)
    `)
    .eq('id', id)
    .eq('verified', true) // Only show verified chefs
    .single()

  if (error || !chefData) {
    console.error('Error fetching chef:', error)
    notFound()
  }

  // Transform database data to match expected format
  const chef = {
    id: chefData.id,
    name: chefData.name,
    photo: chefData.photo_url || '/placeholder.svg',
    foodPhotos: chefData.food_photos
      ?.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      ?.map(p => p.photo_url) || [],
    cuisines: chefData.chef_cuisines?.map(c => c.cuisine) || [],
    hourlyRate: chefData.hourly_rate || 0,
    phone: chefData.phone || '',
    verified: chefData.verified,
    bio: chefData.bio || ''
  }

  const whatsappUrl = `https://wa.me/${chef.phone.replace(/\D/g, "")}`

  // Build ordered list of images: profile photo first, then food photos
  const images = [chef.photo, ...chef.foodPhotos]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to all chefs
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Carousel showing chef profile & food photos */}
            <div className="md:w-1/2 relative">
              <Carousel className="w-full">
                <CarouselContent>
                  {images.map((src) => (
                    <CarouselItem key={src}>
                      <Image
                        src={src}
                        alt={chef.name}
                        width={600}
                        height={600}
                        className="w-full h-64 md:h-full object-cover rounded-none"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>

            {/* Chef Details */}
            <div className="md:w-1/2 p-8">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{chef.name}</h1>
                {chef.verified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              {/* Cuisines */}
              <div className="flex flex-wrap gap-2 mb-6">
                {chef.cuisines.map((cuisine) => (
                  <Badge key={cuisine} variant="outline" className="border-orange-200 text-orange-700">
                    {cuisine}
                  </Badge>
                ))}
              </div>

              {/* Bio */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{chef.bio}</p>
              </div>

              {/* Pricing */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Starting Price</h2>
                <p className="text-3xl font-bold text-orange-600">£{chef.hourlyRate}</p>
                <p className="text-sm text-gray-500">per hour</p>
              </div>

              {/* Contact Button */}
              <Button asChild size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact on WhatsApp
                </a>
              </Button>

              {/* Discrete Terms of Use Link */}
              <div className="mt-4 text-center">
                <Link 
                  href="/terms" 
                  className="text-xs text-gray-400 hover:text-gray-600 hover:underline transition-colors"
                >
                  Terms of Use
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

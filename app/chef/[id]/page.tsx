import { createSupabaseServerClient } from "@/lib/supabase-server"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MessageCircle, Shield, MapPin, Clock, Users, Globe, Car, Calendar, Utensils, Home, Star, CheckCircle } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import ReviewForm from "@/components/review-form"
import ReviewList, { ReviewSummary } from "@/components/review-list"

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
      location_label,
      location,
      experience_years,
      availability,
      languages_spoken,
      travel_distance,
      frequency_preference,
      minimum_booking,
      special_events,
      house_help_services,
      dietary_specialties,
      chef_cuisines(cuisine),
      food_photos(photo_url, display_order)
    `)
    .eq('id', id)
    .eq('verified', true) // Only show verified chefs
    .single()

  // Enhanced data is now stored directly in the chef table

  if (error || !chefData) {
    console.error('Error fetching chef:', error)
    notFound()
  }

  // Fetch reviews for this chef
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('id, chef_id, rating, comment, reviewer_name, status, published_at, verified_at, created_at')
    .eq('chef_id', id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const reviews = reviewsData || []

  // Fetch rating statistics from materialized view
  const { data: ratingStats } = await supabase
    .from('chef_rating_stats')
    .select('review_count, avg_rating')
    .eq('chef_id', id)
    .single()

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
    bio: chefData.bio || '',
    location: chefData.location_label || undefined,
    latitude: undefined,
    longitude: undefined,
    // Add rating data from materialized view
    avgRating: ratingStats?.avg_rating || undefined,
    reviewCount: ratingStats?.review_count || undefined,
    // Enhanced profile data from chef table
    experienceYears: chefData.experience_years || null,
    availability: chefData.availability || null,
    frequencyPreference: chefData.frequency_preference || null,
    languagesSpoken: chefData.languages_spoken || null,
    travelDistance: chefData.travel_distance || null,
    specialEvents: chefData.special_events || null,
    houseHelpServices: chefData.house_help_services || null,
    dietarySpecialties: chefData.dietary_specialties || null,
    minimumBooking: chefData.minimum_booking || null
  }

  // Data successfully flowing through! 🎉

  const whatsappUrl = `https://wa.me/${chef.phone.replace(/\D/g, "")}`

  // Build ordered list of images: profile photo first, then food photos
  const images = [chef.photo, ...chef.foodPhotos]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-muted/50">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Elegant Back Button */}
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 group transition-all duration-200">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to all chefs</span>
        </Link>

        {/* Compact Hero Section */}
        <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border backdrop-blur-sm mb-8">
          <div className="lg:flex">
            {/* Carousel showing chef profile & food photos - Fixed height approach */}
            <div className="lg:w-2/5 relative">
              <Carousel className="w-full">
                <CarouselContent>
                  {images.map((src) => (
                    <CarouselItem key={src}>
                      <div className="relative w-full h-64 md:h-80 lg:h-[500px] overflow-hidden bg-gradient-to-br from-muted to-muted/70">
                      <Image
                        src={src}
                        alt={chef.name}
                          fill
                          className="object-cover object-center"
                          sizes="(max-width: 1024px) 100vw, 40vw"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>

            {/* Compact Hero Info */}
            <div className="lg:w-3/5 p-6 lg:p-8 flex flex-col justify-center lg:min-h-[500px]">
              {/* Name and Trust Badge */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-2">{chef.name}</h1>
                {chef.verified && (
                    <div className="flex items-center gap-2">
                                            <Badge className="bg-accent/10 text-accent border-accent/20 px-3 py-1.5 text-sm font-semibold">
                        <Shield className="w-4 h-4 mr-1.5" />
                        Verified Chef
                      </Badge>
                      <span className="text-sm text-muted-foreground">Background checked</span>
                    </div>
                  )}
                </div>
                {/* Rating Badge - Top Right */}
                {chef.avgRating && (
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-2 text-center">
                    <div className="flex items-center gap-1 justify-center mb-1">
                      <Star className="w-5 h-5 text-primary fill-primary" />
                      <span className="text-xl font-bold text-primary">{chef.avgRating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-primary/80 font-medium">{chef.reviewCount} reviews</span>
                  </div>
                )}
              </div>

              {/* Location & Travel - Compact */}
              {chef.location && (
                <div className="flex items-center gap-3 mb-4 p-3 bg-muted rounded-xl border border-border">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-semibold text-foreground">{chef.location}</span>
                    {chef.travelDistance && <span className="text-sm text-muted-foreground ml-2">• Up to {chef.travelDistance} miles</span>}
                  </div>
                </div>
              )}

              {/* Cuisines - Compact */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                {chef.cuisines.map((cuisine) => (
                    <Badge 
                      key={cuisine} 
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-3 py-1 text-sm font-medium"
                    >
                    {cuisine}
                  </Badge>
                ))}
              </div>
              </div>

              {/* Pricing - Prominent in Hero */}
              <div className="mb-6 text-center">
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-4xl font-black text-primary">£{chef.hourlyRate}</span>
                  <span className="text-lg text-muted-foreground font-medium">per hour</span>
                </div>
                {chef.minimumBooking && (
                  <p className="text-sm text-muted-foreground">Minimum {chef.minimumBooking} hours</p>
                )}
              </div>

              {/* Contact Button - Prominent */}
              <Button asChild size="lg" className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] py-4 text-lg font-bold">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span>Contact {chef.name.split(' ')[0]}</span>
                  <div className="bg-white/20 rounded-full p-1">
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </div>
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* About Section - Full Width */}
        <div className="bg-card rounded-3xl shadow-xl p-8 lg:p-12 mb-8 border border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">About {chef.name.split(' ')[0]}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-center whitespace-pre-line">{chef.bio}</p>
          </div>
        </div>

        {/* Quick Facts - Full Width Grid */}
        {(chef.experienceYears || chef.availability || chef.languagesSpoken || chef.frequencyPreference) && (
          <div className="bg-card rounded-3xl shadow-xl p-8 lg:p-12 mb-8 border border-border">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Quick Facts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {chef.experienceYears && (
                <div className="text-center bg-card p-6 rounded-2xl border border-border hover:shadow-lg transition-all duration-200">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Star className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Experience</p>
                  <p className="text-2xl font-bold text-foreground">{chef.experienceYears} years</p>
                </div>
              )}
              {chef.availability && (
                <div className="text-center bg-card p-6 rounded-2xl border border-border hover:shadow-lg transition-all duration-200">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-secondary/10 rounded-xl">
                      <Clock className="w-8 h-8 text-secondary" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Available</p>
                  <p className="text-sm font-semibold text-foreground leading-relaxed">{chef.availability}</p>
                </div>
              )}
              {chef.frequencyPreference && (
                <div className="text-center bg-card p-6 rounded-2xl border border-border hover:shadow-lg transition-all duration-200">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-accent/10 rounded-xl">
                      <Calendar className="w-8 h-8 text-accent" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Frequency</p>
                  <p className="text-sm font-semibold text-foreground leading-relaxed">{chef.frequencyPreference}</p>
                </div>
              )}
              {chef.languagesSpoken && (
                <div className="text-center bg-card p-6 rounded-2xl border border-border hover:shadow-lg transition-all duration-200">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-secondary/10 rounded-xl">
                      <Globe className="w-8 h-8 text-secondary" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Languages</p>
                  <p className="text-sm font-semibold text-foreground leading-relaxed">{chef.languagesSpoken}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Services & Specialties - Full Width */}
        {(chef.specialEvents || chef.houseHelpServices || chef.dietarySpecialties) && (
          <div className="bg-card rounded-3xl shadow-xl p-8 lg:p-12 mb-8 border border-border">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Services & Specialties
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {chef.specialEvents && (
                <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-lg transition-all duration-200">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-primary/10 rounded-xl">
                        <Utensils className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-bold text-foreground text-xl mb-3">Special Events</h3>
                    <p className="text-muted-foreground leading-relaxed">{chef.specialEvents}</p>
                  </div>
                </div>
              )}
              {chef.houseHelpServices && (
                <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-lg transition-all duration-200">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-secondary/10 rounded-xl">
                        <Home className="w-8 h-8 text-secondary" />
                      </div>
                    </div>
                    <h3 className="font-bold text-foreground text-xl mb-3">House Help Services</h3>
                    <p className="text-muted-foreground leading-relaxed">{chef.houseHelpServices}</p>
                  </div>
                </div>
              )}
              {chef.dietarySpecialties && (
                <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-lg transition-all duration-200">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-accent/10 rounded-xl">
                        <CheckCircle className="w-8 h-8 text-accent" />
                      </div>
                    </div>
                    <h3 className="font-bold text-foreground text-xl mb-3">Dietary Options</h3>
                    <p className="text-muted-foreground leading-relaxed">{chef.dietarySpecialties}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reviews Section - Premium Design */}
        <div className="bg-card rounded-3xl shadow-xl p-8 lg:p-12 mt-12 border border-border backdrop-blur-sm">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3 text-center">
              Customer Reviews
            </h2>
            <p className="text-muted-foreground text-lg">See what others say about {chef.name.split(' ')[0]}'s cooking</p>
          </div>
          
          {/* Show rating summary if reviews exist */}
          {chef.avgRating && chef.reviewCount && (
            <div className="mb-10">
            <ReviewSummary avgRating={chef.avgRating} reviewCount={chef.reviewCount} />
            </div>
          )}
          
          {/* Review Form */}
          <div className="mb-10 bg-gradient-to-r from-muted to-muted/50 p-6 rounded-2xl border border-border">
            <h3 className="text-xl font-bold text-foreground mb-4 text-center">Share Your Experience</h3>
            <ReviewForm chefId={chef.id} chefName={chef.name} />
          </div>
          
          {/* Reviews List */}
          <div className="space-y-6">
          <ReviewList reviews={reviews} />
          </div>
        </div>
      </div>
    </div>
  )
}

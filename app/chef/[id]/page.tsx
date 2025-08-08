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
      chef_cuisines(cuisine),
      food_photos(photo_url, display_order)
    `)
    .eq('id', id)
    .eq('verified', true) // Only show verified chefs
    .single()

  // Fetch enhanced application data for this chef - simplified query
  const { data: allApplications, error: appError } = await supabase
    .from('chef_applications')
    .select('answers, chef_id, status')
    .eq('chef_id', id)
  
  // Find the approved application manually
  const applicationRecord = allApplications?.find(app => app.status === 'approved') || null
  const applicationData = applicationRecord?.answers || null

  // Success! Data is now flowing through correctly

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

  // Extract enhanced data from application
  const enhancedData = applicationData || {}

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
    // Enhanced profile data
    experienceYears: enhancedData['Experience Years'] || null,
    availability: enhancedData['Availability'] || null,
    frequencyPreference: enhancedData['Frequency Preference'] || null,
    languagesSpoken: enhancedData['Languages Spoken'] || null,
    travelDistance: enhancedData['Travel Distance'] || null,
    specialEvents: enhancedData['Special Events'] || null,
    houseHelpServices: enhancedData['House Help Services'] || null,
    dietarySpecialties: enhancedData['Dietary Specialties'] || null,
    minimumBooking: enhancedData['Minimum Booking'] || null
  }

  // Data successfully flowing through! 🎉

  const whatsappUrl = `https://wa.me/${chef.phone.replace(/\D/g, "")}`

  // Build ordered list of images: profile photo first, then food photos
  const images = [chef.photo, ...chef.foodPhotos]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Elegant Back Button */}
        <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-8 group transition-all duration-200">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to all chefs</span>
        </Link>

        {/* Compact Hero Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 backdrop-blur-sm mb-8">
          <div className="lg:flex">
            {/* Carousel showing chef profile & food photos - Fixed height approach */}
            <div className="lg:w-2/5 relative">
              <Carousel className="w-full">
                <CarouselContent>
                  {images.map((src) => (
                    <CarouselItem key={src}>
                      <div className="relative w-full h-64 md:h-80 lg:h-[500px] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
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
                  <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-2">{chef.name}</h1>
                {chef.verified && (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-3 py-1.5 text-sm font-semibold">
                        <Shield className="w-4 h-4 mr-1.5" />
                        Verified Chef
                  </Badge>
                      <span className="text-sm text-slate-500">Background checked</span>
                    </div>
                  )}
                </div>
                {/* Rating Badge - Top Right */}
                {chef.avgRating && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2 text-center">
                    <div className="flex items-center gap-1 justify-center mb-1">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <span className="text-xl font-bold text-amber-700">{chef.avgRating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-amber-600 font-medium">{chef.reviewCount} reviews</span>
                  </div>
                )}
              </div>

              {/* Location & Travel - Compact */}
              {chef.location && (
                <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="font-semibold text-slate-700">{chef.location}</span>
                    {chef.travelDistance && <span className="text-sm text-slate-500 ml-2">• Up to {chef.travelDistance} miles</span>}
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
                  <span className="text-4xl font-black text-orange-600">£{chef.hourlyRate}</span>
                  <span className="text-lg text-slate-600 font-medium">per hour</span>
                </div>
                {chef.minimumBooking && (
                  <p className="text-sm text-slate-500">Minimum {chef.minimumBooking} hours</p>
                )}
              </div>

              {/* Contact Button - Prominent */}
              <Button asChild size="lg" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] py-4 text-lg font-bold">
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
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 mb-8 border border-slate-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">About {chef.name.split(' ')[0]}</h2>
            <p className="text-lg text-slate-700 leading-relaxed text-center whitespace-pre-line">{chef.bio}</p>
          </div>
        </div>

        {/* Quick Facts - Full Width Grid */}
        {(chef.experienceYears || chef.availability || chef.languagesSpoken || chef.frequencyPreference) && (
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 mb-8 border border-slate-100">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center flex items-center justify-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              Quick Facts
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {chef.experienceYears && (
                <div className="text-center bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 hover:shadow-lg transition-all duration-200">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-amber-100 rounded-2xl">
                      <Star className="w-8 h-8 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-amber-700 uppercase tracking-wide mb-2">Experience</p>
                  <p className="text-2xl font-bold text-amber-900">{chef.experienceYears} years</p>
                </div>
              )}
              {chef.availability && (
                <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-200">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-blue-100 rounded-2xl">
                      <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-blue-700 uppercase tracking-wide mb-2">Available</p>
                  <p className="text-sm font-semibold text-blue-900">{chef.availability}</p>
                </div>
              )}
              {chef.frequencyPreference && (
                <div className="text-center bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-200 hover:shadow-lg transition-all duration-200">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-emerald-100 rounded-2xl">
                      <Calendar className="w-8 h-8 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-emerald-700 uppercase tracking-wide mb-2">Frequency</p>
                  <p className="text-sm font-semibold text-emerald-900">{chef.frequencyPreference}</p>
                </div>
              )}
              {chef.languagesSpoken && (
                <div className="text-center bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-200">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-purple-100 rounded-2xl">
                      <Globe className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-purple-700 uppercase tracking-wide mb-2">Languages</p>
                  <p className="text-sm font-semibold text-purple-900">{chef.languagesSpoken}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Services & Specialties - Full Width */}
        {(chef.specialEvents || chef.houseHelpServices || chef.dietarySpecialties) && (
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 mb-8 border border-slate-100">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center flex items-center justify-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
              Services & Specialties
              <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {chef.specialEvents && (
                <div className="group bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl border border-red-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-red-100 rounded-2xl group-hover:bg-red-200 transition-colors">
                        <Utensils className="w-8 h-8 text-red-600" />
                      </div>
                    </div>
                    <h3 className="font-bold text-red-900 text-xl mb-3">Special Events</h3>
                    <p className="text-red-700 leading-relaxed">{chef.specialEvents}</p>
                  </div>
                </div>
              )}
              {chef.houseHelpServices && (
                <div className="group bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl border border-teal-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-teal-100 rounded-2xl group-hover:bg-teal-200 transition-colors">
                        <Home className="w-8 h-8 text-teal-600" />
                      </div>
                    </div>
                    <h3 className="font-bold text-teal-900 text-xl mb-3">House Help Services</h3>
                    <p className="text-teal-700 leading-relaxed">{chef.houseHelpServices}</p>
                  </div>
                </div>
              )}
              {chef.dietarySpecialties && (
                <div className="group bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-emerald-100 rounded-2xl group-hover:bg-emerald-200 transition-colors">
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                      </div>
                    </div>
                    <h3 className="font-bold text-emerald-900 text-xl mb-3">Dietary Options</h3>
                    <p className="text-emerald-700 leading-relaxed">{chef.dietarySpecialties}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reviews Section - Premium Design */}
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 mt-12 border border-slate-100 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3 flex items-center justify-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
              Customer Reviews
              <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
            </h2>
            <p className="text-slate-600 text-lg">See what others say about {chef.name.split(' ')[0]}'s cooking</p>
          </div>
          
          {/* Show rating summary if reviews exist */}
          {chef.avgRating && chef.reviewCount && (
            <div className="mb-10">
            <ReviewSummary avgRating={chef.avgRating} reviewCount={chef.reviewCount} />
            </div>
          )}
          
          {/* Review Form */}
          <div className="mb-10 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Share Your Experience</h3>
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

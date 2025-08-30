import { createSupabaseServerClient } from "@/lib/supabase-server"
import ChefCard from "@/components/chef-card"
import Header from "@/components/header"
import Footer from "@/components/footer"

// Define the Chef type to match our existing components
interface Chef {
  id: string
  name: string
  photo: string
  foodPhotos: string[]
  cuisines: string[]
  hourlyRate: number
  phone: string
  verified: boolean
  bio: string
}

export default async function HomePage() {
  // Check if environment variables are available (prevents build failures)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-2">Tastes Like Home</h1>
          <p className="text-xl text-center mb-8">Environment variables not configured. Please set up Supabase environment variables.</p>
        </main>
        <Footer />
      </div>
    )
  }
  
  // Fetch chef data from Supabase database
  const supabase = await createSupabaseServerClient()
  
  const { data: chefsData, error } = await supabase
    .from('chefs')
    .select(`
      id,
      name,
      bio,
      hourly_rate,
      verified,
      photo_url,
      location_label,
      location,
      chef_cuisines(cuisine),
      food_photos(photo_url)
    `)
    .eq('verified', true)
    .order('created_at', { ascending: false })

  // Fetch rating statistics for all chefs
  const { data: ratingStatsData } = await supabase
    .from('chef_rating_stats')
    .select('chef_id, review_count, avg_rating')

  // Create a map of chef ratings for quick lookup
  const ratingsMap = new Map(
    ratingStatsData?.map(stats => [stats.chef_id, stats]) || []
  )

  if (error) {
    console.error('Error fetching chefs:', error)
    // Fallback to empty array if database fails
    var chefs: Chef[] = []
  } else {
    // Transform database data to match our existing Chef interface
    var chefs: Chef[] = chefsData?.map(chef => {
      const ratings = ratingsMap.get(chef.id)
      return {
        id: chef.id,
        name: chef.name,
        photo: chef.photo_url || '/placeholder.svg',
        foodPhotos: chef.food_photos?.map(p => p.photo_url) || [],
        cuisines: chef.chef_cuisines?.map(c => c.cuisine) || [],
        hourlyRate: chef.hourly_rate || 0,
        phone: '', // Don't expose phone on homepage for privacy
        verified: chef.verified,
        bio: chef.bio || '',
        location: chef.location_label || undefined,
        // Note: coordinates will be extracted later if needed for proximity features
        latitude: undefined,
        longitude: undefined,
        // Add rating data from materialized view
        avgRating: ratings?.avg_rating || undefined,
        reviewCount: ratings?.review_count || undefined
      }
    }) || []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Stunning Hero Section */}
        <div className="relative mb-20 py-24 overflow-hidden">
          {/* Subtle decorative elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-secondary/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-5xl mx-auto text-center">
            {/* Premium Typography */}
            <div className="mb-8">
              <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-6 leading-[0.9] tracking-tight">
                Tastes Like
                <span className="block text-primary">Home</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
                Experience the warmth of authentic Indian home cooking from 
                <span className="text-primary font-bold">London's finest chefs</span>
              </p>
            </div>
            
            {/* Value Proposition */}
            <div className="flex flex-wrap items-center justify-center gap-8 mb-12 text-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-xl">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="font-semibold">Verified Chefs</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <span className="font-semibold">Fresh Daily</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-xl">
                  <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </div>
                <span className="font-semibold">Made with Love</span>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Browse our chefs below</p>
                <div className="w-8 h-8 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chef Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {chefs.length > 0 ? (
            chefs.map((chef) => (
              <ChefCard key={chef.id} chef={chef} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">No verified chefs available at the moment.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

// Enable ISR (Incremental Static Regeneration) - page updates every 30 minutes
export const revalidate = 1800
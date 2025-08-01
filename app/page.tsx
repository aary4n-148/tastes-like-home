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
        {/* Cleaned Up Hero Section */}
        <div className="text-center mb-16 relative pt-8">
          {/* Background decorative element */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-200/30 to-red-200/30 rounded-full blur-3xl"></div>
          </div>
          
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 bg-clip-text text-transparent leading-tight">
              Tastes Like Home
            </h1>
            
            <p className="text-xl md:text-3xl text-gray-700 font-medium max-w-3xl mx-auto leading-relaxed">
              Discover authentic Indian home-cooked meals from 
              <span className="text-orange-600 font-semibold"> verified chefs</span> in London
            </p>
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
import { createSupabaseServerClient } from "@/lib/supabase-server"
import ChefCard from "@/components/chef-card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ScrollToChefs from "@/components/scroll-to-chefs"

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
        {/* Premium Hero Section with Distinct Background */}
        <section className="relative py-20 mb-16 bg-gradient-to-br from-amber-100 via-orange-100 to-red-100 rounded-3xl mx-4 shadow-lg">
          {/* Enhanced background elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/6 w-80 h-80 bg-primary/8 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-secondary/8 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-6xl mx-auto">
            {/* Hero Content Grid - 2 Columns */}
            <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[400px]">
              
              {/* Main Content - Left Column */}
              <div className="text-center lg:text-left space-y-8">
                {/* Premium Title */}
                <div>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[0.9] tracking-tight mb-6">
                    Tastes Like
                    <span className="block text-primary">Home</span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-medium">
                    Experience authentic Indian home cooking from{" "}
                    <span className="text-primary font-bold">London's verified chefs</span>
                  </p>
                </div>
                
                {/* Trust Indicator */}
                <div className="flex justify-center lg:justify-start">
                  <div className="flex items-center gap-3 text-gray-700 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full border border-white/40">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <span className="font-semibold">Background Verified</span>
                  </div>
                </div>
              </div>
              
              {/* Stats - Right Column */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40">
                  <div className="text-4xl font-black text-primary mb-2">{chefs.length}+</div>
                  <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Verified Chefs</div>
                </div>
                <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40">
                  <div className="text-4xl font-black text-secondary mb-2">5★</div>
                  <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Average Rating</div>
                </div>
                <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 col-span-2">
                  <div className="text-3xl font-black text-accent mb-2">£13-20/hr</div>
                  <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Affordable Home Cooking</div>
                </div>
              </div>
            </div>
            
            {/* Call to Action Arrow */}
            <div className="text-center mt-12">
              <ScrollToChefs targetId="chef-grid" />
            </div>
          </div>
        </section>

        {/* Chef Grid */}
        <div id="chef-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 -mt-8">
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
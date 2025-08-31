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

      <main className="container mx-auto px-4 py-6 sm:py-12">
        {/* Premium Hero Section with Distinct Background - Mobile Optimized */}
        <section className="relative py-6 sm:py-12 lg:py-16 mb-6 sm:mb-12 bg-gradient-to-br from-amber-100 via-orange-100 to-red-100 rounded-2xl sm:rounded-3xl mx-2 sm:mx-4 shadow-lg">
          {/* Enhanced background elements - Smaller on mobile */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/6 w-32 h-32 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-primary/8 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/6 w-40 h-40 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-secondary/8 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-6xl mx-auto px-3 sm:px-6">
            {/* Hero Content Grid - 2 Columns on Desktop, Mobile Optimized */}
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center min-h-[300px] sm:min-h-[400px]">
              
              {/* Main Content - Left Column on Desktop */}
              <div className="text-center lg:text-left space-y-3 sm:space-y-4 lg:space-y-8">
                {/* Premium Title - Bigger on Mobile */}
                <div>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-[0.95] sm:leading-[0.9] tracking-tight mb-3 sm:mb-4 lg:mb-6">
                    Tastes Like
                    <span className="block text-primary">Home</span>
                  </h1>
                  
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed font-medium px-2 sm:px-0">
                    Experience authentic Indian home cooking from{" "}
                    <span className="text-primary font-bold">London's verified chefs</span>
                  </p>
                </div>
                
                {/* Trust Indicator - Closer to Stats */}
                <div className="flex justify-center lg:justify-start">
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-700 bg-white/50 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-white/40">
                    <div className="p-1.5 sm:p-2 bg-accent/10 rounded-lg">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <span className="font-semibold text-sm sm:text-base">Background Verified</span>
                  </div>
                </div>
              </div>
              
              {/* Stats - Desktop: 2x2 Grid, Mobile: 3 Column Row */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-2 lg:gap-6 max-w-md mx-auto lg:max-w-none mt-3 sm:mt-4 lg:mt-0">
                <div className="text-center p-3 sm:p-3 lg:p-6 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl border border-white/40">
                  <div className="text-lg sm:text-xl lg:text-4xl font-black text-primary mb-1 sm:mb-1 lg:mb-2">{chefs.length}+</div>
                  <div className="text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wide leading-tight">Verified<br className="lg:hidden" /> Chefs</div>
                </div>
                <div className="text-center p-3 sm:p-3 lg:p-6 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl border border-white/40">
                  <div className="text-lg sm:text-xl lg:text-4xl font-black text-secondary mb-1 sm:mb-1 lg:mb-2">5★</div>
                  <div className="text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wide leading-tight">Avg<br className="lg:hidden" /> Rating</div>
                </div>
                <div className="text-center p-3 sm:p-3 lg:p-6 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl border border-white/40 col-span-1 lg:col-span-2">
                  <div className="text-lg sm:text-xl lg:text-3xl font-black text-accent mb-1 sm:mb-1 lg:mb-2">£13-20</div>
                  <div className="text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wide leading-tight">Per<br className="lg:hidden" /> Hour</div>
                </div>
              </div>
            </div>
            
            {/* Call to Action Arrow */}
            <div className="text-center mt-4 sm:mt-6">
              <ScrollToChefs targetId="chef-grid" />
            </div>
          </div>
        </section>

        {/* Chef Grid - Fixed Spacing */}
        <div id="chef-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 mt-4 sm:mt-8">
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
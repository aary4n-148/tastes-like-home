import { createSupabaseServerClient } from '@/lib/supabase-server'
import ApplicationForm from '@/components/application-form'
import { ChefHat, Users, Clock, Award } from 'lucide-react'

export default async function ApplyPage() {
  // Fetch the questions from the database
  const supabase = await createSupabaseServerClient()
  
  const { data: questions, error } = await supabase
    .from('chef_questions')
    .select('*')
    .eq('is_visible', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching questions:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Application</h1>
          <p className="text-gray-600">Please try again later or contact support.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Beautiful Header with Logo */}
        <div className="text-center mb-16">
          {/* Logo Section */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-primary to-secondary p-6 rounded-full shadow-xl">
                <ChefHat className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
          
          {/* Brand Name */}
          <div className="mb-6">
            <div className="text-3xl sm:text-4xl font-black text-foreground leading-tight">
              <div>Tastes Like</div>
              <div className="text-primary">Home</div>
            </div>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
            Apply to Become a Chef
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Join our community of talented chefs and share your culinary skills with food lovers. 
            We'll review your application within 48 hours.
          </p>
          
          {/* Stats/Features Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/50">
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Join Our Community</h3>
              <p className="text-sm text-muted-foreground">Connect with food lovers in your area</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/50">
              <div className="flex justify-center mb-4">
                <div className="bg-secondary/10 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Quick Review</h3>
              <p className="text-sm text-muted-foreground">48-hour application review process</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/50">
              <div className="flex justify-center mb-4">
                <div className="bg-accent/10 p-3 rounded-full">
                  <Award className="w-6 h-6 text-accent" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Professional Platform</h3>
              <p className="text-sm text-muted-foreground">Showcase your culinary expertise</p>
            </div>
          </div>
          
          {/* Enhanced Why Section */}
          <div className="bg-white/90 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <ChefHat className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Why We Ask for This Information</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg mt-1">
                    <span className="text-lg">📸</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Photos Build Trust</h3>
                    <p className="text-muted-foreground">High-quality photos help customers choose you over other chefs. Show your personality and delicious creations!</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-secondary/10 p-2 rounded-lg mt-1">
                    <span className="text-lg">📝</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Your Story Matters</h3>
                    <p className="text-muted-foreground">Tell your culinary journey! Customers want to know your experience and what makes your cooking special.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-accent/10 p-2 rounded-lg mt-1">
                    <span className="text-lg">💰</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Fair Pricing</h3>
                    <p className="text-muted-foreground">Set competitive rates that reflect your skills. Transparent pricing helps customers make informed decisions.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg mt-1">
                    <span className="text-lg">⭐</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Professional Details</h3>
                    <p className="text-muted-foreground">Share your experience, availability, and specialties to attract the right customers.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Application Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/50 p-8 sm:p-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Chef Application Form</h2>
            <p className="text-muted-foreground">Please fill out all required fields to complete your application.</p>
          </div>
          <ApplicationForm questions={questions || []} />
        </div>

        {/* Enhanced Footer */}
        <div className="text-center mt-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-border/50">
            <p className="text-muted-foreground mb-2">
              <strong>Privacy Protected:</strong> Your information is secure and will only be used for application review.
            </p>
            <p className="text-sm text-muted-foreground">
              By submitting this application, you agree to our 
              <a href="/terms" className="text-primary hover:text-primary/80 underline ml-1">terms of service</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
import { createSupabaseServerClient } from '@/lib/supabase-server'
import ApplicationForm from '@/components/application-form'

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Apply to Become a Chef
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
            Join our community of talented Indian chefs and share your culinary skills with food lovers. 
            We'll review your application within 48 hours.
          </p>
          
          {/* Why Each Field Matters */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-blue-900 mb-4 text-center">💡 Why We Ask for This Information</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h3 className="font-medium mb-2">📸 Photos are crucial:</h3>
                <p>High-quality photos help customers choose you over other chefs. Show your personality and your delicious food!</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">📝 Your bio matters:</h3>
                <p>Tell your story! Customers want to know about your experience and what makes your cooking special.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">💰 Competitive pricing:</h3>
                <p>Set a fair rate that reflects your skills. Customers often compare prices when choosing chefs.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">🍛 Best dishes:</h3>
                <p>List your signature dishes that customers love most. This helps them know what to expect!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <ApplicationForm questions={questions || []} />
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>By submitting this application, you agree to our terms of service.</p>
        </div>
      </div>
    </div>
  )
}
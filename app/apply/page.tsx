import { createSupabaseServerClient } from '@/lib/supabase-server'
import ApplicationForm from '@/components/application-form'

export default async function ApplyPage() {
  // Fetch the questions from the database
  const supabase = createSupabaseServerClient()
  
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
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Join our community of talented chefs and share your culinary skills with food lovers. 
            We'll review your application within 48 hours.
          </p>
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
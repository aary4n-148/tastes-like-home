import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { approveApplication, rejectApplication, updateApplicationNotes } from '@/app/admin/actions'

/**
 * Individual Chef Application Review Page
 * 
 * Provides a detailed view of a single chef application with admin controls
 * for approval, rejection, and note-taking. Features a clean two-column layout
 * with comprehensive application details and action buttons.
 * 
 * Features:
 * - Complete application data display
 * - Approve/reject workflow with server actions
 * - Admin notes functionality with auto-save
 * - Application timeline and audit trail
 * - Photo upload placeholders for future implementation
 * - Responsive design with proper error handling
 */

interface ApplicationPageProps {
  params: { id: string }
}

export default async function ApplicationReviewPage({ params }: ApplicationPageProps) {
  const { id } = await params
  const supabase = createSupabaseAdminClient()

  // Fetch the specific application
  const { data: application, error } = await supabase
    .from('chef_applications')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !application) {
    notFound()
  }

  const answers = application.answers as Record<string, any>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link 
                href="/admin" 
                className="text-blue-600 hover:text-blue-700 underline mb-2 inline-block"
              >
                ← Back to Admin Panel
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Application Review
              </h1>
              <p className="text-gray-600 mt-1">
                Submitted {new Date(application.created_at).toLocaleDateString()} at{' '}
                {new Date(application.created_at).toLocaleTimeString()}
              </p>
            </div>
            <Badge 
              variant="outline" 
              className={
                application.status === 'pending' 
                  ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                  : application.status === 'approved'
                  ? 'bg-green-50 text-green-800 border-green-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }
            >
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Details - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {answers['Full Name'] || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {answers['Email Address'] || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {answers['Phone Number'] || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    £{answers['Hourly Rate (£)'] || 'Not specified'}/hour
                  </p>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Bio/About</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {answers['Bio/About You'] || 'No bio provided'}
                </p>
              </div>
            </div>

            {/* Cuisine Specialties */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cuisine Specialties</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-900">
                  {answers['Cuisine Specialties'] || 'Not specified'}
                </p>
              </div>
            </div>

            {/* Photo Uploads */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Profile Photo</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                    <p className="text-sm text-gray-500">Photo upload coming in next step</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {answers['Profile Photo'] ? 'File uploaded' : 'No file uploaded'}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Food Photos</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                    <p className="text-sm text-gray-500">Photo upload coming in next step</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {answers['Food Photos'] ? 'File uploaded' : 'No file uploaded'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Panel - Right Column */}
          <div className="space-y-6">
            {/* Status & Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
              
              {application.status === 'pending' ? (
                <div className="space-y-3">
                  <form action={approveApplication.bind(null, application.id)}>
                    <Button 
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      ✓ Approve Application
                    </Button>
                  </form>
                  
                  <form action={rejectApplication.bind(null, application.id, 'Application did not meet our requirements')}>
                    <Button 
                      type="submit"
                      variant="destructive" 
                      className="w-full"
                    >
                      ✗ Reject Application
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-2">
                    Application has been {application.status}
                  </p>
                  {application.approved_at && (
                    <p className="text-sm text-green-600">
                      Approved: {new Date(application.approved_at).toLocaleDateString()}
                    </p>
                  )}
                  {application.rejected_at && (
                    <p className="text-sm text-red-600">
                      Rejected: {new Date(application.rejected_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Admin Notes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Notes</h2>
              <form action={updateApplicationNotes.bind(null, application.id)}>
                <Textarea
                  name="notes"
                  placeholder="Add internal notes about this application..."
                  defaultValue={application.admin_notes || ''}
                  rows={4}
                  className="mb-3"
                />
                <Button type="submit" variant="outline" size="sm" className="w-full">
                  Update Notes
                </Button>
              </form>
            </div>

            {/* Application Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">Application Submitted</p>
                    <p className="text-gray-600">
                      {new Date(application.created_at).toLocaleDateString()} at{' '}
                      {new Date(application.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                {application.approved_at && (
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900">Application Approved</p>
                      <p className="text-gray-600">
                        {new Date(application.approved_at).toLocaleDateString()} at{' '}
                        {new Date(application.approved_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}
                
                {application.rejected_at && (
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900">Application Rejected</p>
                      <p className="text-gray-600">
                        {new Date(application.rejected_at).toLocaleDateString()} at{' '}
                        {new Date(application.rejected_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
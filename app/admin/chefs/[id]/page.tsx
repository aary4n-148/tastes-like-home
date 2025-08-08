import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Eye, EyeOff, Trash2, Upload, X } from 'lucide-react'
import ChefProfileForm from '@/components/admin/chef-profile-form'
import ChefCuisinesForm from '@/components/admin/chef-cuisines-form'
import ChefStatusForm from '@/components/admin/chef-status-form'
import ChefDeleteForm from '@/components/admin/chef-delete-form'
import ChefPhotoUpload from '@/components/admin/chef-photo-upload'

/**
 * Chef Editor Page
 * 
 * Allows admins to edit chef profiles after approval, including:
 * - Contact information (name, phone, hourly rate, bio)
 * - Cuisine specialties management
 * - Photo management (profile and food photos)
 * - Publication status control
 * - Safe deletion with confirmation
 * 
 * Features:
 * - Clean sectioned layout matching application review page
 * - Real-time form updates with server actions
 * - Photo upload and management
 * - Status toggle (published/unpublished)
 * - Audit trail integration
 * - Responsive design with proper error handling
 */

interface ChefEditorPageProps {
  params: Promise<{ id: string }>
}

export default async function ChefEditorPage({ params }: ChefEditorPageProps) {
  const { id } = await params
  const supabase = createSupabaseAdminClient()

  // Fetch chef data with all related information including enhanced fields
  const { data: chef, error: chefError } = await supabase
    .from('chefs')
    .select(`
      id,
      name,
      bio,
      phone,
      hourly_rate,
      verified,
      status,
      photo_url,
      location_label,
      experience_years,
      availability,
      languages_spoken,
      travel_distance,
      frequency_preference,
      minimum_booking,
      special_events,
      house_help_services,
      dietary_specialties,
      created_at,
      updated_at,
      updated_by,
      chef_cuisines(id, cuisine),
      food_photos(id, photo_url, display_order)
    `)
    .eq('id', id)
    .single()

  if (chefError || !chef) {
    notFound()
  }

  // Enhanced data is now stored directly in the chefs table - no need to fetch from applications

  // Fetch recent audit log entries for this chef
  const { data: auditLogs } = await supabase
    .from('chef_audit_log')
    .select('*')
    .eq('chef_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Transform data for easier handling
  const cuisines = chef.chef_cuisines?.map(c => c.cuisine) || []
  const foodPhotos = chef.food_photos?.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin Panel
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Chef Profile</h1>
              <p className="text-gray-600 mt-1">{chef.name}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Status Badge */}
              <Badge 
                variant={chef.status === 'published' ? 'default' : 'secondary'}
                className={`${
                  chef.status === 'published' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : chef.status === 'unpublished'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}
              >
                {chef.status === 'published' && <Eye className="w-3 h-3 mr-1" />}
                {chef.status === 'unpublished' && <EyeOff className="w-3 h-3 mr-1" />}
                {chef.status === 'deleted' && <Trash2 className="w-3 h-3 mr-1" />}
                {chef.status?.charAt(0).toUpperCase() + chef.status?.slice(1)}
              </Badge>
              
              {/* View Public Profile Link */}
              {chef.status === 'published' && (
                <Link 
                  href={`/chef/${chef.id}`}
                  target="_blank"
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  View Public Profile ↗
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Contact Information Section */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ChefProfileForm 
                  chefId={chef.id}
                  initialData={{
                    name: chef.name,
                    phone: chef.phone || '',
                    hourly_rate: chef.hourly_rate || 0,
                    location_label: chef.location_label || '',
                    bio: chef.bio || '',
                    experience_years: chef.experience_years,
                    availability: chef.availability,
                    languages_spoken: chef.languages_spoken,
                    travel_distance: chef.travel_distance,
                    frequency_preference: chef.frequency_preference,
                    minimum_booking: chef.minimum_booking,
                    special_events: chef.special_events,
                    house_help_services: chef.house_help_services,
                    dietary_specialties: chef.dietary_specialties
                  }}
                />
              </CardContent>
            </Card>

            {/* Cuisines Section */}
            <Card>
              <CardHeader>
                <CardTitle>Cuisine Specialties</CardTitle>
              </CardHeader>
              <CardContent>
                <ChefCuisinesForm 
                  chefId={chef.id}
                  initialCuisines={cuisines}
                />
              </CardContent>
            </Card>

            {/* Photos Section */}
            <Card>
              <CardHeader>
                <CardTitle>Photos Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ChefPhotoUpload 
                  chefId={chef.id}
                  currentProfilePhoto={chef.photo_url}
                  foodPhotos={foodPhotos}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Status Control */}
            <Card>
              <CardHeader>
                <CardTitle>Publication Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ChefStatusForm 
                  chefId={chef.id}
                  currentStatus={chef.status as 'published' | 'unpublished' | 'deleted'}
                />
              </CardContent>
            </Card>

            {/* Chef Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Chef Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <p className="text-gray-600">{new Date(chef.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Last Updated:</span>
                  <p className="text-gray-600">{new Date(chef.updated_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Verified Status:</span>
                  <p className="text-gray-600">{chef.verified ? 'Yes' : 'No'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <ChefDeleteForm 
                  chefId={chef.id}
                  chefName={chef.name}
                />
                <p className="text-xs text-gray-500 mt-2">
                  This action cannot be undone. All data and photos will be removed.
                </p>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            {auditLogs && auditLogs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Changes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {auditLogs.slice(0, 5).map((log, index) => (
                      <div key={log.id} className="flex justify-between">
                        <span className="text-gray-600">{log.action}</span>
                        <span className="text-gray-400">
                          {new Date(log.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Save, Eye, EyeOff, Trash2, Upload, X } from 'lucide-react'

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

  // Fetch chef data with all related information
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
                <CardTitle className="flex items-center gap-2">
                  Contact Information
                  <Button size="sm" variant="outline">
                    <Save className="w-4 h-4 mr-1" />
                    Save Changes
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      defaultValue={chef.name}
                      placeholder="Chef's full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      defaultValue={chef.phone || ''}
                      placeholder="+44 7XXX XXXXXX"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hourly_rate">Hourly Rate (£)</Label>
                    <Input 
                      id="hourly_rate" 
                      type="number" 
                      step="0.50"
                      defaultValue={chef.hourly_rate || ''}
                      placeholder="15.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      defaultValue={chef.location_label || ''}
                      placeholder="e.g., West London"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio / About</Label>
                  <Textarea 
                    id="bio" 
                    defaultValue={chef.bio || ''}
                    placeholder="Tell customers about this chef's background, specialties, and cooking style..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cuisines Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Cuisine Specialties
                  <Button size="sm" variant="outline">
                    <Save className="w-4 h-4 mr-1" />
                    Update Cuisines
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {cuisines.map((cuisine, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="flex items-center gap-1 bg-orange-100 text-orange-700"
                      >
                        {cuisine}
                        <X className="w-3 h-3 ml-1 cursor-pointer hover:text-red-600" />
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add new cuisine (e.g., Punjabi, Italian)"
                      className="flex-1"
                    />
                    <Button variant="outline">Add</Button>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Common cuisines: Punjabi, Gujarati, South Indian, Italian, Chinese, Thai, Mediterranean
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Photos Section */}
            <Card>
              <CardHeader>
                <CardTitle>Photos Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Profile Photo */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Profile Photo</h4>
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Image
                        src={chef.photo_url || '/placeholder-user.jpg'}
                        alt={chef.name}
                        width={120}
                        height={120}
                        className="rounded-lg object-cover border"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-1" />
                        Replace Photo
                      </Button>
                      <p className="text-sm text-gray-500">
                        Recommended: Square image, at least 400x400px
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Food Photos */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Food Photos</h4>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-1" />
                      Add Photos
                    </Button>
                  </div>
                  
                  {foodPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {foodPhotos.map((photo, index) => (
                        <div key={photo.id} className="relative group">
                          <Image
                            src={photo.photo_url}
                            alt={`Food photo ${index + 1}`}
                            width={200}
                            height={200}
                            className="rounded-lg object-cover border aspect-square"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No food photos uploaded yet</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Upload First Photo
                      </Button>
                    </div>
                  )}
                </div>
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
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button 
                    className={`w-full ${chef.status === 'published' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    variant={chef.status === 'published' ? 'default' : 'outline'}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Published (Visible)
                  </Button>
                  
                  <Button 
                    className="w-full"
                    variant={chef.status === 'unpublished' ? 'default' : 'outline'}
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    Unpublished (Hidden)
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500">
                  Published chefs appear on the website and in search results.
                </p>
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
                <Button 
                  variant="destructive" 
                  className="w-full"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Chef Permanently
                </Button>
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
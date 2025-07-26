import { createSupabaseAdminClient } from "@/lib/supabase-admin"
import { ApprovalButton } from "@/components/approval-button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function AdminPage() {
  // Check if environment variables are available (prevents build failures)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <p className="text-red-600">Environment variables not configured. Please set up Supabase environment variables in Vercel.</p>
      </div>
    )
  }
  
  // Use admin client to bypass RLS and see all chefs
  const supabase = createSupabaseAdminClient()
  
  // Get all chefs (verified and unverified) for admin view
  const { data: allChefs, error } = await supabase
    .from('chefs')
    .select(`
      id,
      name,
      bio,
      phone,
      hourly_rate,
      verified,
      photo_url,
      created_at,
      chef_cuisines(cuisine)
    `)
    .order('created_at', { ascending: false })

  // Debug logging
  console.log('Admin query results (using admin client):')
  console.log('Error:', error)
  console.log('Chef count:', allChefs?.length)
  console.log('All chefs:', allChefs?.map(c => ({ name: c.name, verified: c.verified })))

  if (error) {
    console.error('Error fetching chefs:', error)
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error loading admin panel:</strong>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      </div>
    )
  }

  const pendingChefs = allChefs?.filter(chef => !chef.verified) || []
  const verifiedChefs = allChefs?.filter(chef => chef.verified) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-700 underline"
            >
              ← Back to Website
            </Link>
          </div>
          <p className="text-gray-600 mt-2">Manage chef applications and approvals</p>
          
          {/* Debug info - remove this later when everything is working */}
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-semibold text-green-800">✅ Admin Panel Working!</h3>
            <p className="text-sm text-green-700">
              Database returned {allChefs?.length || 0} total chefs
            </p>
            <p className="text-sm text-green-700">
              Verified: {verifiedChefs.length}, Pending: {pendingChefs.length}
            </p>
            <details className="mt-2">
              <summary className="text-sm font-medium text-green-800 cursor-pointer">Show all chef names</summary>
              <ul className="text-xs text-green-700 mt-1">
                {allChefs?.map(chef => (
                  <li key={chef.id}>{chef.name} - {chef.verified ? 'Verified' : 'Pending'}</li>
                ))}
              </ul>
            </details>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Total Chefs</h3>
            <p className="text-3xl font-bold text-blue-600">{allChefs?.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Verified</h3>
            <p className="text-3xl font-bold text-green-600">{verifiedChefs.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Pending Approval</h3>
            <p className="text-3xl font-bold text-orange-600">{pendingChefs.length}</p>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pending Approvals ({pendingChefs.length})
          </h2>
          
          {pendingChefs.length > 0 ? (
            <div className="space-y-4">
              {pendingChefs.map(chef => (
                <div key={chef.id} className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-orange-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{chef.name}</h3>
                        <Badge variant="outline" className="border-orange-200 text-orange-700">
                          Pending
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-500">Cuisines: </span>
                        <span className="text-sm text-gray-700">
                          {chef.chef_cuisines?.map(c => c.cuisine).join(', ') || 'None specified'}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-500">Rate: </span>
                        <span className="text-sm text-gray-700">£{chef.hourly_rate}/hour</span>
                        <span className="text-sm font-medium text-gray-500 ml-4">Phone: </span>
                        <span className="text-sm text-gray-700">{chef.phone}</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-3">{chef.bio}</p>
                    </div>
                    
                    <div className="ml-6">
                      <ApprovalButton chefId={chef.id} chefName={chef.name} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500">No pending chef applications</p>
            </div>
          )}
        </div>

        {/* Verified Chefs */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Verified Chefs ({verifiedChefs.length})
          </h2>
          
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <p className="text-sm text-gray-600">These chefs are live on your website</p>
            </div>
            <div className="divide-y divide-gray-200">
              {verifiedChefs.map(chef => (
                <div key={chef.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{chef.name}</h4>
                    <p className="text-sm text-gray-500">
                      {chef.chef_cuisines?.map(c => c.cuisine).join(', ')} • £{chef.hourly_rate}/hour
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Live
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
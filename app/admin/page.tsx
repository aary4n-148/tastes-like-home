'use client'

import { ApprovalButton } from "@/components/approval-button"
import { ReviewActions } from "@/components/admin/review-actions"
import { Badge } from "@/components/ui/badge"
import { fetchAdminData } from "@/app/admin/actions"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Chef {
  id: string
  name: string
  bio: string
  phone: string
  hourly_rate: number
  verified: boolean
  photo_url: string
  created_at: string
  chef_cuisines: { cuisine: string }[]
}

interface Review {
  id: string
  rating: number
  comment: string | null
  status: 'awaiting_email' | 'published' | 'spam'
  created_at: string
  published_at: string | null
  chefs: { id: string; name: string }
}

export default function AdminPage() {
  const [allChefs, setAllChefs] = useState<Chef[]>([])
  const [allReviews, setAllReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await fetchAdminData()

      if (!result.success) {
        setError(result.error || 'Failed to load admin data')
        setIsLoading(false)
        return
      }

      if (!result.data) {
        setError('No data received from server')
        setIsLoading(false)
        return
      }

      setAllChefs(result.data.chefs)
      setAllReviews(result.data.reviews)

    } catch (err) {
      console.error('Error in fetchData:', err)
      setError('An unexpected error occurred while loading data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error loading admin panel:</strong>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  const pendingChefs = allChefs.filter(chef => !chef.verified)
  const verifiedChefs = allChefs.filter(chef => chef.verified)

  // Process reviews data
  const reviews = allReviews
  const awaitingVerificationReviews = reviews.filter(review => review.status === 'awaiting_email')
  const publishedReviews = reviews.filter(review => review.status === 'published')
  const spamReviews = reviews.filter(review => review.status === 'spam')

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
          <p className="text-gray-600 mt-2">Manage chef applications, approvals, and reviews</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Total Chefs</h3>
            <p className="text-3xl font-bold text-blue-600">{allChefs.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Verified</h3>
            <p className="text-3xl font-bold text-green-600">{verifiedChefs.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Pending Approval</h3>
            <p className="text-3xl font-bold text-orange-600">{pendingChefs.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Reviews Awaiting</h3>
            <p className="text-3xl font-bold text-purple-600">{awaitingVerificationReviews.length}</p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Reviews Management ({reviews.length} total)
          </h2>
          
          {/* Reviews Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
              <h4 className="font-semibold text-gray-900">Awaiting Verification</h4>
              <p className="text-2xl font-bold text-purple-600">{awaitingVerificationReviews.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
              <h4 className="font-semibold text-gray-900">Published</h4>
              <p className="text-2xl font-bold text-green-600">{publishedReviews.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
              <h4 className="font-semibold text-gray-900">Spam/Deleted</h4>
              <p className="text-2xl font-bold text-red-600">{spamReviews.length}</p>
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Reviews</h3>
              <p className="text-sm text-gray-600">Click on a review to expand and take action</p>
            </div>
            <div className="divide-y divide-gray-200">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {review.chefs?.name || 'Unknown Chef'}
                          </h4>
                          <Badge 
                            variant={review.status === 'published' ? 'secondary' : 
                                   review.status === 'awaiting_email' ? 'outline' : 'destructive'}
                            className={
                              review.status === 'published' ? 'bg-green-100 text-green-800' :
                              review.status === 'awaiting_email' ? 'border-purple-200 text-purple-700' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {review.status === 'awaiting_email' ? 'Awaiting Verification' :
                             review.status === 'published' ? 'Published' :
                             review.status === 'spam' ? 'Spam/Deleted' : review.status}
                          </Badge>
                        </div>
                        
                        {/* Star Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>
                              ★
                            </span>
                          ))}
                          <span className="text-sm text-gray-500 ml-2">{review.rating}/5</span>
                        </div>
                        
                        {/* Comment Excerpt */}
                        {review.comment && (
                          <p className="text-sm text-gray-600 mb-2">
                            {review.comment.length > 100 
                              ? `${review.comment.substring(0, 100)}...` 
                              : review.comment}
                          </p>
                        )}
                        
                        {/* Metadata */}
                        <div className="text-xs text-gray-500">
                          Submitted: {new Date(review.created_at).toLocaleDateString()}
                          {review.published_at && (
                            <span className="ml-4">
                              Published: {new Date(review.published_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="ml-4">
                        <ReviewActions 
                          reviewId={review.id}
                          status={review.status}
                          onAction={fetchData}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500">No reviews found</p>
                </div>
              )}
            </div>
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
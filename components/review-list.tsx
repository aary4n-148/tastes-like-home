import { Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Review } from '@/lib/data'

interface ReviewListProps {
  reviews: Review[]
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="mb-4">
          <Star className="w-12 h-12 mx-auto text-gray-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">No reviews yet</h3>
        <p className="text-sm">Be the first to share your experience with this chef!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  )
}

interface ReviewCardProps {
  review: Review
}

function ReviewCard({ review }: ReviewCardProps) {
  // Generate avatar initial from reviewer name or use default
  const avatarInitial = review.reviewer_name?.[0]?.toUpperCase() || '?'
  
  // Generate a consistent color based on the review ID for avatar
  const avatarColors = [
    'bg-orange-100 text-orange-600',
    'bg-blue-100 text-blue-600',
    'bg-green-100 text-green-600',
    'bg-purple-100 text-purple-600',
    'bg-pink-100 text-pink-600',
    'bg-indigo-100 text-indigo-600'
  ]
  const avatarColor = avatarColors[parseInt(review.id.slice(-1), 16) % avatarColors.length]

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${avatarColor}`}>
          <span className="font-semibold text-sm">{avatarInitial}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Header: Rating and timestamp */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {/* Star rating */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating 
                        ? 'fill-orange-400 text-orange-400' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              {/* Reviewer name (if available) */}
              {review.reviewer_name && (
                <span className="text-sm font-medium text-gray-700">
                  {review.reviewer_name}
                </span>
              )}
            </div>
            
            {/* Timestamp */}
            <span className="text-sm text-gray-500 flex-shrink-0">
              {formatDistanceToNow(new Date(review.published_at), { addSuffix: true })}
            </span>
          </div>
          
          {/* Review comment */}
          {review.comment && (
            <p className="text-gray-700 leading-relaxed text-sm">
              {review.comment}
            </p>
          )}
          
          {/* Verified badge */}
          {review.verified_at && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                ✓ Verified review
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Summary component that shows average rating and total count
 * Used at the top of review sections
 */
interface ReviewSummaryProps {
  avgRating: number
  reviewCount: number
}

export function ReviewSummary({ avgRating, reviewCount }: ReviewSummaryProps) {
  return (
    <div className="flex items-center gap-4 mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
      <div className="flex items-center gap-2">
        {/* Large star */}
        <Star className="w-8 h-8 fill-orange-400 text-orange-400" />
        
        {/* Rating number */}
        <span className="text-2xl font-bold text-gray-900">
          {avgRating.toFixed(1)}
        </span>
      </div>
      
      <div className="text-sm text-gray-600">
        <p className="font-medium">
          {reviewCount} review{reviewCount !== 1 ? 's' : ''}
        </p>
        <p>Based on verified experiences</p>
      </div>
      
      {/* Star rating breakdown */}
      <div className="ml-auto hidden sm:flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= Math.round(avgRating) 
                ? 'fill-orange-400 text-orange-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
} 
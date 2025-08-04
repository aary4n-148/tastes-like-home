'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Star, X, Shield, TestTube } from 'lucide-react'
import { submitReview } from '@/app/reviews/actions'
import { toast } from 'sonner'

interface ReviewFormProps {
  chefId: string
  chefName: string
}

export default function ReviewForm({ chefId, chefName }: ReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpenForm = () => {
    setIsOpen(true)
  }

  const handleCloseForm = () => {
    setIsOpen(false)
    setRating(0)
    setComment('')
    setEmail('')
  }

  const validateForm = () => {
    if (!rating || rating < 1 || rating > 5) {
      toast.error('Please select a rating from 1-5 stars')
      return false
    }
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // Pass a simple token since Turnstile is disabled
      const result = await submitReview(chefId, rating, comment, email, 'security-disabled')
      
      if (result.success) {
        // Check if we're in test mode
        const isTestMode = process.env.NODE_ENV === 'development' && process.env.REVIEW_TEST_MODE === 'true'
        
        if (isTestMode) {
          toast.success('Review submitted! Check browser console for verification URL.')
        } else {
          toast.success(result.message || 'Review submitted successfully! Check your email to verify.')
        }
        handleCloseForm()
      } else {
        toast.error(result.error || 'Failed to submit review')
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
      console.error('Review submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={handleOpenForm} className="w-full">
        Write a review
      </Button>
    )
  }

  // Check if we're in test mode
  const isTestMode = process.env.NODE_ENV === 'development' && process.env.REVIEW_TEST_MODE === 'true'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Write a review for {chefName}</h3>
          <Button variant="ghost" size="sm" onClick={handleCloseForm}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Test Mode Indicator */}
        {isTestMode && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <TestTube className="h-4 w-4" />
              <span className="text-sm font-medium">Test Mode Active</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Emails are simulated. Check browser console for verification URL.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">Rating *</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Comment */}
          <div>
            <label className="block text-sm font-medium mb-2">Comment (optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
            />
          </div>
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Used only for verification. Not displayed publicly.
            </p>
          </div>
          
          {/* Security Status */}
          <div className="flex items-center space-x-2 text-sm">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-green-600">Email verification required</span>
          </div>
          
          {/* Submit */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Send Review Link'}
          </Button>
        </form>
      </div>
    </div>
  )
} 
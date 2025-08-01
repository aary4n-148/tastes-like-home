'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Star, X } from 'lucide-react'
import { submitReview } from '@/app/reviews/actions'
import { toast } from 'sonner'

declare global {
  interface Window {
    turnstile: {
      render: (container: string, options: any) => string
      reset: (widgetId: string) => void
      getResponse: (widgetId: string) => string
    }
  }
}

interface ReviewFormProps {
  chefId: string
  chefName: string
}

export default function ReviewForm({ chefId, chefName }: ReviewFormProps) {
  // Form state
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  // Turnstile widget reference
  const turnstileWidgetId = useRef<string | null>(null)

  // Load Turnstile script and render widget
  const initializeTurnstile = () => {
    if (typeof window.turnstile !== 'undefined') {
      renderTurnstile()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    script.onload = renderTurnstile
    document.head.appendChild(script)
  }

  const renderTurnstile = () => {
    if (typeof window.turnstile !== 'undefined') {
      turnstileWidgetId.current = window.turnstile.render('#turnstile-container', {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
        theme: 'light',
        size: 'invisible'
      })
    }
  }

  const handleOpenForm = () => {
    setIsOpen(true)
    // Initialize Turnstile when form opens
    setTimeout(initializeTurnstile, 100)
  }

  const handleCloseForm = () => {
    setIsOpen(false)
    setRating(0)
    setComment('')
    setEmail('')
    setHoveredRating(0)
  }

  const validateForm = () => {
    if (!rating) {
      toast.error('Please select a rating')
      return false
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return false
    }
    
    if (comment.length > 280) {
      toast.error('Comment must be 280 characters or less')
      return false
    }

    return true
  }

  const getTurnstileToken = (): string => {
    if (turnstileWidgetId.current && typeof window.turnstile !== 'undefined') {
      return window.turnstile.getResponse(turnstileWidgetId.current)
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    const turnstileToken = getTurnstileToken()
    if (!turnstileToken) {
      toast.error('Security verification failed. Please try again.')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const result = await submitReview(chefId, rating, comment, email, turnstileToken)
      
      if (result.success) {
        toast.success(result.message || 'Review submitted successfully!')
        handleCloseForm()
      } else {
        toast.error(result.error || 'Failed to submit review')
        // Reset Turnstile on error
        if (turnstileWidgetId.current && typeof window.turnstile !== 'undefined') {
          window.turnstile.reset(turnstileWidgetId.current)
        }
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
      console.error('Review submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Closed state - just the button
  if (!isOpen) {
    return (
      <Button 
        onClick={handleOpenForm}
        variant="outline" 
        className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300"
      >
        Write a review
      </Button>
    )
  }

  // Open state - full form
  return (
    <div className="border border-orange-200 rounded-lg p-6 bg-orange-50/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Write a review for {chefName}
        </h3>
        <Button
          onClick={handleCloseForm}
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 cursor-pointer transition-colors ${
                  star <= (hoveredRating || rating) 
                    ? 'fill-orange-400 text-orange-400' 
                    : 'text-gray-300 hover:text-orange-200'
                }`}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {rating} star{rating !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comment (optional, max 280 characters)
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this chef..."
            maxLength={280}
            rows={3}
            className="resize-none border-orange-200 focus:border-orange-400 focus:ring-orange-400"
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              {280 - comment.length} characters remaining
            </p>
            {comment.length > 260 && (
              <p className="text-xs text-orange-600 font-medium">
                Approaching limit
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email address <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
          />
          <p className="text-xs text-gray-500 mt-1">
            We'll never show this publicly. Used only for verification.
          </p>
        </div>

        {/* Turnstile Container (invisible) */}
        <div id="turnstile-container" className="hidden" />

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || !rating || !email}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </span>
            ) : (
              'Send review link'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCloseForm}
            disabled={isSubmitting}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
        </div>

        {/* Security Notice */}
        <p className="text-xs text-gray-500 text-center pt-2">
          This form is protected by Cloudflare Turnstile for spam prevention.
        </p>
      </form>
    </div>
  )
} 
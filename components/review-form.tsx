'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Star, X, Shield, AlertTriangle } from 'lucide-react'
import { submitReview } from '@/app/reviews/actions'
import { toast } from 'sonner'

declare global {
  interface Window {
    turnstile: {
      render: (container: string, options: any) => string
      reset: (widgetId: string) => void
      getResponse: (widgetId: string) => string
      ready: (callback: () => void) => void
    }
  }
}

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
  
  // Turnstile state
  const [turnstileError, setTurnstileError] = useState(false)
  const [turnstileStatus, setTurnstileStatus] = useState<'loading' | 'ready' | 'error' | 'disabled'>('loading')
  const turnstileWidgetId = useRef<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      initializeTurnstile()
    }
  }, [isOpen])

  const initializeTurnstile = () => {
    // If no site key configured, disable Turnstile
    if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      setTurnstileStatus('disabled')
      return
    }

    // Check if turnstile is already available
    if (window.turnstile) {
      renderTurnstile()
      return
    }

    // Use turnstile.ready() for proper initialization timing
    const checkTurnstileReady = () => {
      if (window.turnstile && window.turnstile.ready) {
        window.turnstile.ready(() => {
          renderTurnstile()
        })
      } else if (window.turnstile) {
        // Fallback if ready() not available but turnstile is
        renderTurnstile()
      } else {
        // Turnstile not loaded yet, retry
        setTimeout(checkTurnstileReady, 100)
      }
    }

    checkTurnstileReady()
  }

  const renderTurnstile = () => {
    if (!window.turnstile || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      setTurnstileStatus('error')
      return
    }

    try {
      const container = document.getElementById('turnstile-container')
      if (container && !turnstileWidgetId.current) {
        turnstileWidgetId.current = window.turnstile.render('#turnstile-container', {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
          theme: 'light',
          size: 'normal',
          callback: () => {
            setTurnstileStatus('ready')
          },
          'error-callback': () => {
            console.warn('Turnstile widget error - continuing without it')
            setTurnstileStatus('error')
            setTurnstileError(true)
          },
          'expired-callback': () => {
            console.warn('Turnstile token expired - resetting widget')
            setTurnstileStatus('error')
            setTurnstileError(true)
          },
          'timeout-callback': () => {
            console.warn('Turnstile challenge timeout - resetting widget')
            setTurnstileStatus('error')
            setTurnstileError(true)
          }
        })
        setTurnstileStatus('ready')
      }
    } catch (error) {
      console.warn('Failed to render Turnstile widget - continuing without it:', error)
      setTurnstileStatus('error')
      setTurnstileError(true)
    }
  }

  const handleOpenForm = () => {
    setIsOpen(true)
  }

  const handleCloseForm = () => {
    setIsOpen(false)
    setRating(0)
    setComment('')
    setEmail('')
    setTurnstileStatus('loading')
    setTurnstileError(false)
    
    // Clean up Turnstile widget
    if (turnstileWidgetId.current && window.turnstile) {
      try {
        window.turnstile.reset(turnstileWidgetId.current)
      } catch (error) {
        // Ignore cleanup errors
      }
      turnstileWidgetId.current = null
    }
  }

  const validateForm = () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return false
    }
    if (!email.trim()) {
      toast.error('Please enter your email')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address')
      return false
    }
    return true
  }

  const getTurnstileToken = () => {
    // If Turnstile is disabled or has errors, return fallback token
    if (turnstileStatus === 'disabled') {
      return 'turnstile-disabled'
    }
    if (turnstileStatus === 'error' || turnstileError) {
      return 'turnstile-fallback'
    }
    
    // Try to get real token
    if (window.turnstile && turnstileWidgetId.current) {
      try {
        const token = window.turnstile.getResponse(turnstileWidgetId.current)
        if (token) {
          return token
        }
      } catch (error) {
        console.warn('Failed to get Turnstile token - using fallback')
      }
    }
    
    return 'turnstile-fallback'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const turnstileToken = getTurnstileToken()
      
      const result = await submitReview(chefId, rating, comment, email, turnstileToken)
      
      if (result.success) {
        toast.success(result.message || 'Review submitted successfully! Check your email to verify.')
        handleCloseForm()
      } else {
        toast.error(result.error || 'Failed to submit review')
        
        // Reset Turnstile on error for retry
        if (turnstileWidgetId.current && window.turnstile && turnstileStatus === 'ready') {
          try {
            window.turnstile.reset(turnstileWidgetId.current)
          } catch (error) {
            // Ignore reset errors
          }
        }
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
      console.error('Review submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSecurityStatus = () => {
    switch (turnstileStatus) {
      case 'ready':
        return { icon: Shield, text: 'Security verified', color: 'text-green-600' }
      case 'loading':
        return { icon: Shield, text: 'Loading security check...', color: 'text-blue-600' }
      case 'error':
        return { icon: AlertTriangle, text: 'Security check unavailable', color: 'text-amber-600' }
      case 'disabled':
        return { icon: AlertTriangle, text: 'Security check disabled', color: 'text-gray-600' }
      default:
        return { icon: Shield, text: 'Loading...', color: 'text-gray-600' }
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={handleOpenForm} className="w-full">
        Write a review
      </Button>
    )
  }

  const securityStatus = getSecurityStatus()
  const SecurityIcon = securityStatus.icon

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Write a review for {chefName}</h3>
          <Button variant="ghost" size="sm" onClick={handleCloseForm}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
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
            <SecurityIcon className={`h-4 w-4 ${securityStatus.color}`} />
            <span className={securityStatus.color}>{securityStatus.text}</span>
          </div>
          
          {/* Turnstile Container */}
          <div id="turnstile-container" className="min-h-[65px] flex items-center justify-center">
            {turnstileStatus === 'loading' && (
              <div className="text-sm text-gray-500">Loading security verification...</div>
            )}
            {(turnstileStatus === 'error' || turnstileStatus === 'disabled') && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border">
                Security verification unavailable - form will still work
              </div>
            )}
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
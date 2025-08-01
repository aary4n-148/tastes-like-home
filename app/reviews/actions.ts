'use server'

import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { hashEmail, hashIP, createSignedToken } from '@/lib/crypto'
import { sendReviewVerificationEmail } from '@/lib/email'

// Type definitions for better type safety
interface SubmitReviewResult {
  success: boolean
  error?: string
  message?: string
}

interface TurnstileVerificationResult {
  success: boolean
  score?: number
  error_codes?: string[]
  hostname?: string
  challenge_ts?: string
}

/**
 * Verify Turnstile token server-side to prevent client-side spoofing
 * Calls Cloudflare's verification API with secret key and validates response
 */
async function verifyTurnstile(token: string, ip: string): Promise<{ success: boolean; score?: number; error?: string }> {
  try {
    if (!process.env.TURNSTILE_SECRET_KEY) {
      return { success: false, error: 'Turnstile secret key not configured' }
    }

    const formData = new FormData()
    formData.append('secret', process.env.TURNSTILE_SECRET_KEY)
    formData.append('response', token)
    formData.append('remoteip', ip) // Optional but recommended for abuse prevention

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    })

    const outcome = await result.json() as TurnstileVerificationResult

    if (!outcome.success) {
      // Handle specific error codes as per Cloudflare docs
      const errorCode = outcome.error_codes?.[0] || 'unknown'
      let errorMessage = 'Security verification failed'
      
      switch (errorCode) {
        case 'missing-input-secret':
        case 'invalid-input-secret':
          errorMessage = 'Server configuration error'
          break
        case 'missing-input-response':
        case 'invalid-input-response':
          errorMessage = 'Invalid security token'
          break
        case 'timeout-or-duplicate':
          errorMessage = 'Security token expired or already used'
          break
        case 'internal-error':
          errorMessage = 'Security service temporarily unavailable'
          break
        case 'bad-request':
          errorMessage = 'Invalid security request'
          break
        default:
          errorMessage = 'Security verification failed'
      }

      return { success: false, error: errorMessage }
    }

    // Validate hostname (recommended by Cloudflare)
    const expectedHostnames = ['localhost:3000', 'localhost', '127.0.0.1:3000']
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL)
      expectedHostnames.push(siteUrl.hostname)
      expectedHostnames.push(siteUrl.host) // includes port if present
    }
    
    if (outcome.hostname && !expectedHostnames.includes(outcome.hostname)) {
      return { success: false, error: 'Security verification failed - invalid origin' }
    }

    // Validate token age (tokens expire after 300 seconds)
    if (outcome.challenge_ts) {
      const challengeTime = new Date(outcome.challenge_ts)
      const now = new Date()
      const ageInSeconds = (now.getTime() - challengeTime.getTime()) / 1000
      
      if (ageInSeconds > 300) {
        return { success: false, error: 'Security token expired' }
      }
    }

    // Success - return with score (higher is better, max 1.0)
    // Cloudflare doesn't always provide score, so we default to 0.8 for successful verification
    return { success: true, score: 0.8 }

  } catch (error) {
    console.error('Turnstile verification error:', error)
    return { success: false, error: 'Security verification service unavailable' }
  }
}

/**
 * Main server action to submit a review
 * Handles validation, security checks, database operations, and email sending
 */
export async function submitReview(
  chefId: string,
  rating: number,
  comment: string,
  email: string,
  turnstileToken: string
): Promise<SubmitReviewResult> {
  try {
    // === INPUT VALIDATION ===
    if (!rating || rating < 1 || rating > 5) {
      return { success: false, error: 'Please select a rating from 1-5 stars' }
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'Please enter a valid email address' }
    }
    
    if (comment && comment.length > 280) {
      return { success: false, error: 'Comment must be 280 characters or less' }
    }

    // === GET CLIENT IP FOR SECURITY ===
    const headersList = await headers()
    const clientIp = headersList.get('x-forwarded-for')?.split(',')[0] || 
                     headersList.get('x-real-ip') || 
                     '127.0.0.1'

    // === VERIFY TURNSTILE (SPAM PROTECTION) ===
    let turnstileScore = 0.5 // Default score for fallback cases
    
    if (turnstileToken === 'turnstile-disabled') {
      // Turnstile is disabled (no site key configured)
      turnstileScore = 0.3 // Lower score but still allow
    } else if (turnstileToken === 'turnstile-fallback') {
      // Turnstile failed to load or had errors
      turnstileScore = 0.4 // Slightly higher than disabled
    } else {
      // Attempt real Turnstile verification
      if (!turnstileToken) {
        return { success: false, error: 'Security verification required. Please refresh and try again.' }
      }
      
      const turnstileResult = await verifyTurnstile(turnstileToken, clientIp)
      if (!turnstileResult.success) {
        return { success: false, error: turnstileResult.error || 'Security verification failed. Please refresh and try again.' }
      }
      turnstileScore = turnstileResult.score || 0.8 // Higher score for verified tokens
    }

    // === DATABASE SETUP ===
    const supabase = createSupabaseAdminClient()
    const emailHash = hashEmail(email)
    const ipHash = hashIP(clientIp)
    
    // === CHECK FOR DUPLICATE REVIEWS ===
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('chef_id', chefId)
      .eq('email_hash', emailHash)
      .single()
    
    if (existingReview) {
      return { success: false, error: 'You have already reviewed this chef' }
    }

    // === RATE LIMITING: Max 3 reviews per IP per hour ===
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: ipSubmissions } = await supabase
      .from('reviews')
      .select('id', { count: 'exact' })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneHourAgo)
    
    if (ipSubmissions && ipSubmissions >= 3) {
      return { success: false, error: 'Too many reviews from your location. Please try again later.' }
    }

    // === VERIFY CHEF EXISTS AND IS VERIFIED ===
    const { data: chef } = await supabase
      .from('chefs')
      .select('name')
      .eq('id', chefId)
      .eq('verified', true)
      .single()
    
    if (!chef) {
      return { success: false, error: 'Chef not found or not available for reviews' }
    }
    
    // === CREATE REVIEW RECORD ===
    const reviewData = {
      chef_id: chefId,
      rating,
      comment: comment || null,
      email_hash: emailHash,
      ip_hash: ipHash,
      status: 'awaiting_email',
      turnstile_score: turnstileScore
    }
    
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select('id, verification_token')
      .single()
    
    if (insertError) {
      console.error('Error creating review:', insertError)
      return { success: false, error: 'Failed to create review. Please try again.' }
    }

    // === LOG REVIEW CREATION ===
    await supabase
      .from('review_events')
      .insert({
        review_id: review.id,
        from_status: null,
        to_status: 'awaiting_email',
        actor: 'user',
        notes: `Review submitted with Turnstile score: ${turnstileScore}`
      })
    
    // === SEND VERIFICATION EMAIL ===
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/verify-review?token=${review.verification_token}`
    const emailResult = await sendReviewVerificationEmail(email, chef.name, verificationUrl)
    
    if (!emailResult.success) {
      // If email fails, clean up the review to prevent orphaned records
      await supabase.from('reviews').delete().eq('id', review.id)
      console.error('Email sending failed, review cleaned up:', emailResult.error)
      return { success: false, error: 'Failed to send verification email. Please check your email address and try again.' }
    }
    
    return { 
      success: true, 
      message: 'Great! Check your inbox and click the link to publish your review.' 
    }
    
  } catch (error) {
    console.error('Error in submitReview:', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
} 
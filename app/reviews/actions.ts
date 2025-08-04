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

/**
 * Main server action to submit a review
 * Handles validation, security checks, database operations, and email sending
 */
export async function submitReview(
  chefId: string,
  rating: number,
  comment: string,
  email: string,
  securityToken: string // Simplified parameter - no longer used for Turnstile
): Promise<SubmitReviewResult> {
  console.log('🔍 Starting review submission for chef:', chefId, 'email:', email)
  
  // Test environment variables first
  if (!process.env.REVIEW_VERIFICATION_SECRET) {
    console.error('🔍 Missing REVIEW_VERIFICATION_SECRET')
    return { success: false, error: 'Server configuration error - missing verification secret' }
  }
  
  try {
    // === INPUT VALIDATION ===
    if (!rating || rating < 1 || rating > 5) {
      return { success: false, error: 'Please select a rating from 1-5 stars' }
    }
    
    if (!email || !email.includes('@')) {
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
    
    if (ipSubmissions && ipSubmissions >= 10) { // Temporarily increased for testing
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
      turnstile_score: 0.5 // Default score since Turnstile is disabled
    }
    
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select('id')
      .single()
    
    if (insertError) {
      console.error('Error creating review:', insertError)
      return { success: false, error: 'Failed to create review. Please try again.' }
    }

    // === STORE VERIFICATION TOKEN ===
    const verificationToken = createSignedToken(review.id, email)
    await supabase
      .from('reviews')
      .update({ verification_token: verificationToken })
      .eq('id', review.id)

    // === LOG REVIEW CREATION ===
    await supabase
      .from('review_events')
      .insert({
        review_id: review.id,
        from_status: null,
        to_status: 'awaiting_email',
        actor: 'user',
        notes: 'Review submitted - awaiting email verification'
      })

    // === SEND VERIFICATION EMAIL ===
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/verify-review?token=${verificationToken}`
    
    const emailResult = await sendReviewVerificationEmail(email, chef.name, verificationUrl)
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      // Don't fail the review submission - user can request email resend later
    }

    // === SUCCESS RESPONSE ===
    return {
      success: true,
      message: 'Review submitted successfully! Please check your email to verify and publish your review.'
    }

  } catch (error) {
    console.error('Review submission error:', error)
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      
      // Check for specific error types
      if (error.message.includes('REVIEW_VERIFICATION_SECRET')) {
        return { success: false, error: 'Server configuration error - missing verification secret' }
      }
      if (error.message.includes('database') || error.message.includes('connection')) {
        return { success: false, error: 'Database connection error' }
      }
      if (error.message.includes('rate limit') || error.message.includes('too many')) {
        return { success: false, error: 'Rate limit exceeded - please try again later' }
      }
    }
    
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
} 
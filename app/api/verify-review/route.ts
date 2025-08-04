import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

/**
 * Handle email verification links
 * When users click the link in their email, this endpoint:
 * 1. Validates the verification token
 * 2. Updates review status to published
 * 3. Logs the verification event
 * 4. Redirects user to chef profile with success message
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')
  
  console.log('🔍 Verification attempt with token:', token ? token.substring(0, 20) + '...' : 'null')
  
  // Basic token validation
  if (!token) {
    console.log('🔍 No token provided')
    return NextResponse.redirect(new URL('/?error=missing-token', request.url))
  }
  
  try {
    const supabase = createSupabaseAdminClient()
    
    // Find review by verification token
    console.log('🔍 Searching for review with token in database...')
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('id, chef_id, status, verification_expires_at')
      .eq('verification_token', token)
      .single()
    
    if (fetchError || !review) {
      console.error('🔍 Review not found for token:', token ? token.substring(0, 20) + '...' : 'null', fetchError)
      return NextResponse.redirect(new URL('/?error=invalid-token', request.url))
    }
    
    console.log('🔍 Found review:', review.id, 'status:', review.status, 'chef_id:', review.chef_id)
    
    // Check if review is in the correct state for verification
    if (review.status !== 'awaiting_email') {
      // Review already verified or in different state
      if (review.status === 'published') {
        return NextResponse.redirect(new URL(`/chef/${review.chef_id}?info=already-verified`, request.url))
      } else {
        return NextResponse.redirect(new URL(`/chef/${review.chef_id}?error=verification-failed`, request.url))
      }
    }
    
    // Check if verification link has expired
    if (new Date() > new Date(review.verification_expires_at)) {
      // Log the expired attempt
      await supabase
        .from('review_events')
        .insert({
          review_id: review.id,
          from_status: 'awaiting_email',
          to_status: 'awaiting_email',
          actor: 'user',
          notes: 'Verification attempted with expired token'
        })
      
      return NextResponse.redirect(new URL(`/chef/${review.chef_id}?error=link-expired`, request.url))
    }
    
    // === VERIFY AND PUBLISH REVIEW ===
    console.log('🔍 Updating review status to published...')
    const { error: updateError } = await supabase
      .from('reviews')
      .update({ 
        status: 'published',
        verified_at: new Date().toISOString(),
        published_at: new Date().toISOString()
      })
      .eq('id', review.id)
    
    if (updateError) {
      console.error('🔍 Error updating review status:', updateError)
      return NextResponse.redirect(new URL(`/chef/${review.chef_id}?error=verification-failed`, request.url))
    }
    
    console.log('🔍 Review status updated successfully')
    
    // === LOG SUCCESSFUL VERIFICATION ===
    await supabase
      .from('review_events')
      .insert({
        review_id: review.id,
        from_status: 'awaiting_email',
        to_status: 'published',
        actor: 'user',
        notes: 'Email verification completed successfully'
      })
    
    // === REFRESH MATERIALIZED VIEW ===
    // This ensures rating statistics are updated immediately
    console.log('🔍 Attempting to refresh materialized view...')
    try {
      await supabase.rpc('refresh_chef_rating_stats', { chef_id: review.chef_id })
      console.log('🔍 Materialized view refreshed successfully')
    } catch (refreshError) {
      console.error('🔍 Error refreshing materialized view:', refreshError)
      // Continue anyway - the review is still published
    }
    
    // === TRIGGER CACHE REVALIDATION ===
    // This ensures the new review appears immediately on the chef profile
    console.log('🔍 Triggering cache revalidation...')
    revalidatePath(`/chef/${review.chef_id}`)
    revalidatePath('/') // Homepage ratings may have changed
    
    console.log('🔍 Redirecting to chef profile with success message')
    // === REDIRECT WITH SUCCESS MESSAGE ===
    return NextResponse.redirect(new URL(`/chef/${review.chef_id}?success=review-published`, request.url))
    
  } catch (error) {
    console.error('Error in review verification:', error)
    return NextResponse.redirect(new URL('/?error=verification-failed', request.url))
  }
}

/**
 * Handle preflight requests for CORS
 * Some email clients may send OPTIONS requests first
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 
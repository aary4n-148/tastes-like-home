'use server'

import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function approveChef(chefId: string) {
  try {
    // Use admin client to bypass RLS
    const supabase = createSupabaseAdminClient()
    
    const { error } = await supabase
      .from('chefs')
      .update({ verified: true })
      .eq('id', chefId)

    if (error) {
      console.error('Error approving chef:', error)
      return { success: false, error: error.message }
    }

    // Revalidate the admin page and homepage to show updated data
    revalidatePath('/admin')
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Error in approveChef action:', error)
    return { success: false, error: 'Failed to approve chef' }
  }
}

export async function publishReview(reviewId: string) {
  try {
    const supabase = createSupabaseAdminClient()
    
    // First, get the current review to check status and get chef_id
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('id, chef_id, status')
      .eq('id', reviewId)
      .single()
    
    if (fetchError || !review) {
      console.error('Error fetching review:', fetchError)
      return { success: false, error: 'Review not found' }
    }
    
    // Check if review is in the correct state for publishing
    if (review.status !== 'awaiting_email') {
      return { 
        success: false, 
        error: `Review cannot be published from status: ${review.status}` 
      }
    }
    
    // Update review status to published
    const { error: updateError } = await supabase
      .from('reviews')
      .update({ 
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', reviewId)
    
    if (updateError) {
      console.error('Error publishing review:', updateError)
      return { success: false, error: updateError.message }
    }
    
    // Log the action for audit trail
    await supabase
      .from('review_events')
      .insert({
        review_id: reviewId,
        from_status: 'awaiting_email',
        to_status: 'published',
        actor: 'admin',
        notes: 'Published by admin'
      })
    
    // Refresh materialized view for rating statistics
    try {
      await supabase.rpc('refresh_chef_rating_stats', { chef_id: review.chef_id })
    } catch (refreshError) {
      console.error('Error refreshing materialized view:', refreshError)
      // Continue anyway - the review is still published
    }
    
    // Revalidate affected pages
    revalidatePath('/admin')
    revalidatePath(`/chef/${review.chef_id}`)
    revalidatePath('/')
    
    return { success: true }
  } catch (error) {
    console.error('Error in publishReview action:', error)
    return { success: false, error: 'Failed to publish review' }
  }
}

export async function deleteReview(reviewId: string) {
  try {
    const supabase = createSupabaseAdminClient()
    
    // First, get the current review to check status and get chef_id
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('id, chef_id, status')
      .eq('id', reviewId)
      .single()
    
    if (fetchError || !review) {
      console.error('Error fetching review:', fetchError)
      return { success: false, error: 'Review not found' }
    }
    
    // Check if review is already deleted/spam
    if (review.status === 'spam') {
      return { success: false, error: 'Review is already deleted' }
    }
    
    // Soft delete by updating status to spam
    const { error: updateError } = await supabase
      .from('reviews')
      .update({ status: 'spam' })
      .eq('id', reviewId)
    
    if (updateError) {
      console.error('Error deleting review:', updateError)
      return { success: false, error: updateError.message }
    }
    
    // Log the action for audit trail
    await supabase
      .from('review_events')
      .insert({
        review_id: reviewId,
        from_status: review.status,
        to_status: 'spam',
        actor: 'admin',
        notes: 'Deleted by admin'
      })
    
    // Refresh materialized view for rating statistics (only if review was published)
    if (review.status === 'published') {
      try {
        await supabase.rpc('refresh_chef_rating_stats', { chef_id: review.chef_id })
      } catch (refreshError) {
        console.error('Error refreshing materialized view:', refreshError)
        // Continue anyway - the review is still deleted
      }
    }
    
    // Revalidate affected pages
    revalidatePath('/admin')
    revalidatePath(`/chef/${review.chef_id}`)
    revalidatePath('/')
    
    return { success: true }
  } catch (error) {
    console.error('Error in deleteReview action:', error)
    return { success: false, error: 'Failed to delete review' }
  }
} 
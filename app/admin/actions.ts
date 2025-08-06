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

export async function fetchAdminData() {
  try {
    const supabase = createSupabaseAdminClient()

    // Fetch chefs
    const { data: chefs, error: chefsError } = await supabase
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

    if (chefsError) {
      console.error('Error fetching chefs:', chefsError)
      return { success: false, error: `Error loading chefs: ${chefsError.message}` }
    }

    // Fetch chef applications
    const { data: applications, error: applicationsError } = await supabase
      .from('chef_applications')
      .select(`
        id,
        answers,
        status,
        admin_notes,
        created_at,
        updated_at,
        approved_at,
        rejected_at
      `)
      .order('created_at', { ascending: false })

    if (applicationsError) {
      console.error('Error fetching applications:', applicationsError)
      return { success: false, error: `Error loading applications: ${applicationsError.message}` }
    }

    // Fetch reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        status,
        created_at,
        published_at,
        chefs(id, name)
      `)
      .order('created_at', { ascending: false })

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      return { success: false, error: `Error loading reviews: ${reviewsError.message}` }
    }

    return {
      success: true,
      data: {
        chefs: chefs || [],
        reviews: reviews || [],
        applications: applications || []
      }
    }
  } catch (error) {
    console.error('Error in fetchAdminData:', error)
    return { success: false, error: 'An unexpected error occurred while loading data' }
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

/**
 * ============================================================================
 * CHEF APPLICATION MANAGEMENT FUNCTIONS
 * ============================================================================
 * 
 * These functions handle the complete chef application lifecycle:
 * - approveApplication: Converts applications to live chef profiles
 * - rejectApplication: Marks applications as rejected with optional reason
 * - updateApplicationNotes: Adds internal admin notes to applications
 * 
 * All functions use the admin client for full database access and include
 * proper error handling, logging, and cache invalidation.
 */
/**
 * Approves a chef application and creates a live chef profile
 * 
 * @param applicationId - UUID of the application to approve
 * @returns Promise with success status and optional chef ID
 * 
 * Process:
 * 1. Validates application exists and is pending
 * 2. Creates chef record with verified=true
 * 3. Parses and inserts cuisine specialties
 * 4. Updates application status to approved
 * 5. Revalidates affected page caches
 */
export async function approveApplication(applicationId: string) {
  try {
    const supabase = createSupabaseAdminClient()

    // First, get the application data
    const { data: application, error: fetchError } = await supabase
      .from('chef_applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      return { success: false, error: 'Application not found' }
    }

    if (application.status !== 'pending') {
      return { success: false, error: 'Application has already been processed' }
    }

    // Create chef record from application data
    const answers = application.answers as Record<string, any>
    
    const { data: newChef, error: chefError } = await supabase
      .from('chefs')
      .insert({
        name: answers['Full Name'],
        bio: answers['Bio/About You'],
        phone: answers['Phone Number'],
        hourly_rate: answers['Hourly Rate (£)'],
        verified: true, // Auto-approve when created from application
        // photo_url will be handled when we add file uploads
      })
      .select('id')
      .single()

    if (chefError) {
      console.error('Error creating chef:', chefError)
      return { success: false, error: 'Failed to create chef profile' }
    }

    // Add cuisine specialties
    if (answers['Cuisine Specialties']) {
      const cuisines = answers['Cuisine Specialties'].split(',').map((c: string) => c.trim())
      
      const cuisineInserts = cuisines.map((cuisine: string) => ({
        chef_id: newChef.id,
        cuisine: cuisine
      }))

      const { error: cuisineError } = await supabase
        .from('chef_cuisines')
        .insert(cuisineInserts)

      if (cuisineError) {
        console.error('Error adding cuisines:', cuisineError)
        // Continue anyway - chef is created
      }
    }

    // Update application status
    const { error: updateError } = await supabase
      .from('chef_applications')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)

    if (updateError) {
      console.error('Error updating application status:', updateError)
      // Continue anyway - chef is created
    }

    // Note: Approval email notifications will be implemented in future iteration

    // Revalidate pages
    revalidatePath('/admin')
    revalidatePath('/')

    return { success: true, chefId: newChef.id }
  } catch (error) {
    console.error('Error in approveApplication:', error)
    return { success: false, error: 'Failed to approve application' }
  }
}

/**
 * Rejects a chef application with optional reason
 * 
 * @param applicationId - UUID of the application to reject
 * @param reason - Optional rejection reason for admin notes
 * @returns Promise with success status
 */
export async function rejectApplication(applicationId: string, reason?: string) {
  try {
    const supabase = createSupabaseAdminClient()

    // Update application status
    const { error: updateError } = await supabase
      .from('chef_applications')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        admin_notes: reason || null
      })
      .eq('id', applicationId)

    if (updateError) {
      console.error('Error rejecting application:', updateError)
      return { success: false, error: 'Failed to reject application' }
    }

    // Note: Rejection email notifications will be implemented in future iteration

    // Revalidate admin page
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Error in rejectApplication:', error)
    return { success: false, error: 'Failed to reject application' }
  }
}

/**
 * Updates admin notes for a chef application
 * 
 * @param applicationId - UUID of the application to update
 * @param notes - Admin notes text
 * @returns Promise with success status
 */
export async function updateApplicationNotes(applicationId: string, notes: string) {
  try {
    const supabase = createSupabaseAdminClient()

    const { error } = await supabase
      .from('chef_applications')
      .update({
        admin_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)

    if (error) {
      console.error('Error updating application notes:', error)
      return { success: false, error: 'Failed to update notes' }
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error in updateApplicationNotes:', error)
    return { success: false, error: 'Failed to update notes' }
  }
} 
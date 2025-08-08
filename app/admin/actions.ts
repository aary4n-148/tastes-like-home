'use server'

import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { sendApplicationApprovalEmail, sendApplicationRejectionEmail } from '@/lib/email'

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
 * 3. Parses and inserts best dishes
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
    const fileUploads = application.file_uploads || { profile_photos: [], food_photos: [] }
    
    // Get the first profile photo URL if available
    let photoUrl = null
    if (fileUploads.profile_photos && fileUploads.profile_photos.length > 0) {
      photoUrl = fileUploads.profile_photos[0].fileUrl
    }
    
    const { data: newChef, error: chefError } = await supabase
      .from('chefs')
      .insert({
        name: answers['Full Name'],
        bio: answers['Bio/About You'],
        phone: answers['Phone Number'],
        hourly_rate: answers['Hourly Rate (£)'],
        photo_url: photoUrl, // Use uploaded profile photo
        verified: true, // Auto-approve when created from application
      })
      .select('id')
      .single()

    if (chefError) {
      console.error('Error creating chef:', chefError)
      return { success: false, error: 'Failed to create chef profile' }
    }

    // Add best dishes
    if (answers['Best Dishes']) {
      const cuisines = answers['Best Dishes'].split(',').map((c: string) => c.trim())
      
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

    // Add food photos from application
    if (fileUploads.food_photos && fileUploads.food_photos.length > 0) {
      const foodPhotoInserts = fileUploads.food_photos.map((photo: any, index: number) => ({
        chef_id: newChef.id,
        photo_url: photo.fileUrl,
        display_order: index
      }))

      const { error: photoError } = await supabase
        .from('food_photos')
        .insert(foodPhotoInserts)

      if (photoError) {
        console.error('Error adding food photos:', photoError)
        // Continue anyway - chef is created
      }
    }

    // Update application status and link to chef
    const { error: updateError } = await supabase
      .from('chef_applications')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        chef_id: newChef.id // Link application to created chef
      })
      .eq('id', applicationId)

    if (updateError) {
      console.error('Error updating application status:', updateError)
      // Continue anyway - chef is created
    }

    // Send approval email to chef
    const chefEmail = answers['Email Address'] as string
    const chefName = answers['Full Name'] as string
    if (chefEmail && chefName) {
      const approvalResult = await sendApplicationApprovalEmail(
        chefEmail,
        chefName,
        newChef.id
      )
      
      if (!approvalResult.success) {
        console.error('Failed to send approval email:', approvalResult.error)
        // Continue anyway - chef is created and approved
      }
    }

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

    // First, get the application data for email
    const { data: application, error: fetchError } = await supabase
      .from('chef_applications')
      .select('answers')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      console.error('Error fetching application for rejection:', fetchError)
      return { success: false, error: 'Application not found' }
    }

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

    // Send rejection email to chef
    const answers = application.answers as Record<string, any>
    const chefEmail = answers['Email Address'] as string
    const chefName = answers['Full Name'] as string
    
    if (chefEmail && chefName) {
      const rejectionResult = await sendApplicationRejectionEmail(
        chefEmail,
        chefName
      )
      
      if (!rejectionResult.success) {
        console.error('Failed to send rejection email:', rejectionResult.error)
        // Continue anyway - application is rejected
      }
    }

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

// =============================================================================
// CHEF MANAGEMENT ACTIONS
// =============================================================================

/**
 * Update chef profile information (name, bio, phone, hourly_rate, location)
 */
export async function updateChefProfile(chefId: string, data: {
  name: string
  bio: string
  phone: string
  hourly_rate: number
  location_label?: string
}) {
  try {
    const supabase = createSupabaseAdminClient()

    // Update chef profile
    const { error } = await supabase
      .from('chefs')
      .update({
        name: data.name,
        bio: data.bio,
        phone: data.phone,
        hourly_rate: data.hourly_rate,
        location_label: data.location_label || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', chefId)

    if (error) {
      console.error('Error updating chef profile:', error)
      return { success: false, error: error.message }
    }

    // Log the change
    await supabase
      .from('chef_audit_log')
      .insert({
        chef_id: chefId,
        action: 'updated',
        metadata: { fields: ['name', 'bio', 'phone', 'hourly_rate', 'location_label'] }
      })

    // Revalidate relevant pages
    revalidatePath('/admin')
    revalidatePath(`/admin/chefs/${chefId}`)
    revalidatePath(`/chef/${chefId}`)
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Error in updateChefProfile:', error)
    return { success: false, error: 'Failed to update chef profile' }
  }
}

/**
 * Update chef cuisine specialties
 */
export async function updateChefCuisines(chefId: string, cuisines: string[]) {
  try {
    const supabase = createSupabaseAdminClient()

    // Delete existing cuisines
    const { error: deleteError } = await supabase
      .from('chef_cuisines')
      .delete()
      .eq('chef_id', chefId)

    if (deleteError) {
      console.error('Error deleting old cuisines:', deleteError)
      return { success: false, error: deleteError.message }
    }

    // Insert new cuisines
    if (cuisines.length > 0) {
      const cuisineRows = cuisines.map(cuisine => ({
        chef_id: chefId,
        cuisine: cuisine.trim()
      }))

      const { error: insertError } = await supabase
        .from('chef_cuisines')
        .insert(cuisineRows)

      if (insertError) {
        console.error('Error inserting new cuisines:', insertError)
        return { success: false, error: insertError.message }
      }
    }

    // Update chef timestamp
    await supabase
      .from('chefs')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chefId)

    // Log the change
    await supabase
      .from('chef_audit_log')
      .insert({
        chef_id: chefId,
        action: 'updated',
        metadata: { field: 'cuisines', new_value: cuisines }
      })

    // Revalidate relevant pages
    revalidatePath('/admin')
    revalidatePath(`/admin/chefs/${chefId}`)
    revalidatePath(`/chef/${chefId}`)
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Error in updateChefCuisines:', error)
    return { success: false, error: 'Failed to update chef cuisines' }
  }
}

/**
 * Update chef publication status (published/unpublished)
 */
export async function updateChefStatus(chefId: string, status: 'published' | 'unpublished') {
  try {
    const supabase = createSupabaseAdminClient()

    // Update chef status (and sync with verified for backward compatibility)
    const { error } = await supabase
      .from('chefs')
      .update({
        status: status,
        verified: status === 'published', // Keep verified in sync
        updated_at: new Date().toISOString()
      })
      .eq('id', chefId)

    if (error) {
      console.error('Error updating chef status:', error)
      return { success: false, error: error.message }
    }

    // Log the change
    await supabase
      .from('chef_audit_log')
      .insert({
        chef_id: chefId,
        action: status,
        metadata: { previous_status: status === 'published' ? 'unpublished' : 'published' }
      })

    // Revalidate relevant pages
    revalidatePath('/admin')
    revalidatePath(`/admin/chefs/${chefId}`)
    revalidatePath(`/chef/${chefId}`)
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Error in updateChefStatus:', error)
    return { success: false, error: 'Failed to update chef status' }
  }
}

/**
 * Delete a specific food photo
 */
export async function deleteChefPhoto(photoId: string, chefId: string) {
  try {
    const supabase = createSupabaseAdminClient()

    // Get photo details before deletion for cleanup
    const { data: photo, error: fetchError } = await supabase
      .from('food_photos')
      .select('photo_url')
      .eq('id', photoId)
      .eq('chef_id', chefId)
      .single()

    if (fetchError || !photo) {
      return { success: false, error: 'Photo not found' }
    }

    // Delete photo record from database
    const { error: deleteError } = await supabase
      .from('food_photos')
      .delete()
      .eq('id', photoId)
      .eq('chef_id', chefId)

    if (deleteError) {
      console.error('Error deleting photo record:', deleteError)
      return { success: false, error: deleteError.message }
    }

    // TODO: Delete actual file from storage
    // This would involve extracting the file path from photo_url and using storage.remove()
    // For now, we'll just log it for future implementation

    // Update chef timestamp
    await supabase
      .from('chefs')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chefId)

    // Log the change
    await supabase
      .from('chef_audit_log')
      .insert({
        chef_id: chefId,
        action: 'updated',
        metadata: { field: 'food_photo_deleted', photo_url: photo.photo_url }
      })

    // Revalidate relevant pages
    revalidatePath('/admin')
    revalidatePath(`/admin/chefs/${chefId}`)
    revalidatePath(`/chef/${chefId}`)

    return { success: true }
  } catch (error) {
    console.error('Error in deleteChefPhoto:', error)
    return { success: false, error: 'Failed to delete photo' }
  }
}

/**
 * Permanently delete a chef and all related data
 */
export async function deleteChefPermanently(chefId: string) {
  try {
    const supabase = createSupabaseAdminClient()

    // Get chef details for logging
    const { data: chef, error: fetchError } = await supabase
      .from('chefs')
      .select('name, photo_url')
      .eq('id', chefId)
      .single()

    if (fetchError || !chef) {
      return { success: false, error: 'Chef not found' }
    }

    // Log the deletion before it happens
    await supabase
      .from('chef_audit_log')
      .insert({
        chef_id: chefId,
        action: 'deleted',
        metadata: { chef_name: chef.name, deletion_type: 'permanent' }
      })

    // Delete chef record (cascades to related tables due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from('chefs')
      .delete()
      .eq('id', chefId)

    if (deleteError) {
      console.error('Error deleting chef:', deleteError)
      return { success: false, error: deleteError.message }
    }

    // TODO: Delete associated files from storage
    // This would involve:
    // 1. Deleting profile photo from storage
    // 2. Deleting all food photos from storage
    // For now, we'll just log it for future implementation

    // Revalidate relevant pages
    revalidatePath('/admin')
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Error in deleteChefPermanently:', error)
    return { success: false, error: 'Failed to delete chef' }
  }
}

/**
 * Replace chef profile photo
 */
export async function replaceChefProfilePhoto(chefId: string, formData: FormData) {
  try {
    const supabase = createSupabaseAdminClient()
    const file = formData.get('photo') as File

    if (!file || file.size === 0) {
      return { success: false, error: 'No file provided' }
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.' }
    }

    if (file.size > 25 * 1024 * 1024) { // 25MB limit
      return { success: false, error: 'File too large. Please upload images smaller than 25MB.' }
    }

    // Generate unique filename with more entropy
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const fileName = `chefs/${chefId}/profile/${timestamp}_${random}.${fileExt}`

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('chef-applications')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      console.error('File details:', { name: file.name, size: file.size, type: file.type })
      return { success: false, error: `Failed to upload photo. ${uploadError.message || 'Please try again.'}` }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('chef-applications')
      .getPublicUrl(fileName)

    // Update chef record
    const { error: updateError } = await supabase
      .from('chefs')
      .update({
        photo_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', chefId)

    if (updateError) {
      console.error('Error updating chef photo URL:', updateError)
      return { success: false, error: updateError.message }
    }

    // Log the change
    await supabase
      .from('chef_audit_log')
      .insert({
        chef_id: chefId,
        action: 'updated',
        metadata: { field: 'profile_photo', new_value: urlData.publicUrl }
      })

    // Revalidate relevant pages
    revalidatePath('/admin')
    revalidatePath(`/admin/chefs/${chefId}`)
    revalidatePath(`/chef/${chefId}`)
    revalidatePath('/')

    return { success: true, photo_url: urlData.publicUrl }
  } catch (error) {
    console.error('Error in replaceChefProfilePhoto:', error)
    return { success: false, error: 'Failed to replace profile photo' }
  }
}

/**
 * Add food photos to chef profile
 */
export async function addChefFoodPhotos(chefId: string, formData: FormData) {
  try {
    const supabase = createSupabaseAdminClient()
    const files = formData.getAll('photos') as File[]

    if (!files || files.length === 0) {
      return { success: false, error: 'No files provided' }
    }

    // Validate files
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxFileSize = 25 * 1024 * 1024 // 25MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return { success: false, error: `Invalid file type for ${file.name}. Please upload JPEG, PNG, or WebP images.` }
      }
      if (file.size > maxFileSize) {
        return { success: false, error: `File ${file.name} is too large. Please upload images smaller than 25MB.` }
      }
    }

    const uploadedPhotos = []

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 15)
      const fileName = `chefs/${chefId}/food/${timestamp}_${random}_${i}.${fileExt}`

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chef-applications')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        console.error('File details:', { name: file.name, size: file.size, type: file.type })
        return { success: false, error: `Failed to upload ${file.name}. ${uploadError.message || 'Please try again.'}` }
      }

      // Small delay between uploads to prevent overwhelming the server
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chef-applications')
        .getPublicUrl(fileName)

      uploadedPhotos.push({
        photo_url: urlData.publicUrl,
        display_order: i
      })
    }

    // Get current max display order
    const { data: maxOrderData } = await supabase
      .from('food_photos')
      .select('display_order')
      .eq('chef_id', chefId)
      .order('display_order', { ascending: false })
      .limit(1)

    const maxOrder = maxOrderData?.[0]?.display_order || 0

    // Insert photo records
    const photoRecords = uploadedPhotos.map((photo, index) => ({
      chef_id: chefId,
      photo_url: photo.photo_url,
      display_order: maxOrder + index + 1
    }))

    const { error: insertError } = await supabase
      .from('food_photos')
      .insert(photoRecords)

    if (insertError) {
      console.error('Error inserting photo records:', insertError)
      return { success: false, error: insertError.message }
    }

    // Update chef timestamp
    await supabase
      .from('chefs')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chefId)

    // Log the change
    await supabase
      .from('chef_audit_log')
      .insert({
        chef_id: chefId,
        action: 'updated',
        metadata: { field: 'food_photos_added', count: files.length }
      })

    // Revalidate relevant pages
    revalidatePath('/admin')
    revalidatePath(`/admin/chefs/${chefId}`)
    revalidatePath(`/chef/${chefId}`)

    return { success: true, uploaded_count: files.length }
  } catch (error) {
    console.error('Error in addChefFoodPhotos:', error)
    return { success: false, error: 'Failed to add food photos' }
  }
} 
'use server'

import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { sendApplicationConfirmationEmail, sendAdminApplicationAlert } from '@/lib/email'

/**
 * Interface for chef application form data
 * Supports both string and numeric values for flexible form handling
 */
interface ApplicationData {
  [key: string]: string | number
}

/**
 * Result interface for application submission
 */
interface SubmissionResult {
  success: boolean
  error?: string
  applicationId?: string
}

/**
 * Submits a chef application to the database
 * 
 * @param formData - FormData object containing application fields
 * @returns Promise with success status, error message, and application ID
 * 
 * Features:
 * - Validates required fields (name, email)
 * - Validates email format using regex
 * - Converts hourly rate to number automatically
 * - Uses admin client to bypass RLS restrictions
 * - Revalidates admin page cache after submission
 */
export async function submitApplication(formData: FormData): Promise<SubmissionResult> {
  try {
    const supabase = createSupabaseAdminClient()

    // Extract form data into a clean object
    const applicationData: ApplicationData = {}
    let fileUploads = { profile_photos: [], food_photos: [] }
    
    // Get all form fields
    for (const [key, value] of formData.entries()) {
      // Handle file uploads separately
      if (key === 'file_uploads' && typeof value === 'string') {
        try {
          fileUploads = JSON.parse(value)
        } catch (e) {
          console.warn('Failed to parse file uploads:', e)
        }
        continue
      }
      if (typeof value === 'string' && value.trim()) {
        // Convert hourly rate to number if it's the rate field
        if (key.toLowerCase().includes('rate') && !isNaN(Number(value))) {
          applicationData[key] = Number(value)
        } else {
          applicationData[key] = value.trim()
        }
      }
    }

    // Basic validation
    if (!applicationData['Full Name'] || !applicationData['Email Address']) {
      return { success: false, error: 'Full name and email are required' }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(applicationData['Email Address'] as string)) {
      return { success: false, error: 'Please enter a valid email address' }
    }

    // Insert application into database
    const { data: application, error: insertError } = await supabase
      .from('chef_applications')
      .insert({
        answers: applicationData,
        file_uploads: fileUploads,
        status: 'pending'
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Database error:', insertError)
      return { success: false, error: 'Failed to submit application. Please try again.' }
    }

    // Send confirmation email to chef
    const chefName = applicationData['Full Name'] as string
    const chefEmail = applicationData['Email Address'] as string
    
    if (chefEmail && chefName) {
      const confirmationResult = await sendApplicationConfirmationEmail(
        chefEmail,
        chefName,
        application.id
      )
      
      if (!confirmationResult.success) {
        console.error('Failed to send confirmation email:', confirmationResult.error)
        // Continue anyway - application is saved
      }

      // Send admin alert email
      const adminAlertResult = await sendAdminApplicationAlert(
        chefName,
        chefEmail,
        application.id
      )
      
      if (!adminAlertResult.success) {
        console.error('Failed to send admin alert email:', adminAlertResult.error)
        // Continue anyway - application is saved
      }
    }
    
    // Revalidate admin page to show new application
    revalidatePath('/admin')

    return { 
      success: true, 
      applicationId: application.id 
    }

  } catch (error) {
    console.error('Application submission error:', error)
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}
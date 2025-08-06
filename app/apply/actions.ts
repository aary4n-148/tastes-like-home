'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

interface ApplicationData {
  [key: string]: string | number
}

export async function submitApplication(formData: FormData): Promise<{ success: boolean; error?: string; applicationId?: string }> {
  try {
    const supabase = await createSupabaseServerClient()

    // Extract form data into a clean object
    const applicationData: ApplicationData = {}
    
    // Get all form fields (excluding any file uploads for now)
    for (const [key, value] of formData.entries()) {
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
        status: 'pending'
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Database error:', insertError)
      return { success: false, error: 'Failed to submit application. Please try again.' }
    }

    // TODO: Send notification emails (will add in later step)
    
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
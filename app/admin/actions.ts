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
'use server'

import { headers } from 'next/headers'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { hashEmail, hashIP } from '@/lib/crypto'
import { revalidatePath } from 'next/cache'

interface ContactInquiryResult {
  success: boolean
  error?: string
  whatsappUrl?: string
}

/**
 * Server action to submit customer contact inquiry
 * 
 * Features:
 * - PII/Analytics data separation for GDPR compliance
 * - Rate limiting and spam prevention
 * - Duplicate inquiry detection
 * - Secure data handling with hashing
 * - WhatsApp URL generation with context
 */
export async function submitContactInquiry(
  chefId: string,
  formData: {
    email: string
    phone?: string
    name?: string
    serviceType: string
    budgetRange?: string
    message?: string
  }
): Promise<ContactInquiryResult> {
  try {
    // === INPUT VALIDATION ===
    if (!formData.email || !formData.email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' }
    }

    if (!formData.serviceType || !['weekly_cooking', 'special_event', 'one_time', 'other'].includes(formData.serviceType)) {
      return { success: false, error: 'Please select a service type' }
    }

    if (formData.message && formData.message.length > 500) {
      return { success: false, error: 'Message must be 500 characters or less' }
    }

    // === GET CLIENT IP FOR SECURITY ===
    const headersList = await headers()
    const clientIp = headersList.get('x-forwarded-for')?.split(',')[0] || 
                     headersList.get('x-real-ip') || 
                     '127.0.0.1'

    // === DATABASE SETUP ===
    const supabase = createSupabaseAdminClient()
    const emailHash = hashEmail(formData.email)
    const ipHash = hashIP(clientIp)

    // === VERIFY CHEF EXISTS AND IS VERIFIED ===
    const { data: chef, error: chefError } = await supabase
      .from('chefs')
      .select('name, phone, verified')
      .eq('id', chefId)
      .eq('verified', true)
      .single()

    if (chefError || !chef) {
      return { success: false, error: 'Chef not found or not available for contact' }
    }

    // === RATE LIMITING: Max 3 inquiries per IP per hour ===
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: ipSubmissions } = await supabase
      .from('customer_inquiries')
      .select('id', { count: 'exact' })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneHourAgo)

    if (ipSubmissions && ipSubmissions >= 3) {
      return { success: false, error: 'Too many inquiries from your location. Please try again later.' }
    }

    // === CHECK FOR EXISTING CUSTOMER CONTACT ===
    let customerContactId: string

    const { data: existingContact } = await supabase
      .from('customer_contacts')
      .select('id')
      .eq('email_hash', emailHash)
      .single()

    if (existingContact) {
      // Customer already exists
      customerContactId = existingContact.id

      // Check for duplicate inquiry to same chef
      const { data: existingInquiry } = await supabase
        .from('customer_inquiries')
        .select('id')
        .eq('chef_id', chefId)
        .eq('customer_ref', customerContactId)
        .single()

      if (existingInquiry) {
        // Duplicate inquiry - still provide WhatsApp link
        const whatsappUrl = generateWhatsAppUrl(chef.phone, chef.name, formData.serviceType, formData.budgetRange)
        return { 
          success: true, 
          whatsappUrl,
          error: 'You have already contacted this chef. Redirecting to WhatsApp...'
        }
      }

      // Update existing contact with current timestamp
      await supabase
        .from('customer_contacts')
        .update({
          marketing_opt_in: true,
          consent_timestamp: new Date().toISOString(),
          consent_source: 'contact_form',
          updated_at: new Date().toISOString()
        })
        .eq('id', customerContactId)
    } else {
      // === CREATE NEW CUSTOMER CONTACT ===
      const { data: newContact, error: contactError } = await supabase
        .from('customer_contacts')
        .insert({
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone?.trim() || null,
          name: formData.name?.trim() || null,
          email_hash: emailHash,
          marketing_opt_in: true,
          consent_timestamp: new Date().toISOString(),
          consent_source: 'contact_form'
        })
        .select('id')
        .single()

      if (contactError || !newContact) {
        console.error('Error creating customer contact:', contactError)
        return { success: false, error: 'Failed to save contact information. Please try again.' }
      }

      customerContactId = newContact.id
    }

    // === CREATE CUSTOMER INQUIRY ===
    const { error: inquiryError } = await supabase
      .from('customer_inquiries')
      .insert({
        chef_id: chefId,
        customer_ref: customerContactId,
        service_type: formData.serviceType,
        budget_range: formData.budgetRange || null,
        message: formData.message?.trim() || null,
        ip_hash: ipHash,
        status: 'pending'
      })

    if (inquiryError) {
      console.error('Error creating customer inquiry:', inquiryError)
      return { success: false, error: 'Failed to submit inquiry. Please try again.' }
    }

    // === GENERATE WHATSAPP URL WITH CONTEXT ===
    const whatsappUrl = generateWhatsAppUrl(chef.phone, chef.name, formData.serviceType, formData.budgetRange)

    // === REVALIDATE CACHE (for future admin dashboard) ===
    revalidatePath('/admin')

    return { 
      success: true, 
      whatsappUrl 
    }

  } catch (error) {
    console.error('Contact inquiry submission error:', error)
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}

/**
 * Server action to track contact button clicks (no PII)
 */
export async function trackContactClick(
  chefId: string,
  source: 'cta_button' | 'modal_submit' | 'skip_form'
): Promise<{ success: boolean }> {
  try {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    const referrer = headersList.get('referer') || ''

    const supabase = createSupabaseAdminClient()

    await supabase
      .from('contact_click_events')
      .insert({
        chef_id: chefId,
        source,
        user_agent: userAgent.substring(0, 255), // Limit length
        referrer: referrer.substring(0, 255)
      })

    return { success: true }
  } catch (error) {
    console.error('Error tracking contact click:', error)
    return { success: false }
  }
}

/**
 * Generate WhatsApp URL with contextual message
 */
function generateWhatsAppUrl(
  chefPhone: string, 
  chefName: string, 
  serviceType: string, 
  budgetRange?: string
): string {
  const cleanPhone = chefPhone.replace(/\D/g, '')
  
  const serviceTypeMap = {
    'weekly_cooking': 'weekly home cooking',
    'special_event': 'special event catering',
    'one_time': 'one-time cooking service',
    'other': 'cooking services'
  }

  const budgetMap = {
    'under_30': 'Under £30',
    '30_50': '£30-50',
    '50_80': '£50-80', 
    '80_100': '£80-100',
    '100_plus': '£100+'
  }
  
  const budgetText = budgetRange ? `, Budget: ${budgetMap[budgetRange as keyof typeof budgetMap] || budgetRange}` : ''
  
  const message = `Hi ${chefName.split(' ')[0]}, I found you on Tastes Like Home and I'm interested in ${serviceTypeMap[serviceType as keyof typeof serviceTypeMap]}${budgetText}. Could we discuss this further?`
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}

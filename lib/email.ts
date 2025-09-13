import { Resend } from 'resend'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY!)

/**
 * Send a review verification email to the user
 * Contains a secure link to verify and publish their review
 */
export async function sendReviewVerificationEmail(
  email: string,
  chefName: string,
  verificationUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // === TEST MODE: Bypass email sending in development ===
    if (process.env.REVIEW_TEST_MODE === 'true') {
      console.log('🧪 TEST MODE: Email would be sent to:', email)
      console.log('🧪 TEST MODE: Verification URL:', verificationUrl)
      console.log('🧪 TEST MODE: Chef Name:', chefName)
      
      // In test mode, we simulate successful email sending
      // The verification URL will still work when accessed directly
      return { success: true }
    }

    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    
    const result = await resend.emails.send({
      from: 'Tastes Like Home <noreply@tastes-like-home.com>',
      to: email,
      subject: `Confirm your review for ${chefName}`,
      html: createVerificationEmailHTML(chefName, verificationUrl)
    })
    
    return { success: true }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send verification email'
    }
  }
}

/**
 * ============================================================================
 * CHEF APPLICATION EMAIL FUNCTIONS
 * ============================================================================
 */

/**
 * Send application confirmation email to chef
 * Confirms their application has been received and is under review
 */
export async function sendApplicationConfirmationEmail(
  email: string,
  chefName: string,
  applicationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // === TEST MODE: Bypass email sending in development ===
    if (process.env.REVIEW_TEST_MODE === 'true') {
      console.log('🧪 TEST MODE: Application confirmation email would be sent to:', email)
      console.log('🧪 TEST MODE: Chef Name:', chefName)
      console.log('🧪 TEST MODE: Application ID:', applicationId)
      return { success: true }
    }

    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    
    const result = await resend.emails.send({
      from: 'Tastes Like Home <noreply@tastes-like-home.com>',
      to: email,
      subject: 'Application Received - Welcome to Tastes Like Home!',
      html: createApplicationConfirmationHTML(chefName, applicationId)
    })
    
    return { success: true }
  } catch (error) {
    console.error('Application confirmation email failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send confirmation email'
    }
  }
}

/**
 * Send admin alert email when new application is received
 * Notifies admin team of pending applications requiring review
 */
export async function sendAdminApplicationAlert(
  chefName: string,
  email: string,
  applicationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // === TEST MODE: Bypass email sending in development ===
    if (process.env.REVIEW_TEST_MODE === 'true') {
      console.log('🧪 TEST MODE: Admin alert email would be sent for:', chefName)
      console.log('🧪 TEST MODE: Application ID:', applicationId)
      return { success: true }
    }

    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }

    // You can configure this admin email in environment variables
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tastes-like-home.com'
    const reviewUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/applications/${applicationId}`
    
    const result = await resend.emails.send({
      from: 'Tastes Like Home <noreply@tastes-like-home.com>',
      to: adminEmail,
      subject: `New Chef Application: ${chefName}`,
      html: createAdminAlertHTML(chefName, email, reviewUrl)
    })
    
    return { success: true }
  } catch (error) {
    console.error('Admin alert email failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send admin alert email'
    }
  }
}

/**
 * Send approval notification email to chef
 * Congratulates chef on approval and provides next steps
 */
export async function sendApplicationApprovalEmail(
  email: string,
  chefName: string,
  chefId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // === TEST MODE: Bypass email sending in development ===
    if (process.env.REVIEW_TEST_MODE === 'true') {
      console.log('🧪 TEST MODE: Approval email would be sent to:', email)
      console.log('🧪 TEST MODE: Chef Name:', chefName)
      console.log('🧪 TEST MODE: Chef ID:', chefId)
      return { success: true }
    }

    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }

    const profileUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/chef/${chefId}`
    
    const result = await resend.emails.send({
      from: 'Tastes Like Home <noreply@tastes-like-home.com>',
      to: email,
      subject: 'Congratulations! Your Chef Application has been Approved 🎉',
      html: createApprovalEmailHTML(chefName, profileUrl)
    })
    
    return { success: true }
  } catch (error) {
    console.error('Approval email failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send approval email'
    }
  }
}

/**
 * Send rejection notification email to chef
 * Provides feedback and encouragement to reapply in the future
 */
export async function sendApplicationRejectionEmail(
  email: string,
  chefName: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // === TEST MODE: Bypass email sending in development ===
    if (process.env.REVIEW_TEST_MODE === 'true') {
      console.log('🧪 TEST MODE: Rejection email would be sent to:', email)
      console.log('🧪 TEST MODE: Chef Name:', chefName)
      console.log('🧪 TEST MODE: Reason:', reason)
      return { success: true }
    }

    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    
    const result = await resend.emails.send({
      from: 'Tastes Like Home <noreply@tastes-like-home.com>',
      to: email,
      subject: 'Update on Your Chef Application',
      html: createRejectionEmailHTML(chefName, reason)
    })
    
    return { success: true }
  } catch (error) {
    console.error('Rejection email failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send rejection email'
    }
  }
}

/**
 * ============================================================================
 * EMAIL HTML TEMPLATES
 * ============================================================================
 */

/**
 * Create the HTML template for verification emails
 * Professional styling that matches your brand
 */
function createVerificationEmailHTML(chefName: string, verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirm Your Review</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ea580c; margin: 0; font-size: 28px;">Tastes Like Home</h1>
        <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Authentic home cooking</p>
      </div>

      <div style="background: #f9fafb; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 24px;">Thanks for reviewing ${chefName}!</h2>
        
        <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px;">
          Your review helps other food lovers discover amazing home chefs. Click the button below to publish your review:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: linear-gradient(to right, #ea580c, #dc2626); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            Publish My Review
          </a>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
            <strong>This link expires in 24 hours.</strong>
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            If you didn't write this review, you can safely ignore this email.
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © 2025 Tastes Like Home. Bringing authentic home cooking to your table.
        </p>
      </div>
      
    </body>
    </html>
  `
}

/**
 * Create HTML template for application confirmation email
 */
function createApplicationConfirmationHTML(chefName: string, applicationId: string): string {
  const onboardingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding`
  const referUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/apply`
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Received</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ea580c; margin: 0; font-size: 28px;">Tastes Like Home</h1>
        <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Authentic home cooking</p>
      </div>

      <div style="background: #f9fafb; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 24px;">Thanks ${chefName}! We're reviewing. 🍳</h2>
        
        <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px;">
          We got your application! We will look at it in 2 days and email you back.
        </p>

        <div style="background: #fff; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb; margin: 20px 0;">
          <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px;">What happens next?</h3>
          <ul style="color: #374151; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">We look at your photos and experience</li>
            <li style="margin-bottom: 8px;">We email you our decision in 2 days</li>
            <li style="margin-bottom: 0;">If yes, your profile goes live on our website</li>
          </ul>
        </div>

        <!-- Action Buttons -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${onboardingUrl}" 
             style="background-color: #ea580c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; border: none; margin: 0 10px 10px 0;">
            Get Ready - Chef Guide
          </a>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <a href="${referUrl}" 
             style="background: #f3f4f6; color: #374151; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500; font-size: 14px; border: 1px solid #d1d5db; margin: 0 5px;">
            Refer a Friend
          </a>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
            <strong>Application ID:</strong> ${applicationId.substring(0, 8)}
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            We will email you when we have news.
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © 2025 Tastes Like Home. Bringing authentic home cooking to your table.
        </p>
      </div>
      
    </body>
    </html>
  `
}

/**
 * Create HTML template for admin alert email
 */
function createAdminAlertHTML(chefName: string, email: string, reviewUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Chef Application</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ea580c; margin: 0; font-size: 28px;">Tastes Like Home</h1>
        <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Admin Alert</p>
      </div>

      <div style="background: #fef3c7; padding: 30px; border-radius: 8px; border: 1px solid #f59e0b;">
        <h2 style="color: #92400e; margin: 0 0 20px 0; font-size: 24px;">🔔 New Chef Application Received</h2>
        
        <div style="background: #fff; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px;">Application Details</h3>
          <p style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">
            <strong>Chef Name:</strong> ${chefName}
          </p>
          <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px;">
            <strong>Email:</strong> ${email}
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${reviewUrl}" 
             style="background: linear-gradient(to right, #ea580c, #dc2626); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            Review Application
          </a>
        </div>
        
        <div style="border-top: 1px solid #f59e0b; padding-top: 20px; margin-top: 30px;">
          <p style="color: #92400e; font-size: 14px; margin: 0;">
            <strong>Action Required:</strong> Please review and approve/reject this application within 48 hours.
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © 2025 Tastes Like Home. Admin Dashboard Notification.
        </p>
      </div>
      
    </body>
    </html>
  `
}

/**
 * Create HTML template for approval email
 */
function createApprovalEmailHTML(chefName: string, profileUrl: string): string {
  const onboardingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding`
  const referUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/apply`
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You're Approved!</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ea580c; margin: 0; font-size: 28px;">Tastes Like Home</h1>
        <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Authentic home cooking</p>
      </div>

      <div style="background: #f0fdf4; padding: 30px; border-radius: 8px; border: 1px solid #22c55e;">
        <h2 style="color: #15803d; margin: 0 0 20px 0; font-size: 24px;">🎉 Congrats ${chefName}! You're approved.</h2>
        
        <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px;">
          Your profile is now live! Families can find you and book you for cooking.
        </p>

        <!-- Quick Tips Section -->
        <div style="background: #fff; padding: 20px; border-radius: 6px; border: 1px solid #22c55e; margin: 20px 0;">
          <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px;">Quick tips to get your first booking:</h3>
          <ul style="color: #374151; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;"><strong>Reply fast</strong> - Answer messages in under 1 hour</li>
            <li style="margin-bottom: 8px;"><strong>Be clear about price</strong> - £12-£20 per hour is normal</li>
            <li style="margin-bottom: 8px;"><strong>Ask who buys food</strong> - You or them?</li>
            <li style="margin-bottom: 8px;"><strong>Ask for reviews</strong> - After each job, ask nicely</li>
            <li style="margin-bottom: 0;"><strong>Share your link</strong> - Put it on WhatsApp and Instagram</li>
          </ul>
        </div>

        <!-- Primary CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${onboardingUrl}" 
             style="background-color: #ea580c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; border: none;">
            Chef Onboarding Guide
          </a>
        </div>

        <!-- Secondary Action Buttons -->
        <div style="text-align: center; margin: 20px 0; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
          <a href="${profileUrl}" 
             style="background: #f3f4f6; color: #374151; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500; font-size: 14px; border: 1px solid #d1d5db; margin: 5px;">
            Share Your Profile
          </a>
          <a href="${referUrl}" 
             style="background: #f3f4f6; color: #374151; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500; font-size: 14px; border: 1px solid #d1d5db; margin: 5px;">
            Refer a Friend
          </a>
        </div>
        
        <div style="border-top: 1px solid #22c55e; padding-top: 20px; margin-top: 30px;">
          <p style="color: #15803d; font-size: 14px; margin: 0 0 10px 0;">
            <strong>Welcome to the team!</strong> Your cooking journey starts now.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Check the guide above for everything you need to know.
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © 2025 Tastes Like Home. Bringing authentic home cooking to your table.
        </p>
      </div>
      
    </body>
    </html>
  `
}

/**
 * Create HTML template for rejection email
 */
function createRejectionEmailHTML(chefName: string, reason?: string): string {
  const onboardingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding`
  const reapplyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/apply`
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Update</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ea580c; margin: 0; font-size: 28px;">Tastes Like Home</h1>
        <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Authentic home cooking</p>
      </div>

      <div style="background: #f9fafb; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 24px;">Thanks for applying, ${chefName}</h2>
        
        <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px;">
          We looked at your application. We can't approve it right now, but you can try again later.
        </p>

        <div style="background: #fff; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb; margin: 20px 0;">
          <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px;">How to make your application better:</h3>
          <ul style="color: #374151; margin: 0; padding-left: 20px; font-size: 16px;">
            <li style="margin-bottom: 8px;">Take better photos of your food - use good light</li>
            <li style="margin-bottom: 8px;">Write more about your cooking experience</li>
            <li style="margin-bottom: 8px;">Show different types of dishes you can cook</li>
            <li style="margin-bottom: 0;">Fill out all the questions completely</li>
          </ul>
        </div>

        <!-- Onboarding Guide CTA -->
        <div style="background: #eff6ff; padding: 20px; border-radius: 6px; border: 1px solid #3b82f6; margin: 20px 0;">
          <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">Learn what makes a great chef profile</h3>
          <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px;">
            Read our chef guide to see what families look for. It has tips on photos, prices, and how to get bookings.
          </p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${onboardingUrl}" 
               style="background-color: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; border: none;">
              Read Chef Guide
            </a>
          </div>
        </div>

        <div style="background: #f0fdf4; padding: 20px; border-radius: 6px; border: 1px solid #22c55e; margin: 20px 0;">
          <h3 style="color: #15803d; margin: 0 0 15px 0; font-size: 18px;">You can try again!</h3>
          <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px;">
            We want more great chefs. Take some time to improve your application, then apply again. We'd love to have you cook with us.
          </p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${reapplyUrl}" 
               style="background: #f3f4f6; color: #374151; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500; font-size: 14px; border: 1px solid #d1d5db;">
              Apply Again Later
            </a>
          </div>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Thank you for wanting to join our chef community.
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © 2025 Tastes Like Home. Bringing authentic home cooking to your table.
        </p>
      </div>
      
    </body>
    </html>
  `
} 
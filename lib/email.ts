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
        <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 24px;">Welcome to our chef community, ${chefName}! 🍳</h2>
        
        <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px;">
          Thank you for applying to join Tastes Like Home! We've received your application and are excited to review your culinary background and specialties.
        </p>

        <div style="background: #fff; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb; margin: 20px 0;">
          <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px;">What happens next?</h3>
          <ul style="color: #374151; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Our team will review your application within 48 hours</li>
            <li style="margin-bottom: 8px;">We'll assess your experience, specialties, and uploaded photos</li>
            <li style="margin-bottom: 8px;">You'll receive an email with our decision and next steps</li>
            <li style="margin-bottom: 0;">If approved, your profile will go live on our website</li>
          </ul>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
            <strong>Application ID:</strong> ${applicationId.substring(0, 8)}
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Questions? Reply to this email or contact us anytime.
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
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Approved!</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ea580c; margin: 0; font-size: 28px;">Tastes Like Home</h1>
        <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Authentic home cooking</p>
      </div>

      <div style="background: #f0fdf4; padding: 30px; border-radius: 8px; border: 1px solid #22c55e;">
        <h2 style="color: #15803d; margin: 0 0 20px 0; font-size: 24px;">🎉 Congratulations ${chefName}!</h2>
        
        <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px;">
          We're thrilled to welcome you to the Tastes Like Home chef community! Your application has been approved and your profile is now live on our website.
        </p>

        <div style="background: #fff; padding: 20px; border-radius: 6px; border: 1px solid #22c55e; margin: 20px 0;">
          <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px;">What's next?</h3>
          <ul style="color: #374151; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Your chef profile is now visible to customers</li>
            <li style="margin-bottom: 8px;">Customers can contact you directly for bookings</li>
            <li style="margin-bottom: 8px;">You'll start receiving booking inquiries via phone</li>
            <li style="margin-bottom: 0;">Share your profile link with friends and family</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${profileUrl}" 
             style="background: linear-gradient(to right, #22c55e, #16a34a); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            View Your Profile
          </a>
        </div>
        
        <div style="border-top: 1px solid #22c55e; padding-top: 20px; margin-top: 30px;">
          <p style="color: #15803d; font-size: 14px; margin: 0 0 10px 0;">
            <strong>Welcome to the team!</strong> We're excited to have you cooking with us.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Questions? Reply to this email and we'll help you get started.
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
        <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 24px;">Thank you for your application, ${chefName}</h2>
        
        <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px;">
          Thank you for your interest in joining Tastes Like Home. After careful review, we're unable to approve your application at this time.
        </p>

        ${reason ? `
        <div style="background: #fff; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb; margin: 20px 0;">
          <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px;">Feedback</h3>
          <p style="color: #374151; margin: 0; font-size: 16px;">${reason}</p>
        </div>
        ` : ''}

        <div style="background: #eff6ff; padding: 20px; border-radius: 6px; border: 1px solid #3b82f6; margin: 20px 0;">
          <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">We'd love to hear from you again!</h3>
          <p style="color: #374151; margin: 0; font-size: 16px;">
            Our chef community is always growing. Please feel free to reapply in the future as your experience develops. 
            We appreciate your passion for home cooking and encourage you to keep sharing your culinary skills.
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Questions about this decision? Reply to this email and we'll be happy to provide more detailed feedback.
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
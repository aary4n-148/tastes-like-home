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
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    
    const result = await resend.emails.send({
      from: 'Tastes Like Home <onboarding@resend.dev>',
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
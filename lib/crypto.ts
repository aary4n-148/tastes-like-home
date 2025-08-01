import crypto from 'crypto'

/**
 * Hash an email address for privacy and duplicate detection
 * Uses SHA-256 to create a consistent, non-reversible hash
 */
export function hashEmail(email: string): string {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
}

/**
 * Hash an IP address for GDPR-compliant rate limiting
 * Allows spam detection without storing actual IPs
 */
export function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip.trim()).digest('hex')
}

/**
 * Generate a cryptographically secure random token
 * Used for verification links and other security tokens
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create a signed, tamper-proof verification token
 * Contains review ID and email, expires in 24 hours
 */
export function createSignedToken(reviewId: string, email: string): string {
  const secret = process.env.REVIEW_VERIFICATION_SECRET!
  const payload = `${reviewId}:${email}:${Date.now()}`
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return `${Buffer.from(payload).toString('base64')}.${signature}`
}

/**
 * Verify and decode a signed verification token
 * Returns review ID and email if valid, null if tampered/expired
 */
export function verifySignedToken(token: string): { reviewId: string; email: string } | null {
  try {
    const [payloadB64, signature] = token.split('.')
    if (!payloadB64 || !signature) return null
    
    const payload = Buffer.from(payloadB64, 'base64').toString()
    const [reviewId, email, timestamp] = payload.split(':')
    
    if (!reviewId || !email || !timestamp) return null
    
    // Verify signature to ensure token wasn't tampered with
    const secret = process.env.REVIEW_VERIFICATION_SECRET!
    const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    
    if (signature !== expectedSignature) return null
    
    // Check expiration (24 hours = 24 * 60 * 60 * 1000 ms)
    const tokenAge = Date.now() - parseInt(timestamp)
    if (tokenAge > 24 * 60 * 60 * 1000) return null
    
    return { reviewId, email }
  } catch {
    return null
  }
} 
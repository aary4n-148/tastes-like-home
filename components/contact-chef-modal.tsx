'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MessageCircle } from 'lucide-react'
import { submitContactInquiry, trackContactClick } from '@/app/chef/actions'

interface ContactChefModalProps {
  chef: {
    id: string
    name: string
    phone: string
  }
  children: React.ReactNode
}

interface FormData {
  email: string
  phone: string
  name: string
  serviceType: string
  budgetRange: string
  message: string
}

export default function ContactChefModal({ chef, children }: ContactChefModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    phone: '',
    name: '',
    serviceType: '',
    budgetRange: '',
    message: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Track when modal opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      trackContactClick(chef.id, 'cta_button')
    }
  }

  // Handle form field changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null) // Clear error when user starts typing
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Basic client-side validation
      if (!formData.email || !formData.email.includes('@')) {
        setError('Please enter a valid email address')
        return
      }

      if (!formData.serviceType) {
        setError('Please select a service type')
        return
      }

      // Submit the inquiry
      const result = await submitContactInquiry(chef.id, {
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        name: formData.name.trim() || undefined,
        serviceType: formData.serviceType,
        budgetRange: formData.budgetRange || undefined,
        message: formData.message.trim() || undefined
      })

      if (result.success && result.whatsappUrl) {
        // Track successful submission
        await trackContactClick(chef.id, 'modal_submit')
        
        // Show success message briefly
        setSuccess('Redirecting to WhatsApp...')
        
        // Close modal and redirect to WhatsApp after short delay
        setTimeout(() => {
          setIsOpen(false)
          window.open(result.whatsappUrl, '_blank', 'noopener,noreferrer')
        }, 1500)
      } else {
        setError(result.error || 'Failed to submit inquiry. Please try again.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }



  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto w-[calc(100%-2rem)] sm:w-full mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            Contact {chef.name.split(' ')[0]}
          </DialogTitle>
          <DialogDescription>
            Tell us about your cooking needs and we'll connect you with {chef.name.split(' ')[0]} on WhatsApp.
          </DialogDescription>
        </DialogHeader>

        {/* Success Message */}
        {success && (
          <div className="p-4 rounded-lg bg-green-50 text-green-800 border border-green-200 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Email - Required */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Service Type - Required */}
            <div className="space-y-2">
              <Label htmlFor="serviceType" className="text-sm font-medium">
                Service Type <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.serviceType} 
                onValueChange={(value) => handleInputChange('serviceType', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="What type of service do you need?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly_cooking">Weekly Home Cooking</SelectItem>
                  <SelectItem value="special_event">Special Event Catering</SelectItem>
                  <SelectItem value="one_time">One-time Cooking Service</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Phone - Optional */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number <span className="text-gray-400">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+44 7XXX XXXXXX"
                disabled={isSubmitting}
              />
            </div>

            {/* Name - Optional */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Your Name <span className="text-gray-400">(optional)</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your name"
                disabled={isSubmitting}
              />
            </div>

            {/* Budget Range - Optional */}
            <div className="space-y-2">
              <Label htmlFor="budgetRange" className="text-sm font-medium">
                Budget Range <span className="text-gray-400">(optional)</span>
              </Label>
              <Select 
                value={formData.budgetRange} 
                onValueChange={(value) => handleInputChange('budgetRange', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_30">Under £30</SelectItem>
                  <SelectItem value="30_50">£30 - £50</SelectItem>
                  <SelectItem value="50_80">£50 - £80</SelectItem>
                  <SelectItem value="80_100">£80 - £100</SelectItem>
                  <SelectItem value="100_plus">£100+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message - Optional */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Additional Details <span className="text-gray-400">(optional)</span>
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Tell us more about your cooking needs..."
                className="resize-none"
                rows={3}
                maxLength={500}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500">
                {formData.message.length}/500 characters
              </p>
            </div>



            {/* Anti-spam honeypot field (hidden) */}
            <input
              type="text"
              name="website"
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Action Button */}
            <div className="pt-2 sm:pt-4 space-y-2">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Continue to WhatsApp
                  </>
                )}
              </Button>
              
              <p className="text-xs text-center text-gray-500">
                We'll redirect you to WhatsApp after submitting this form
              </p>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitApplication } from '@/app/apply/actions'

/**
 * Chef Application Form Component
 * 
 * A dynamic form that renders questions from the database and handles
 * chef application submissions with proper validation and user feedback.
 * 
 * Features:
 * - Dynamic field rendering based on database questions
 * - Client-side validation for required fields
 * - Anti-spam honeypot protection
 * - Success/error messaging with automatic form reset
 * - Responsive design with accessibility support
 */

interface Question {
  id: string
  text: string
  hint_text: string | null
  field_type: 'text' | 'textarea' | 'email' | 'phone' | 'number' | 'photo'
  is_required: boolean
  display_order: number
}

interface ApplicationFormProps {
  questions: Question[]
}

export default function ApplicationForm({ questions }: ApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const result = await submitApplication(formData)
      
      if (result.success) {
        setSubmitStatus({ 
          type: 'success', 
          message: 'Application submitted successfully! We\'ll review it within 48 hours and send you an email.' 
        })
        // Reset form
        const form = document.getElementById('application-form') as HTMLFormElement
        form?.reset()
      } else {
        setSubmitStatus({ 
          type: 'error', 
          message: result.error || 'Failed to submit application' 
        })
      }
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'An unexpected error occurred. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (question: Question) => {
    const fieldName = question.text
    const commonProps = {
      name: fieldName,
      required: question.is_required,
      disabled: isSubmitting
    }

    switch (question.field_type) {
      case 'text':
        return (
          <Input
            {...commonProps}
            type="text"
            placeholder={question.hint_text || `Enter your ${question.text.toLowerCase()}`}
          />
        )
      
      case 'email':
        return (
          <Input
            {...commonProps}
            type="email"
            placeholder={question.hint_text || 'your.email@example.com'}
          />
        )
      
      case 'phone':
        return (
          <Input
            {...commonProps}
            type="tel"
            placeholder={question.hint_text || 'Your phone number'}
          />
        )
      
      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            min="1"
            step="0.01"
            placeholder={question.hint_text || 'Enter amount'}
          />
        )
      
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={4}
            placeholder={question.hint_text || `Enter your ${question.text.toLowerCase()}`}
          />
        )
      
      case 'photo':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-500 mb-2">Photo upload coming soon!</p>
            <p className="text-xs text-gray-400">{question.hint_text}</p>
            {/* File upload functionality will be implemented in future iteration */}
          </div>
        )
      
      default:
        return (
          <Input
            {...commonProps}
            type="text"
            placeholder={question.hint_text || `Enter your ${question.text.toLowerCase()}`}
          />
        )
    }
  }

  return (
    <form id="application-form" action={handleSubmit} className="space-y-6">
      {/* Status Messages */}
      {submitStatus && (
        <div className={`p-4 rounded-lg ${
          submitStatus.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {submitStatus.message}
        </div>
      )}

      {/* Dynamic Form Fields */}
      {questions.map((question) => (
        <div key={question.id} className="space-y-2">
          <Label htmlFor={question.text} className="text-sm font-medium text-gray-700">
            {question.text}
            {question.is_required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          
          {renderField(question)}
          
          {question.hint_text && question.field_type !== 'photo' && (
            <p className="text-xs text-gray-500">{question.hint_text}</p>
          )}
        </div>
      ))}

      {/* Anti-spam honeypot field (hidden) */}
      <input
        type="text"
        name="website"
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
      />

      {/* Submit Button */}
      <div className="pt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
        >
          {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
        </Button>
      </div>

      {/* Footer Note */}
      <div className="text-center text-sm text-gray-500 pt-2">
        <p>All required fields must be completed. We'll review your application within 48 hours.</p>
      </div>
    </form>
  )
}
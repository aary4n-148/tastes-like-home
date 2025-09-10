'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitApplication } from '@/app/apply/actions'
import FileUpload from '@/components/file-upload'
import type { FileUploadResult } from '@/lib/storage'

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
  field_type: 'text' | 'textarea' | 'email' | 'phone' | 'number' | 'photo' | 'video'
  is_required: boolean
  display_order: number
}

interface ApplicationFormProps {
  questions: Question[]
}

export default function ApplicationForm({ questions }: ApplicationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'error'; message: string } | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<{
    profile_photos: FileUploadResult[]
    food_photos: FileUploadResult[]
    introduction_videos: FileUploadResult[]
  }>({
    profile_photos: [],
    food_photos: [],
    introduction_videos: []
  })
  const [applicationId] = useState(() => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // Add uploaded file information to form data before submission
      formData.append('file_uploads', JSON.stringify(uploadedFiles))
      
      const result = await submitApplication(formData)
      
      if (result.success) {
        // Redirect to success page using router
        router.push('/apply/success')
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
        // Special handling for enhanced text fields with better placeholders
        let placeholder = question.hint_text || `Enter your ${question.text.toLowerCase()}`
        
        if (question.text === 'Availability') {
          placeholder = "Example: Monday-Friday evenings, Weekends all day"
        } else if (question.text === 'Languages Spoken') {
          placeholder = "Example: English, Hindi, Punjabi, Gujarati"
        } else if (question.text === 'Frequency Preference') {
          placeholder = "Example: Weekly bookings preferred, one-off events welcome"
        } else if (question.text === 'Dietary Specialties') {
          placeholder = "Example: Vegan, Jain, Gluten-free, Low-oil cooking"
        }
        
        return (
          <Input
            {...commonProps}
            type="text"
            placeholder={placeholder}
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
        // Special handling for enhanced number fields
        let numPlaceholder = question.hint_text || 'Enter amount'
        let minValue = "1"
        let stepValue = "0.01"
        
        if (question.text === 'Experience Years') {
          numPlaceholder = "Example: 5 (years of cooking experience)"
          stepValue = "1"
        } else if (question.text === 'Travel Distance') {
          numPlaceholder = "Example: 10 (miles you're willing to travel)"
          stepValue = "1"
        } else if (question.text === 'Minimum Booking') {
          numPlaceholder = "Example: 3 (minimum hours per booking)"
          stepValue = "1"
        }
        
        return (
          <Input
            {...commonProps}
            type="number"
            min={minValue}
            step={stepValue}
            placeholder={numPlaceholder}
          />
        )
      
      case 'textarea':
        // Special handling for enhanced fields with helpful examples
        if (question.text === 'Special Events') {
          return (
            <div className="space-y-3">
              <Textarea
                {...commonProps}
                rows={3}
                placeholder="Example: Birthday parties, Wedding celebrations, Anniversary dinners, Family gatherings"
              />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> List the types of special events you enjoy cooking for - this helps customers find you for their celebrations!
                </p>
              </div>
            </div>
          )
        }
        
        if (question.text === 'House Help Services') {
          return (
            <div className="space-y-3">
              <Textarea
                {...commonProps}
                rows={3}
                placeholder="Example: Kitchen cleaning, Grocery shopping, Basic meal prep, Dishwashing"
              />
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <strong>💡 Optional:</strong> Additional services can help you earn more! Only list what you're comfortable doing.
                </p>
              </div>
            </div>
          )
        }
        
        return (
          <Textarea
            {...commonProps}
            rows={4}
            placeholder={question.hint_text || `Enter your ${question.text.toLowerCase()}`}
          />
        )
      
      case 'photo':
        const isProfilePhoto = question.text.toLowerCase().includes('profile')
        const fileType = isProfilePhoto ? 'profile' : 'food'
        const maxFiles = isProfilePhoto ? 1 : 5
        
        return (
          <FileUpload
            fileType={fileType}
            maxFiles={maxFiles}
            applicationId={applicationId}
            label={question.text}
            helpText={question.hint_text || `Upload ${isProfilePhoto ? 'your profile photo' : 'photos of your food'}`}
            onFilesUploaded={(files) => {
              setUploadedFiles(prev => ({
                ...prev,
                [fileType === 'profile' ? 'profile_photos' : 'food_photos']: [
                  ...prev[fileType === 'profile' ? 'profile_photos' : 'food_photos'],
                  ...files
                ]
              }))
            }}
            onUploadError={(error) => {
              setSubmitStatus({ type: 'error', message: error })
            }}
          />
        )

      case 'video':
        return (
          <FileUpload
            fileType="video"
            maxFiles={1}
            applicationId={applicationId}
            label={question.text}
            helpText={question.hint_text || 'Upload a short video introducing yourself'}
            onFilesUploaded={(files) => {
              setUploadedFiles(prev => ({
                ...prev,
                introduction_videos: [
                  ...prev.introduction_videos,
                  ...files
                ]
              }))
            }}
            onUploadError={(error) => {
              setSubmitStatus({ type: 'error', message: error })
            }}
          />
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
      {/* Error Messages */}
      {submitStatus && (
        <div className="p-4 rounded-lg bg-red-50 text-red-800 border border-red-200">
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
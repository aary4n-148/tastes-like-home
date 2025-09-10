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
        return (
          <Input
            {...commonProps}
            type="text"
            className="h-12 sm:h-14 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 text-sm sm:text-base px-4"
          />
        )
      
      case 'email':
        return (
          <Input
            {...commonProps}
            type="email"
            className="h-12 sm:h-14 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 text-sm sm:text-base px-4"
          />
        )
      
      case 'phone':
        return (
          <Input
            {...commonProps}
            type="tel"
            className="h-12 sm:h-14 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 text-sm sm:text-base px-4"
          />
        )
      
      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            min="1"
            step={question.text.includes('Rate') ? "0.01" : "1"}
            className="h-12 sm:h-14 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 text-sm sm:text-base px-4"
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
                className="rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 resize-none text-sm sm:text-base p-4 leading-relaxed"
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
                className="rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 resize-none text-sm sm:text-base p-4 leading-relaxed"
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
            className="rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 resize-none"
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
            className="h-12 sm:h-14 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 text-sm sm:text-base px-4"
          />
        )
    }
  }

  return (
    <form id="application-form" action={handleSubmit} className="space-y-8">
      {/* Error Messages */}
      {submitStatus && (
        <div className="p-6 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-destructive/20 p-2 rounded-full">
              <span className="text-lg">⚠️</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Form Error</h3>
              <p>{submitStatus.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Form Fields */}
      {questions.map((question) => (
        <div key={question.id} className="space-y-3">
          <Label htmlFor={question.text} className="text-sm sm:text-base font-semibold text-foreground flex items-center leading-relaxed">
            <span className="break-words">{question.text}</span>
            {question.is_required && <span className="text-destructive ml-2 text-lg flex-shrink-0">*</span>}
          </Label>
          
          <div className="relative">
            {renderField(question)}
          </div>
          
          {question.hint_text && question.field_type !== 'photo' && (
            <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border border-border/50">
              <p className="text-xs sm:text-sm text-muted-foreground flex items-start space-x-2 leading-relaxed">
                <span className="text-primary mt-0.5 flex-shrink-0">💡</span>
                <span className="break-words">{question.hint_text}</span>
              </p>
            </div>
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

      {/* Enhanced Submit Button */}
      <div className="pt-8">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base sm:text-lg"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Sending Form...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3">
              <span>Send Form</span>
              <span className="text-xl">🚀</span>
            </div>
          )}
        </Button>
      </div>

      {/* Enhanced Footer Note */}
      <div className="text-center pt-4">
        <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-accent text-lg">⚡</span>
            <p className="font-semibold text-accent">Fast Review</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Fill out all boxes with a *. We will check your form in 2 days and tell you what happens next.
          </p>
        </div>
      </div>
    </form>
  )
}
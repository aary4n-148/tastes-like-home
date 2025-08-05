'use client'

import { useState } from 'react'
import { publishReview, deleteReview } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface ReviewActionsProps {
  reviewId: string
  status: 'awaiting_email' | 'published' | 'spam'
  onAction: () => void
}

export function ReviewActions({ reviewId, status, onAction }: ReviewActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handlePublish = async () => {
    if (!confirm('Are you sure you want to publish this review?')) {
      return
    }

    setIsLoading(true)
    try {
      const result = await publishReview(reviewId)
      
      if (result.success) {
        toast({
          title: "Review published",
          description: "The review has been published successfully.",
        })
        onAction() // Refresh the page data
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to publish review",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error publishing review:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      const result = await deleteReview(reviewId)
      
      if (result.success) {
        toast({
          title: "Review deleted",
          description: "The review has been deleted successfully.",
        })
        onAction() // Refresh the page data
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete review",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      {status === 'awaiting_email' && (
        <Button
          size="sm"
          onClick={handlePublish}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading ? 'Publishing...' : 'Publish'}
        </Button>
      )}
      {status !== 'spam' && (
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDelete}
          disabled={isLoading}
        >
          {isLoading ? 'Deleting...' : 'Delete'}
        </Button>
      )}
    </div>
  )
} 
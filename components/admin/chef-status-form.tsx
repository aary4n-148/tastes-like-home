'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { updateChefStatus } from '@/app/admin/actions'
import { toast } from 'sonner'

interface ChefStatusFormProps {
  chefId: string
  currentStatus: 'published' | 'unpublished' | 'deleted'
}

export default function ChefStatusForm({ chefId, currentStatus }: ChefStatusFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'published' | 'unpublished'>(
    currentStatus === 'deleted' ? 'unpublished' : currentStatus
  )

  const handleStatusChange = async (newStatus: 'published' | 'unpublished') => {
    if (newStatus === status) return
    
    setIsLoading(true)

    try {
      const result = await updateChefStatus(chefId, newStatus)

      if (result.success) {
        setStatus(newStatus)
        toast.success(`Chef ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`)
      } else {
        toast.error(result.error || 'Failed to update chef status')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error updating chef status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button 
        className={`w-full ${status === 'published' ? 'bg-green-600 hover:bg-green-700' : ''}`}
        variant={status === 'published' ? 'default' : 'outline'}
        onClick={() => handleStatusChange('published')}
        disabled={isLoading}
      >
        {isLoading && status !== 'published' ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Eye className="w-4 h-4 mr-2" />
        )}
        Published (Visible)
      </Button>
      
      <Button 
        className="w-full"
        variant={status === 'unpublished' ? 'default' : 'outline'}
        onClick={() => handleStatusChange('unpublished')}
        disabled={isLoading}
      >
        {isLoading && status !== 'unpublished' ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <EyeOff className="w-4 h-4 mr-2" />
        )}
        Unpublished (Hidden)
      </Button>
      
      <p className="text-xs text-gray-500">
        Published chefs appear on the website and in search results.
      </p>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { approveChef } from '@/app/admin/actions'

interface ApprovalButtonProps {
  chefId: string
  chefName: string
}

export function ApprovalButton({ chefId, chefName }: ApprovalButtonProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isApproved, setIsApproved] = useState(false)

  const handleApprove = async () => {
    if (isApproving || isApproved) return

    setIsApproving(true)
    
    try {
      // Use server action instead of client-side Supabase call
      const result = await approveChef(chefId)

      if (!result.success) {
        alert(`Failed to approve chef: ${result.error}`)
        setIsApproving(false)
        return
      }

      setIsApproved(true)
      
      // No need for manual reload - server action handles revalidation
      
    } catch (error) {
      console.error('Error approving chef:', error)
      alert('Failed to approve chef. Please try again.')
      setIsApproving(false)
    }
  }

  if (isApproved) {
    return (
      <Button disabled className="bg-green-600 text-white">
        <Check className="w-4 h-4 mr-2" />
        Approved!
      </Button>
    )
  }

  return (
    <Button 
      onClick={handleApprove}
      disabled={isApproving}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      {isApproving ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Approving...
        </>
      ) : (
        <>
          <Check className="w-4 h-4 mr-2" />
          Approve {chefName}
        </>
      )}
    </Button>
  )
} 
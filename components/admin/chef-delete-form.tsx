'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteChefPermanently } from '@/app/admin/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ChefDeleteFormProps {
  chefId: string
  chefName: string
}

export default function ChefDeleteForm({ chefId, chefName }: ChefDeleteFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const result = await deleteChefPermanently(chefId)

      if (result.success) {
        toast.success('Chef deleted successfully')
        setShowDialog(false)
        // Redirect to admin panel after successful deletion
        router.push('/admin')
      } else {
        toast.error(result.error || 'Failed to delete chef')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error deleting chef:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          className="w-full"
          size="sm"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Chef Permanently
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Chef Permanently</AlertDialogTitle>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to permanently delete <strong>{chefName}</strong>?
            </p>
            <p className="text-sm text-red-600">
              This action cannot be undone. All chef data, photos, reviews, and related information will be permanently removed.
            </p>
            <p className="text-sm text-muted-foreground">
              Consider unpublishing the chef instead if you want to hide them temporarily.
            </p>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Permanently
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
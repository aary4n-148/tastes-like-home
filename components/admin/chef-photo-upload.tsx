'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Loader2, X } from 'lucide-react'
import { replaceChefProfilePhoto, addChefFoodPhotos, deleteChefPhoto } from '@/app/admin/actions'
import { toast } from 'sonner'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface ChefPhotoUploadProps {
  chefId: string
  currentProfilePhoto?: string
  foodPhotos: Array<{
    id: string
    photo_url: string
    display_order: number
  }>
}

export default function ChefPhotoUpload({ chefId, currentProfilePhoto, foodPhotos }: ChefPhotoUploadProps) {
  const [isProfileUploading, setIsProfileUploading] = useState(false)
  const [isFoodUploading, setIsFoodUploading] = useState(false)
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null)
  
  const profileFileRef = useRef<HTMLInputElement>(null)
  const foodFileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPEG, PNG, or WebP images.')
      return
    }

    if (file.size > 25 * 1024 * 1024) { // 25MB limit
      toast.error('File too large. Please upload images smaller than 25MB.')
      return
    }

    setIsProfileUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('photo', file)
      
      const result = await replaceChefProfilePhoto(chefId, formData)
      
      if (result.success) {
        toast.success('Profile photo updated successfully')
        // Reset file input
        if (profileFileRef.current) {
          profileFileRef.current.value = ''
        }
        // Refresh the page to show new photo
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to upload profile photo')
      }
    } catch (error: any) {
      console.error('Error uploading profile photo:', error)
      if (error.message?.includes('unexpected response')) {
        toast.error('Upload failed. Please try with a smaller image or check your connection.')
      } else {
        toast.error('An unexpected error occurred during upload')
      }
    } finally {
      setIsProfileUploading(false)
    }
  }

  const handleFoodPhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxFileSize = 25 * 1024 * 1024 // 25MB

    for (const file of Array.from(files)) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type for ${file.name}. Please upload JPEG, PNG, or WebP images.`)
        return
      }
      if (file.size > maxFileSize) {
        toast.error(`File ${file.name} is too large. Please upload images smaller than 25MB.`)
        return
      }
    }

    setIsFoodUploading(true)
    
    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('photos', file)
      })
      
      const result = await addChefFoodPhotos(chefId, formData)
      
      if (result.success) {
        toast.success(`${result.uploaded_count} food photo(s) uploaded successfully`)
        // Reset file input
        if (foodFileRef.current) {
          foodFileRef.current.value = ''
        }
        // Refresh the page to show new photos
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to upload food photos')
      }
    } catch (error: any) {
      console.error('Error uploading food photos:', error)
      if (error.message?.includes('unexpected response')) {
        toast.error('Upload failed. Please try with smaller images or check your connection.')
      } else {
        toast.error('An unexpected error occurred during upload')
      }
    } finally {
      setIsFoodUploading(false)
    }
  }

  const handleDeleteFoodPhoto = async (photoId: string) => {
    setDeletingPhotoId(photoId)
    
    try {
      const result = await deleteChefPhoto(photoId, chefId)
      
      if (result.success) {
        toast.success('Photo deleted successfully')
      } else {
        toast.error(result.error || 'Failed to delete photo')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error deleting photo:', error)
    } finally {
      setDeletingPhotoId(null)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Profile Photo Section */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Profile Photo</h4>
        <div className="flex items-start gap-4">
          <div className="relative">
            <Image
              src={currentProfilePhoto || '/placeholder-user.jpg'}
              alt="Chef profile"
              width={120}
              height={120}
              className="rounded-lg object-cover border"
            />
          </div>
          <div className="flex-1 space-y-2">
            <input
              ref={profileFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleProfilePhotoUpload}
              className="hidden"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => profileFileRef.current?.click()}
              disabled={isProfileUploading}
            >
              {isProfileUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-1" />
                  Replace Photo
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500">
              Recommended: Square image, at least 400x400px. Max 25MB.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        {/* Food Photos Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Food Photos</h4>
            <div>
              <input
                ref={foodFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFoodPhotosUpload}
                className="hidden"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => foodFileRef.current?.click()}
                disabled={isFoodUploading}
              >
                {isFoodUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-1" />
                    Add Photos
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {foodPhotos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {foodPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <Image
                    src={photo.photo_url}
                    alt="Food photo"
                    width={200}
                    height={200}
                    className="rounded-lg object-cover border aspect-square"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteFoodPhoto(photo.id)}
                    disabled={deletingPhotoId === photo.id}
                  >
                    {deletingPhotoId === photo.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-2">No food photos uploaded yet</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => foodFileRef.current?.click()}
                disabled={isFoodUploading}
              >
                Upload First Photo
              </Button>
            </div>
          )}
          
          <p className="text-sm text-gray-500 mt-3">
            You can select multiple images at once. Max 25MB per image.
          </p>
        </div>
      </div>
    </div>
  )
}
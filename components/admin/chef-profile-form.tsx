'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, Loader2 } from 'lucide-react'
import { updateChefProfile } from '@/app/admin/actions'
import { toast } from 'sonner'

interface ChefProfileFormProps {
  chefId: string
  initialData: {
    name: string
    phone: string
    hourly_rate: number
    location_label?: string
    bio: string
  }
}

export default function ChefProfileForm({ chefId, initialData }: ChefProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState(initialData)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateChefProfile(chefId, {
        name: formData.name,
        bio: formData.bio,
        phone: formData.phone,
        hourly_rate: formData.hourly_rate,
        location_label: formData.location_label
      })

      if (result.success) {
        toast.success('Chef profile updated successfully')
      } else {
        toast.error(result.error || 'Failed to update chef profile')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error updating chef profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Chef's full name"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
            id="phone" 
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+44 7XXX XXXXXX"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hourly_rate">Hourly Rate (£)</Label>
          <Input 
            id="hourly_rate" 
            type="number" 
            step="0.50"
            value={formData.hourly_rate}
            onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
            placeholder="15.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input 
            id="location" 
            value={formData.location_label || ''}
            onChange={(e) => setFormData({ ...formData, location_label: e.target.value })}
            placeholder="e.g., West London"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="bio">Bio / About</Label>
        <Textarea 
          id="bio" 
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Tell customers about this chef's background, specialties, and cooking style..."
          rows={4}
          required
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </>
        )}
      </Button>
    </form>
  )
}
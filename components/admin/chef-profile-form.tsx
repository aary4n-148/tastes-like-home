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
    experience_years?: number
    availability?: string
    languages_spoken?: string
    travel_distance?: number
    frequency_preference?: string
    minimum_booking?: number
    special_events?: string
    house_help_services?: string
    dietary_specialties?: string
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
        location_label: formData.location_label,
        experience_years: formData.experience_years,
        availability: formData.availability,
        languages_spoken: formData.languages_spoken,
        travel_distance: formData.travel_distance,
        frequency_preference: formData.frequency_preference,
        minimum_booking: formData.minimum_booking,
        special_events: formData.special_events,
        house_help_services: formData.house_help_services,
        dietary_specialties: formData.dietary_specialties
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

      {/* Enhanced Fields Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="experience_years">Experience Years</Label>
            <Input 
              id="experience_years" 
              type="number"
              min="0"
              value={formData.experience_years || ''}
              onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || undefined })}
              placeholder="e.g., 6"
            />
          </div>
          <div>
            <Label htmlFor="travel_distance">Travel Distance (miles)</Label>
            <Input 
              id="travel_distance" 
              type="number"
              min="0"
              value={formData.travel_distance || ''}
              onChange={(e) => setFormData({ ...formData, travel_distance: parseInt(e.target.value) || undefined })}
              placeholder="e.g., 8"
            />
          </div>
          <div>
            <Label htmlFor="minimum_booking">Minimum Booking (hours)</Label>
            <Input 
              id="minimum_booking" 
              type="number"
              min="1"
              value={formData.minimum_booking || ''}
              onChange={(e) => setFormData({ ...formData, minimum_booking: parseInt(e.target.value) || undefined })}
              placeholder="e.g., 3"
            />
          </div>
          <div>
            <Label htmlFor="languages_spoken">Languages Spoken</Label>
            <Input 
              id="languages_spoken" 
              value={formData.languages_spoken || ''}
              onChange={(e) => setFormData({ ...formData, languages_spoken: e.target.value })}
              placeholder="e.g., Hindi, Punjabi, English"
            />
          </div>
        </div>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="availability">Availability</Label>
            <Input 
              id="availability" 
              value={formData.availability || ''}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              placeholder="e.g., Monday-Friday evenings, Weekends all day"
            />
          </div>
          <div>
            <Label htmlFor="frequency_preference">Frequency Preference</Label>
            <Input 
              id="frequency_preference" 
              value={formData.frequency_preference || ''}
              onChange={(e) => setFormData({ ...formData, frequency_preference: e.target.value })}
              placeholder="e.g., Weekly bookings preferred, one-off events welcome"
            />
          </div>
        </div>

        <div className="border-t pt-4 mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Additional Services & Specialties</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="special_events">Special Events</Label>
              <Textarea 
                id="special_events" 
                value={formData.special_events || ''}
                onChange={(e) => setFormData({ ...formData, special_events: e.target.value })}
                placeholder="e.g., Birthday parties, Anniversary dinners, Family gatherings"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="house_help_services">House Help Services</Label>
              <Textarea 
                id="house_help_services" 
                value={formData.house_help_services || ''}
                onChange={(e) => setFormData({ ...formData, house_help_services: e.target.value })}
                placeholder="e.g., Kitchen cleaning, Basic meal prep"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="dietary_specialties">Dietary Specialties</Label>
              <Textarea 
                id="dietary_specialties" 
                value={formData.dietary_specialties || ''}
                onChange={(e) => setFormData({ ...formData, dietary_specialties: e.target.value })}
                placeholder="e.g., Traditional Indian, Low-oil cooking"
                rows={2}
              />
            </div>
          </div>
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
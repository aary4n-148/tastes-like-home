'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Save, X, Plus, Loader2 } from 'lucide-react'
import { updateChefCuisines } from '@/app/admin/actions'
import { toast } from 'sonner'

interface ChefCuisinesFormProps {
  chefId: string
  initialCuisines: string[]
}

export default function ChefCuisinesForm({ chefId, initialCuisines }: ChefCuisinesFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [cuisines, setCuisines] = useState<string[]>(initialCuisines)
  const [newCuisine, setNewCuisine] = useState('')

  const addCuisine = () => {
    if (newCuisine.trim() && !cuisines.includes(newCuisine.trim())) {
      setCuisines([...cuisines, newCuisine.trim()])
      setNewCuisine('')
    }
  }

  const removeCuisine = (cuisineToRemove: string) => {
    setCuisines(cuisines.filter(cuisine => cuisine !== cuisineToRemove))
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      const result = await updateChefCuisines(chefId, cuisines)

      if (result.success) {
        toast.success('Cuisines updated successfully')
      } else {
        toast.error(result.error || 'Failed to update cuisines')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error updating cuisines:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCuisine()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {cuisines.map((cuisine, index) => (
          <Badge 
            key={index} 
            variant="secondary"
            className="flex items-center gap-1 bg-orange-100 text-orange-700"
          >
            {cuisine}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 ml-1 hover:bg-transparent"
              onClick={() => removeCuisine(cuisine)}
            >
              <X className="w-3 h-3 hover:text-red-600" />
            </Button>
          </Badge>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Input 
          value={newCuisine}
          onChange={(e) => setNewCuisine(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add new cuisine (e.g., Punjabi, Italian)"
          className="flex-1"
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={addCuisine}
          disabled={!newCuisine.trim()}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>
      
      <p className="text-sm text-gray-500">
        Common cuisines: Punjabi, Gujarati, South Indian, Italian, Chinese, Thai, Mediterranean
      </p>

      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Update Cuisines
          </>
        )}
      </Button>
    </div>
  )
}
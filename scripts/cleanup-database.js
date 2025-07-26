// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

async function cleanupDatabase() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Admin key bypasses RLS
  )

  console.log('🧹 Starting database cleanup...')

  try {
    // Delete all food photos first (foreign key constraint)
    const { error: photoError } = await supabase
      .from('food_photos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (photoError) {
      console.error('Error deleting food photos:', photoError)
      return
    }
    console.log('✅ Deleted all food photos')

    // Delete all chef cuisines
    const { error: cuisineError } = await supabase
      .from('chef_cuisines')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (cuisineError) {
      console.error('Error deleting chef cuisines:', cuisineError)
      return
    }
    console.log('✅ Deleted all chef cuisines')

    // Delete all chefs
    const { error: chefError } = await supabase
      .from('chefs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (chefError) {
      console.error('Error deleting chefs:', chefError)
      return
    }
    console.log('✅ Deleted all chefs')

    // Verify cleanup
    const { data: remainingChefs } = await supabase
      .from('chefs')
      .select('*')

    console.log(`🎉 Cleanup complete! ${remainingChefs?.length || 0} chefs remaining`)

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
  }
}

// Run cleanup
cleanupDatabase().catch(console.error) 
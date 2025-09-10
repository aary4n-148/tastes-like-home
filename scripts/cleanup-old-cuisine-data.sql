-- Cleanup Old Best Dishes Cuisine Data
-- Removes individual dish names from chef_cuisines table that came from old "Best Dishes" field
-- 
-- Instructions:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire file
-- 3. Click "Run" to execute the cleanup

-- Step 1: Check current cuisine data (for reference)
-- SELECT DISTINCT cuisine, COUNT(*) as chef_count
-- FROM chef_cuisines 
-- GROUP BY cuisine 
-- ORDER BY chef_count DESC, cuisine;

-- Step 2: Remove individual dish names that shouldn't be cuisine types
DELETE FROM chef_cuisines 
WHERE cuisine ILIKE ANY (ARRAY[
  '%chicken%', '%butter%', '%biryani%', '%curry%', '%rice%', 
  '%naan%', '%samosa%', '%dhal%', '%tikka%', '%masala%',
  '%paneer%', '%tandoori%', '%korma%', '%vindaloo%', '%dal%',
  '%roti%', '%chapati%', '%paratha%', '%kebab%', '%pakora%',
  '%chaat%', '%lassi%', '%raita%', '%pickle%', '%chutney%'
]);

-- Step 3: Clean up any remaining individual dish entries
-- Remove entries that are clearly dish names not cuisine types
DELETE FROM chef_cuisines 
WHERE cuisine IN (
  'Butter Chicken', 'Chicken Biryani', 'Vegetable Samosas', 
  'Tarka Dhal', 'Garlic Naan', 'Chicken Tikka Masala',
  'Lamb Curry', 'Fish Curry', 'Palak Paneer', 'Chana Masala',
  'Aloo Gobi', 'Tandoori Chicken', 'Chicken 65', 'Dosa',
  'Idli', 'Dhokla', 'Thepla', 'Rajma', 'Kadhi'
);

-- Step 4: Verify cleanup - check remaining cuisines
-- This should now only show proper cuisine types like "Indian", "Gujarati", "Punjabi", etc.
SELECT DISTINCT cuisine, COUNT(*) as chef_count
FROM chef_cuisines 
GROUP BY cuisine 
ORDER BY cuisine;

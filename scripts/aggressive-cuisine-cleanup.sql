-- Aggressive Cuisine Data Cleanup
-- Remove ALL individual dish names and inappropriate cuisine entries
-- Keep only proper cuisine types like "Indian", "Italian", etc.
-- 
-- Instructions:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire script
-- 3. Click "Run" to execute the cleanup

-- Step 1: Remove specific problematic entries we can see
DELETE FROM chef_cuisines 
WHERE cuisine IN (
  'Non-Veg', 'Sabzi', 'Veg', 'Vegetarian', 'Pure Veg',
  'Party Buffets', 'Dosa / Idli', 'Sambar',
  'Punjabi Homestyle', 'Punjabi Non-Veg',
  -- Add any other individual entries that shouldn't be cuisine types
  'Butter Chicken', 'Chicken Biryani', 'Vegetable Samosas', 
  'Tarka Dhal', 'Garlic Naan', 'Chicken Tikka Masala',
  'Lamb Curry', 'Fish Curry', 'Palak Paneer', 'Chana Masala',
  'Aloo Gobi', 'Tandoori Chicken', 'Chicken 65', 'Dosa',
  'Idli', 'Dhokla', 'Thepla', 'Rajma', 'Kadhi'
);

-- Step 2: Remove entries containing dish-related keywords
DELETE FROM chef_cuisines 
WHERE cuisine ILIKE ANY (ARRAY[
  '%chicken%', '%butter%', '%biryani%', '%curry%', '%rice%', 
  '%naan%', '%samosa%', '%dhal%', '%tikka%', '%masala%',
  '%paneer%', '%tandoori%', '%korma%', '%vindaloo%', '%dal%',
  '%roti%', '%chapati%', '%paratha%', '%kebab%', '%pakora%',
  '%chaat%', '%lassi%', '%raita%', '%pickle%', '%chutney%',
  '%buffet%', '%party%', '%homestyle%'
]);

-- Step 3: Keep only proper cuisine types (whitelist approach)
-- First, let's see what we have left
SELECT DISTINCT cuisine, COUNT(*) as chef_count
FROM chef_cuisines 
GROUP BY cuisine 
ORDER BY cuisine;

-- Step 4: If needed, we can manually keep only these proper cuisine types:
-- DELETE FROM chef_cuisines 
-- WHERE cuisine NOT IN (
--   'Indian', 'Italian', 'Chinese', 'Thai', 'Mexican',
--   'Gujarati', 'Punjabi', 'South Indian', 'North Indian',
--   'Bengali', 'Maharashtrian', 'Rajasthani', 'Kashmiri'
-- );

-- For now, let's see what remains after the cleanup above

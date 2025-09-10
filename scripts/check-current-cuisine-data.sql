-- Check Current Cuisine Data in Database
-- See exactly what cuisine entries exist right now
-- 
-- Instructions:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Copy and paste this query
-- 3. Run to see all current cuisine data

-- Query 1: See all current cuisines with chef names
SELECT 
  c.name as chef_name, 
  cc.cuisine,
  cc.id as cuisine_id
FROM chef_cuisines cc
JOIN chefs c ON cc.chef_id = c.id
ORDER BY c.name, cc.cuisine;

-- Query 2: Count of each cuisine type
SELECT 
  cuisine, 
  COUNT(*) as chef_count
FROM chef_cuisines 
GROUP BY cuisine 
ORDER BY chef_count DESC, cuisine;

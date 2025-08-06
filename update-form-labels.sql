-- Update form field labels for better clarity
-- Run this in your Supabase SQL Editor

-- Change "Cuisine Specialties" to "Best Dishes"
UPDATE chef_questions 
SET text = 'Best Dishes',
    hint_text = 'List your signature dishes that customers love (e.g., Butter Chicken, Biryani, Samosas)'
WHERE text = 'Cuisine Specialties';

-- Add helpful hints to other fields
UPDATE chef_questions 
SET hint_text = 'Tell customers about your cooking experience and what makes your food special'
WHERE text = 'Bio/About You';

UPDATE chef_questions 
SET hint_text = 'Your best photo helps customers choose you - show your personality!'
WHERE text = 'Profile Photo' OR text LIKE '%Profile%';

UPDATE chef_questions 
SET hint_text = 'Beautiful food photos attract more customers - showcase your best dishes!'
WHERE text = 'Food Photos' OR text LIKE '%Food%';

UPDATE chef_questions 
SET hint_text = 'Set a competitive rate - customers often book based on value'
WHERE text = 'Hourly Rate (£)' OR text LIKE '%Rate%';

UPDATE chef_questions 
SET hint_text = 'Customers need to contact you for bookings'
WHERE text = 'Phone Number';

-- Verify the changes
SELECT text, hint_text FROM chef_questions ORDER BY display_order;
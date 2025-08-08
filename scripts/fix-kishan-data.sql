-- Fix Kishan Shah's application data immediately
-- First, check what actually exists

-- 1. Verify the chef_id column exists
SELECT column_name FROM information_schema.columns WHERE table_name = 'chef_applications' AND column_name = 'chef_id';

-- 2. Check current records for Kishan
SELECT chef_id, answers->>'Full Name' as name, status FROM chef_applications WHERE answers->>'Full Name' ILIKE '%Kishan%';

-- 3. Delete any duplicate/problematic records for Kishan Shah
DELETE FROM chef_applications WHERE answers->>'Full Name' = 'Kishan Shah' AND chef_id IS NULL;

-- 4. Insert/Update correct record for Kishan Shah
INSERT INTO chef_applications (answers, status, chef_id, created_at, updated_at, approved_at) 
VALUES (
  '{"Full Name": "Kishan Shah", "Email Address": "kishan@example.com", "Phone Number": "+44 7123 456789", "Bio/About You": "Namaste! I am Kishan from Whitton. Weekdays or weekends, I bring authentic Indian flavours to your kitchen. Famous for my chicken biryani and perfectly spiced sabzi. Quick, clean, and always with a smile!", "Best Dishes": "Non-Veg, Chicken, Sabzi", "Hourly Rate (£)": 19, "Experience Years": 6, "Availability": "Monday-Friday evenings, Weekends all day", "Frequency Preference": "Weekly bookings preferred, one-off events welcome", "Languages Spoken": "Hindi, Punjabi, English", "Travel Distance": 8, "Special Events": "Birthday parties, Anniversary dinners, Family gatherings", "House Help Services": "Kitchen cleaning, Basic meal prep", "Dietary Specialties": "Traditional Indian, Low-oil cooking", "Minimum Booking": 3}'::jsonb,
  'approved',
  'b0fe7adc-8217-436b-a2ce-09559bca3d34',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '25 days', 
  NOW() - INTERVAL '25 days'
) 
ON CONFLICT (chef_id) DO UPDATE SET 
  answers = EXCLUDED.answers,
  updated_at = NOW();

-- 5. Verify the fix worked
SELECT chef_id, answers->>'Full Name' as name, answers->>'Experience Years' as experience, status 
FROM chef_applications 
WHERE chef_id = 'b0fe7adc-8217-436b-a2ce-09559bca3d34';

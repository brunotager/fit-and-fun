-- Migration: Clean up unused columns and add waitlist_email, notifications_enabled, and connected_device.
--
-- Run this script inside your Supabase SQL Editor to apply the changes to your database.

-- Drop old unused columns
ALTER TABLE users 
DROP COLUMN IF EXISTS activity_level,
DROP COLUMN IF EXISTS fitness_goal;

-- Add new columns
ALTER TABLE users
ADD COLUMN IF NOT EXISTS waitlist_email text,
ADD COLUMN IF NOT EXISTS notifications_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS connected_device text;

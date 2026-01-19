-- Add profile_image column to users table
-- This allows users to upload their own profile image
-- Falls back to Gravatar image from email if null

ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;

COMMENT ON COLUMN users.profile_image IS 'URL to user profile image (optional, falls back to Gravatar)';

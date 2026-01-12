-- Fix billing status check constraint to allow 'rejected'
-- Drop the old constraint
ALTER TABLE billing DROP CONSTRAINT IF EXISTS billing_status_check;

-- Add the new constraint with 'rejected' included
ALTER TABLE billing ADD CONSTRAINT billing_status_check 
  CHECK (status IN ('pending','partial','paid','overdue','cancelled','rejected'));

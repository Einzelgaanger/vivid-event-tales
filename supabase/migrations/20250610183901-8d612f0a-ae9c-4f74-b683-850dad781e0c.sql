
-- Add missing category column to notes table
ALTER TABLE public.notes ADD COLUMN category text DEFAULT 'general';

-- Update the notes table to have proper default values for existing records
UPDATE public.notes SET category = 'general' WHERE category IS NULL;

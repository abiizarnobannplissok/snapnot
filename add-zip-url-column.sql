-- ============================================
-- Add zip_url column to file_groups table
-- ============================================
-- Kolom ini menyimpan URL ZIP file yang pre-generated
-- untuk instant download tanpa delay
-- ============================================

ALTER TABLE public.file_groups 
ADD COLUMN IF NOT EXISTS zip_url TEXT;

-- Create index untuk performance
CREATE INDEX IF NOT EXISTS idx_file_groups_zip_url ON public.file_groups(zip_url);

-- ============================================
-- Verify
-- ============================================
-- Run this to verify:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'file_groups';

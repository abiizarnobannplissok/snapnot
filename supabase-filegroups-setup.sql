-- ============================================
-- Supabase Setup untuk File Groups (Public)
-- ============================================
-- Tabel ini menyimpan metadata file groups
-- Siapa saja bisa upload, lihat, dan download
-- ============================================

-- 1. Create table file_groups
CREATE TABLE IF NOT EXISTS public.file_groups (
  id TEXT PRIMARY KEY,
  group_name TEXT NOT NULL,
  uploader TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  file_count INTEGER NOT NULL DEFAULT 0,
  total_size TEXT NOT NULL,
  files JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create index untuk performance
CREATE INDEX IF NOT EXISTS idx_file_groups_created_at ON public.file_groups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_file_groups_created_timestamp ON public.file_groups(created_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_file_groups_uploader ON public.file_groups(uploader);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.file_groups ENABLE ROW LEVEL SECURITY;

-- 4. Create policies untuk PUBLIC access
-- Policy 1: Anyone can SELECT (read)
CREATE POLICY "Anyone can view file groups"
  ON public.file_groups
  FOR SELECT
  USING (true);

-- Policy 2: Anyone can INSERT (upload)
CREATE POLICY "Anyone can create file groups"
  ON public.file_groups
  FOR INSERT
  WITH CHECK (true);

-- Policy 3: Anyone can UPDATE (add files to group)
CREATE POLICY "Anyone can update file groups"
  ON public.file_groups
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy 4: Anyone can DELETE
CREATE POLICY "Anyone can delete file groups"
  ON public.file_groups
  FOR DELETE
  USING (true);

-- 5. Enable Realtime (for live sync)
ALTER PUBLICATION supabase_realtime ADD TABLE public.file_groups;

-- ============================================
-- Test Data (Optional)
-- ============================================
-- Uncomment untuk test:
-- INSERT INTO public.file_groups (id, group_name, uploader, created_at, file_count, total_size, files)
-- VALUES (
--   '1234567890',
--   'Test Group',
--   'Test User',
--   1234567890000,
--   1,
--   '1.5 MB',
--   '[{"id":"file1","name":"test.jpg","size":"1.5 MB","sizeBytes":1500000,"type":"image/jpeg","extension":"jpg","data":"https://pub-xxx.r2.dev/test.jpg"}]'::jsonb
-- );

-- ============================================
-- Verify Setup
-- ============================================
-- Run these to verify:
-- SELECT * FROM public.file_groups;
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'file_groups';

-- ========================================
-- SQL Script untuk File Storage di Supabase
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ========================================

-- 1. Buat tabel file_groups
CREATE TABLE IF NOT EXISTS file_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name TEXT NOT NULL DEFAULT 'Kelompok Tanpa Nama',
  uploader TEXT NOT NULL DEFAULT 'Anonymous',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  file_count INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0
);

-- 2. Buat tabel files untuk menyimpan metadata file
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_group_id UUID REFERENCES file_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,
  extension TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Path di Supabase Storage
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Buat index untuk performa
CREATE INDEX IF NOT EXISTS idx_file_groups_created_at ON file_groups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_group_id ON files(file_group_id);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE file_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- 5. Buat policy untuk akses public (semua orang bisa baca/tulis)
-- File Groups Policies
CREATE POLICY "Allow public read file_groups" ON file_groups
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert file_groups" ON file_groups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update file_groups" ON file_groups
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete file_groups" ON file_groups
  FOR DELETE USING (true);

-- Files Policies
CREATE POLICY "Allow public read files" ON files
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert files" ON files
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update files" ON files
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete files" ON files
  FOR DELETE USING (true);

-- 6. Setup realtime untuk live updates
ALTER PUBLICATION supabase_realtime ADD TABLE file_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE files;

-- 7. Buat function untuk update file_count dan total_size otomatis
CREATE OR REPLACE FUNCTION update_file_group_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE file_groups
    SET 
      file_count = file_count + 1,
      total_size = total_size + NEW.size
    WHERE id = NEW.file_group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE file_groups
    SET 
      file_count = file_count - 1,
      total_size = total_size - OLD.size
    WHERE id = OLD.file_group_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 8. Buat trigger untuk auto-update stats
DROP TRIGGER IF EXISTS trigger_update_file_group_stats ON files;
CREATE TRIGGER trigger_update_file_group_stats
AFTER INSERT OR DELETE ON files
FOR EACH ROW
EXECUTE FUNCTION update_file_group_stats();

-- DONE! Tables siap digunakan 🎉

-- ========================================
-- NOTES:
-- Setelah run SQL ini, lanjut setup Storage Bucket:
-- 1. Buka Supabase Dashboard → Storage
-- 2. Klik "Create a new bucket"
-- 3. Name: "uploaded-files"
-- 4. Public bucket: YES (centang)
-- 5. Klik "Create bucket"
-- ========================================

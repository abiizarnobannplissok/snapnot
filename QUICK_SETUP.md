# ⚡ Quick Setup Commands - File Storage Supabase

## 🎯 Yang Kamu Butuh Jalankan:

### 1️⃣ SQL untuk Tables (Copy & Run di Supabase SQL Editor)

```sql
-- Buka: https://supabase.com/dashboard/project/xuwffxeuzgcokzxavtjt/sql
-- Klik "New Query" → Paste code ini → Run

-- ========================================
-- SQL Script untuk File Storage
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

-- 2. Buat tabel files
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_group_id UUID REFERENCES file_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,
  extension TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Buat index
CREATE INDEX IF NOT EXISTS idx_file_groups_created_at ON file_groups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_group_id ON files(file_group_id);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at DESC);

-- 4. Enable RLS
ALTER TABLE file_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- 5. Policies untuk public access
CREATE POLICY "Allow public read file_groups" ON file_groups FOR SELECT USING (true);
CREATE POLICY "Allow public insert file_groups" ON file_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update file_groups" ON file_groups FOR UPDATE USING (true);
CREATE POLICY "Allow public delete file_groups" ON file_groups FOR DELETE USING (true);

CREATE POLICY "Allow public read files" ON files FOR SELECT USING (true);
CREATE POLICY "Allow public insert files" ON files FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update files" ON files FOR UPDATE USING (true);
CREATE POLICY "Allow public delete files" ON files FOR DELETE USING (true);

-- 6. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE file_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE files;

-- 7. Auto-update stats function
CREATE OR REPLACE FUNCTION update_file_group_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE file_groups SET file_count = file_count + 1, total_size = total_size + NEW.size WHERE id = NEW.file_group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE file_groups SET file_count = file_count - 1, total_size = total_size - OLD.size WHERE id = OLD.file_group_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger
DROP TRIGGER IF EXISTS trigger_update_file_group_stats ON files;
CREATE TRIGGER trigger_update_file_group_stats
AFTER INSERT OR DELETE ON files
FOR EACH ROW EXECUTE FUNCTION update_file_group_stats();
```

**Status:** ✅ Setelah run, lanjut step 2

---

### 2️⃣ Buat Storage Bucket (UI - 30 detik)

1. Buka: https://supabase.com/dashboard/project/xuwffxeuzgcokzxavtjt/storage/buckets
2. Klik **"New bucket"**
3. Isi:
   - Name: `uploaded-files`
   - **✅ CENTANG "Public bucket"** ← PENTING!
4. Klik **"Create bucket"**

**Status:** ✅ Bucket created, lanjut step 3

---

### 3️⃣ SQL untuk Storage Policies (Copy & Run di SQL Editor)

```sql
-- Buka SQL Editor lagi → Paste → Run

-- Policy untuk Storage bucket 'uploaded-files'
CREATE POLICY "Public Access - Select" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploaded-files');

CREATE POLICY "Public Access - Insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploaded-files');

CREATE POLICY "Public Access - Delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'uploaded-files');
```

**Status:** ✅ Policies created, setup selesai!

---

## 🚀 Test Aplikasi

Setelah 3 command di atas, langsung test:

```bash
# Di terminal project
npm run dev
```

Buka browser → http://localhost:3000 → Tab "File Share" → Upload file!

---

## ✅ Checklist Final

- [ ] SQL tables berhasil dibuat (cek Table Editor)
- [ ] Bucket `uploaded-files` ada dan **Public** ✅ (cek Storage)
- [ ] Storage policies sudah diset (3 policies)
- [ ] Test upload file berhasil
- [ ] Test download file berhasil
- [ ] Test delete group berhasil

---

## 🎉 Selesai!

**Total waktu setup: ~3 menit**

Kalau ada error, buka file `SUPABASE_FILE_STORAGE_SETUP.md` untuk troubleshooting detail.

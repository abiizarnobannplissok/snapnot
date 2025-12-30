# 🔧 Fix Error "Gagal membuat file group"

## Error yang Mungkin Muncul:

### ❌ Error: "Table file_groups belum dibuat"

**Artinya:** SQL script belum dijalankan

**Solusi:**
1. Buka Supabase SQL Editor: https://supabase.com/dashboard/project/xuwffxeuzgcokzxavtjt/sql
2. Klik "New Query"
3. Copy-paste SEMUA isi file `supabase-file-storage-setup.sql`
4. Klik "Run"
5. Refresh halaman aplikasi

---

### ❌ Error: "Storage bucket 'uploaded-files' belum dibuat"

**Artinya:** Bucket storage belum dibuat di Supabase

**Solusi:**
1. Buka Supabase Storage: https://supabase.com/dashboard/project/xuwffxeuzgcokzxavtjt/storage/buckets
2. Klik "New bucket"
3. Name: `uploaded-files`
4. **✅ CENTANG "Public bucket"** (WAJIB!)
5. File size limit: 1024 MB
6. Klik "Create bucket"

---

### ❌ Error: "RLS policy untuk file_groups belum diset"

**Artinya:** Row Level Security policies belum aktif

**Solusi:**
Jalankan SQL ini di SQL Editor:

```sql
-- Enable RLS
ALTER TABLE file_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read file_groups" ON file_groups FOR SELECT USING (true);
CREATE POLICY "Allow public insert file_groups" ON file_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update file_groups" ON file_groups FOR UPDATE USING (true);
CREATE POLICY "Allow public delete file_groups" ON file_groups FOR DELETE USING (true);

CREATE POLICY "Allow public read files" ON files FOR SELECT USING (true);
CREATE POLICY "Allow public insert files" ON files FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update files" ON files FOR UPDATE USING (true);
CREATE POLICY "Allow public delete files" ON files FOR DELETE USING (true);
```

---

### ❌ Error: "Storage policy belum diset"

**Artinya:** Storage bucket policies belum dikonfigurasi

**Solusi:**
Jalankan SQL ini di SQL Editor:

```sql
-- Storage Policies
CREATE POLICY "Public Access - Select" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploaded-files');

CREATE POLICY "Public Access - Insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploaded-files');

CREATE POLICY "Public Access - Delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'uploaded-files');
```

---

## 🧪 Cara Cek Apakah Setup Sudah Benar

### 1. Cek Tables
- Buka: https://supabase.com/dashboard/project/xuwffxeuzgcokzxavtjt/editor
- Pastikan ada table: `file_groups` dan `files`

### 2. Cek Policies di Tables
- Klik table `file_groups` → Tab "Policies"
- Harus ada 4 policies: SELECT, INSERT, UPDATE, DELETE
- Semua dengan "Policy definition: true"

### 3. Cek Storage Bucket
- Buka: https://supabase.com/dashboard/project/xuwffxeuzgcokzxavtjt/storage/buckets
- Harus ada bucket: `uploaded-files`
- Status: **Public** (ada badge hijau)

### 4. Cek Storage Policies
- Klik bucket `uploaded-files` → Tab "Policies"
- Harus ada 3 policies: SELECT, INSERT, DELETE

---

## 🎯 Checklist Lengkap

Pastikan semua ini sudah ✅:

- [ ] SQL script `supabase-file-storage-setup.sql` sudah dijalankan
- [ ] Table `file_groups` ada di database
- [ ] Table `files` ada di database
- [ ] Table policies (4 policies untuk setiap table)
- [ ] Storage bucket `uploaded-files` sudah dibuat
- [ ] Bucket diset sebagai **Public**
- [ ] Storage policies (3 policies) sudah diset

---

## 🚀 Test Setelah Fix

1. **Refresh browser** (Ctrl+Shift+R untuk hard refresh)
2. **Buka developer console** (F12)
3. **Upload file test** (gambar kecil < 1MB)
4. **Lihat console log:**
   - Harus ada: `📤 Starting upload for X files...`
   - Harus ada: `✅ Upload success`
   - Tidak boleh ada: `❌` (error)

---

## 💡 Tips Debug

**Buka Browser Console (F12) untuk melihat error detail:**

```javascript
// Console akan show:
📤 Starting upload for 1 files...
📝 Creating file group: Test Group - Files: 1
✅ Group created: <uuid>
📤 Uploading to storage: <path> - Size: 2.5 MB
✅ Upload success: <path>
```

Kalau ada error, console akan show pesan yang spesifik tentang apa yang salah.

---

## 📞 Masih Error?

Kalau setelah semua langkah di atas masih error:

1. **Screenshot error message** di browser console
2. **Cek Supabase Dashboard** → Table Editor & Storage
3. **Jalankan ulang SEMUA SQL script** dari awal
4. **Restart dev server**: `npm run dev`

---

**Good luck! 🎉**

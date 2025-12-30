# 🚀 Setup Supabase File Storage untuk NeonNotes

## ✅ Checklist Setup

- [ ] **Step 1:** Jalankan SQL Script untuk buat tables
- [ ] **Step 2:** Buat Storage Bucket di Supabase
- [ ] **Step 3:** Setup Storage Policy (Public Access)
- [ ] **Step 4:** Test Upload & Download

---

## 📋 Step 1: Jalankan SQL Script

### Cara Menjalankan:

1. **Buka Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Pilih project: `xuwffxeuzgcokzxavtjt`

2. **Buka SQL Editor**
   - Sidebar kiri → **SQL Editor**
   - Klik **"New Query"**

3. **Copy-Paste SQL Script**
   - Buka file: `supabase-file-storage-setup.sql`
   - Copy semua isinya
   - Paste di SQL Editor

4. **Run Script**
   - Klik **"Run"** atau tekan `Ctrl+Enter`
   - Tunggu sampai muncul pesan sukses

5. **Verify Tables Created**
   - Sidebar kiri → **Table Editor**
   - Pastikan ada 2 tables baru:
     * `file_groups`
     * `files`

---

## 📦 Step 2: Buat Storage Bucket

### Cara Membuat Bucket:

1. **Buka Storage**
   - Dashboard → Sidebar kiri → **Storage**
   - Atau: https://supabase.com/dashboard/project/xuwffxeuzgcokzxavtjt/storage/buckets

2. **Create New Bucket**
   - Klik **"New bucket"** atau **"Create a new bucket"**

3. **Isi Form:**
   ```
   Name: uploaded-files
   Public bucket: ✅ YES (CENTANG INI!)
   File size limit: 100 MB
   Allowed MIME types: * (leave empty for all types)
   ```

4. **Klik "Create bucket"**

5. **Verify Bucket Created**
   - Seharusnya muncul bucket `uploaded-files` di list
   - Status: **Public**

---

## 🔐 Step 3: Setup Storage Policy

Bucket sudah public, tapi kita perlu set policy agar semua orang bisa upload/download.

### Cara Setup Policy:

1. **Buka Policies**
   - Storage → Klik bucket `uploaded-files`
   - Klik tab **"Policies"**

2. **Add New Policy**
   - Klik **"New policy"**
   - Pilih **"For full customization"**

3. **Policy untuk SELECT (Download)**
   ```sql
   Policy name: Public Access - Select
   Allowed operation: SELECT
   Policy definition:
   
   true
   ```
   - Klik **"Review"** → **"Save policy"**

4. **Policy untuk INSERT (Upload)**
   - Klik **"New policy"** lagi
   ```sql
   Policy name: Public Access - Insert
   Allowed operation: INSERT
   Policy definition:
   
   true
   ```
   - Klik **"Review"** → **"Save policy"**

5. **Policy untuk DELETE**
   - Klik **"New policy"** lagi
   ```sql
   Policy name: Public Access - Delete
   Allowed operation: DELETE
   Policy definition:
   
   true
   ```
   - Klik **"Review"** → **"Save policy"**

### Atau Gunakan SQL (Lebih Cepat):

Buka SQL Editor lagi dan run:

```sql
-- Policy untuk public access pada Storage bucket 'uploaded-files'

-- Allow public to read (download) files
CREATE POLICY "Public Access - Select" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'uploaded-files');

-- Allow public to upload files
CREATE POLICY "Public Access - Insert" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'uploaded-files');

-- Allow public to delete files
CREATE POLICY "Public Access - Delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'uploaded-files');
```

---

## 🧪 Step 4: Test Upload & Download

1. **Restart Dev Server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Buka Aplikasi**
   - Go to: http://localhost:3000
   - Klik tab **"File Share"**

3. **Test Upload**
   - Klik "Unggah File" atau drag & drop file
   - Isi nama grup (optional)
   - Upload beberapa file (gambar, PDF, dll)
   - Tunggu sampai muncul toast "Berhasil mengupload X file!"

4. **Verify di Supabase**
   - Dashboard → **Storage** → bucket `uploaded-files`
   - Seharusnya ada folder dengan UUID (group ID)
   - Di dalam folder ada files yang kamu upload

5. **Test Download**
   - Klik icon download pada file individual
   - File seharusnya terdownload ke komputer kamu
   - Test juga "Download Semua (ZIP)"

6. **Test Delete**
   - Klik icon trash pada group
   - Confirm delete
   - Group dan semua files seharusnya terhapus

---

## 🎉 Selesai!

Jika semua test berhasil, artinya setup sudah sempurna! 

### Features yang Sekarang Aktif:

✅ Upload file sampai 100MB per file  
✅ Download individual file  
✅ Download all files as ZIP  
✅ Add more files ke existing group  
✅ Delete file group  
✅ Real-time sync antar devices  
✅ Files tersimpan permanent di Supabase Storage  
✅ Public access (siapa saja bisa upload/download)  

---

## 🐛 Troubleshooting

### Error: "Gagal upload file"

**Penyebab:**
- Bucket belum dibuat
- Bucket bukan public
- Policy belum diset

**Solusi:**
1. Cek Storage → Pastikan bucket `uploaded-files` ada dan public
2. Jalankan SQL policy di atas
3. Restart dev server

---

### Error: "new row violates row-level security policy"

**Penyebab:**
- RLS policy untuk tables file_groups/files belum aktif

**Solusi:**
- Pastikan SQL script di Step 1 sudah dijalankan
- Cek Table Editor → file_groups → Policies → Pastikan ada 4 policies (SELECT, INSERT, UPDATE, DELETE)

---

### Error: "Failed to fetch"

**Penyebab:**
- Supabase credentials tidak valid
- Network issue

**Solusi:**
1. Cek file `.env`:
   ```
   VITE_SUPABASE_URL=https://xuwffxeuzgcokzxavtjt.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
2. Restart dev server
3. Hard refresh browser (Ctrl+Shift+R)

---

### Files Tidak Muncul di Storage

**Penyebab:**
- Upload failed tapi tidak ada error message
- Policy belum diset

**Solusi:**
1. Check browser console untuk error
2. Verify storage policies
3. Test dengan file kecil dulu (< 1MB)

---

## 📞 Next Steps

Setelah setup berhasil:

1. **Deploy ke Production**
   - Deploy ke Vercel/Netlify
   - Set environment variables di hosting

2. **Optimize Performance**
   - Setup CDN untuk faster downloads
   - Enable compression

3. **Add Features**
   - File preview (images, PDFs)
   - Expiration dates for files
   - Password protection untuk groups
   - File size analytics

**Happy coding! 🚀**

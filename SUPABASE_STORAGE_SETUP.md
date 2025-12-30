# 🚀 SETUP SUPABASE STORAGE - 5 MENIT!

Aplikasi sekarang pakai **Supabase Storage** (bukan Cloudflare R2 lagi).

## ✅ LANGKAH SETUP:

### 1. Buat Storage Bucket di Supabase

1. **Login Supabase Dashboard**
   - https://supabase.com/dashboard
   - Pilih project: `xuwffxeuzgcokzxavtjt`

2. **Buka Storage**
   - Sidebar kiri → **Storage**
   - Klik **"New bucket"** atau **"Create a new bucket"**

3. **Isi Form:**
   ```
   Name: uploaded-files
   Public bucket: ✅ YES (HARUS CENTANG!)
   File size limit: 100 MB
   Allowed MIME types: (kosongkan untuk semua jenis file)
   ```

4. **Klik "Create bucket"**
   - Bucket `uploaded-files` seharusnya muncul di list
   - Status: **Public**

---

### 2. Setup Storage Policies (Akses Public)

Supaya semua orang bisa upload/download files.

#### Via Dashboard (Simple):

1. **Buka Bucket Policies**
   - Storage → Klik bucket `uploaded-files`
   - Tab **"Policies"**

2. **Add 3 Policies:**

**Policy 1 - SELECT (Download):**
```
Policy name: Public Read
Allowed operation: SELECT
Target roles: public
Policy definition: true
```

**Policy 2 - INSERT (Upload):**
```
Policy name: Public Insert
Allowed operation: INSERT
Target roles: public
Policy definition: true
```

**Policy 3 - DELETE:**
```
Policy name: Public Delete
Allowed operation: DELETE
Target roles: public
Policy definition: true
```

#### Via SQL (Lebih Cepat):

1. **Buka SQL Editor**
   - Dashboard → **SQL Editor** → **New Query**

2. **Copy-Paste SQL Ini:**

```sql
-- Allow public read (download)
CREATE POLICY "Public Read" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'uploaded-files');

-- Allow public insert (upload)
CREATE POLICY "Public Insert" ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'uploaded-files');

-- Allow public delete
CREATE POLICY "Public Delete" ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'uploaded-files');
```

3. **Klik "Run" (Ctrl+Enter)**

---

### 3. Verify Setup

1. **Check Bucket**
   - Storage → `uploaded-files`
   - Status: **Public** ✅
   - Policies: **3 policies active** ✅

2. **Check .env File**
   ```bash
   # .env harus ada:
   VITE_SUPABASE_URL=https://xuwffxeuzgcokzxavtjt.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   
   # TIDAK ADA R2 config lagi!
   ```

---

### 4. Test Upload & Download

1. **Restart Dev Server**
   ```bash
   # Stop (Ctrl+C) lalu:
   npm run dev
   ```

2. **Buka Aplikasi**
   - http://localhost:3000 (atau IP server kamu)
   - Klik tab **"File Share"**

3. **Test Upload**
   - Upload 1-3 file (gambar, PDF, video)
   - Tunggu toast "Berhasil mengupload X file!"
   - Console log: "✅ File uploaded: ..."

4. **Verify di Supabase**
   - Dashboard → Storage → `uploaded-files`
   - Seharusnya ada folder dengan timestamp (group ID)
   - Di dalam folder ada files yang kamu upload

5. **Test Download**
   - Klik icon download (↓) pada file
   - File langsung terdownload ✅
   - Test "Download Semua (ZIP)" juga

6. **Test Delete**
   - Klik icon trash (🗑️) pada group
   - Confirm delete
   - Group + files terhapus ✅

---

## 🎉 SELESAI!

### Features yang Aktif:

✅ Upload file sampai 100MB per file  
✅ Download individual file  
✅ Download all sebagai ZIP  
✅ Add files ke existing group  
✅ Delete file group  
✅ Real-time sync antar devices  
✅ Files di Supabase Storage (permanent)  
✅ No CORS issues!  
✅ No SSL certificate problems!  

---

## 🐛 Troubleshooting

### ❌ Error: "new row violates row-level security policy"

**Solusi:**
- Policy belum di-setup
- Jalankan SQL di atas atau add policies via dashboard

### ❌ Error: "Bucket not found"

**Solusi:**
- Bucket belum dibuat atau nama salah
- Pastikan nama bucket: `uploaded-files` (persis!)

### ❌ Error: "Object upload failed"

**Solusi:**
1. Cek bucket bukan Public
2. Cek policies sudah ada
3. Restart dev server
4. Clear browser cache

### ❌ Files tidak muncul

**Solusi:**
- Hard refresh browser (Ctrl+Shift+R)
- Check Supabase Dashboard → Storage
- Check console untuk error messages

---

## 📊 Storage Limits (Free Tier)

- **Storage:** 1 GB
- **Bandwidth:** 2 GB/month
- **Max file size:** 50 MB (bisa dinaikkan di bucket settings)

Untuk production dengan traffic besar, upgrade ke Pro plan!

---

## 🚀 Next Steps

1. **Deploy ke Production**
   - Deploy ke Vercel/Netlify
   - Set environment variables di hosting

2. **Optional Features**
   - File preview (images, PDFs)
   - Expiration dates
   - Password protection
   - File size analytics

---

**DONE! Sekarang upload/download pakai Supabase Storage! 🎊**

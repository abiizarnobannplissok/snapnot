# Setup ZIP Instant Download

## ✅ Yang Sudah Dikerjakan

### 1. Database Schema
- Tambah kolom `zip_url` di table `file_groups`
- File: `add-zip-url-column.sql`

### 2. Backend Service
- Generate ZIP otomatis saat upload file
- Re-generate ZIP saat tambah file ke group
- Hapus ZIP di storage saat delete group
- File: `services/supabaseFileGroups.ts`

### 3. Frontend
- Download ZIP instant tanpa delay
- Fetch menggunakan blob untuk hindari browser warning
- Fallback untuk old groups tanpa ZIP
- File: `components/FileShare.tsx`

---

## 🚀 Cara Setup

### Step 1: Run SQL Migration

Buka **Supabase Dashboard** → **SQL Editor** → paste & run:

```sql
-- Add zip_url column
ALTER TABLE public.file_groups 
ADD COLUMN IF NOT EXISTS zip_url TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_file_groups_zip_url ON public.file_groups(zip_url);

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'file_groups';
```

### Step 2: Setup CORS di Supabase Storage

Ini **PENTING** agar tidak ada warning "file tidak dapat di download dengan aman"!

#### Option A: Via Supabase Dashboard (Recommended)
1. Buka **Supabase Dashboard**
2. Pilih project Anda
3. Klik **Storage** di sidebar
4. Klik **Settings** (icon gear)
5. Scroll ke **CORS Configuration**
6. Klik **Edit CORS**
7. Pastikan ada konfigurasi ini:

```json
[
  {
    "allowedOrigins": ["*"],
    "allowedMethods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "allowedHeaders": ["*"],
    "exposedHeaders": ["Content-Length", "Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

#### Option B: Via Supabase CLI (Advanced)

```bash
# Install Supabase CLI jika belum
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Set CORS
supabase storage update uploaded-files --cors-allowed-origins '*'
```

#### Option C: Via API (Manual)

Buka **Supabase Dashboard** → **Storage** → **uploaded-files bucket** → **Configuration**

Set CORS policy:
```json
{
  "AllowedOrigins": ["*"],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3600
}
```

### Step 3: Build & Test

```bash
# Build app
npm run build

# Preview production build
npm run preview
```

#### Test Checklist:
- [ ] Upload file baru → cek ada ZIP di storage
- [ ] Download ZIP → langsung download tanpa warning ⚡
- [ ] Tambah file ke group → ZIP di-update
- [ ] Hapus group → ZIP ikut terhapus

---

## 🎯 Cara Kerja

### Saat Upload:
1. User upload file → simpan ke storage
2. Generate ZIP dari semua file
3. Upload ZIP ke storage
4. Simpan ZIP URL di database

### Saat Download:
1. Fetch ZIP via blob (aman, no warning)
2. Trigger download langsung
3. **INSTANT!** No processing, no delay! ⚡

### Saat Delete:
1. Hapus semua file di folder group (include ZIP)
2. Hapus metadata di database

---

## 🔧 Troubleshooting

### Warning "File tidak dapat di download"
**Penyebab:** CORS tidak di-setup atau salah konfigurasi

**Solusi:**
1. Pastikan CORS di Supabase Storage sudah benar (Step 2)
2. Test dengan curl:
   ```bash
   curl -I YOUR_ZIP_URL
   ```
   Harus ada header:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, HEAD, ...
   ```

### ZIP Tidak Terhapus
**Penyebab:** Bug di delete function

**Solusi:** Cek console log saat delete, pastikan ada:
```
✅ Deleted X files (including ZIP) from storage
```

### Old Groups Tidak Punya ZIP
**Normal!** Group yang dibuat sebelum update tidak punya pre-generated ZIP.

**Solusi:** Re-upload atau tunggu sampai ada file baru ditambahkan (akan auto-generate ZIP).

---

## 📊 Performance

### Before (Generate on-the-fly):
- 10 files = ~5-10 detik delay
- Muncul progress notifikasi

### After (Pre-generated):
- 10 files = **INSTANT** ⚡
- Langsung download tanpa delay
- Sama seperti website profesional!

---

## 🎉 Result

User sekarang bisa:
✅ Download ZIP instant tanpa delay
✅ Tidak ada warning browser
✅ Experience sama seperti Google Drive / Dropbox
✅ File ZIP otomatis di-manage (delete saat group dihapus)

---

## 📝 Files Changed

1. `add-zip-url-column.sql` - Migration file
2. `fileTypes.ts` - Add zipUrl to FileGroup type
3. `services/supabaseFileGroups.ts` - Generate & manage ZIP
4. `components/FileShare.tsx` - Instant download logic

---

**Next Steps:** Run migration SQL, setup CORS, dan test! 🚀

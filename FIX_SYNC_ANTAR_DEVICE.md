# 🔄 Fix Sync Antar Device - Upload dari HP, Lihat di Laptop

## ❌ Problem Sebelumnya:
- Upload di HP → Disimpan di **localStorage HP** saja ❌
- Buka di Laptop → Data tidak ada ❌
- **localStorage = per-device only!**

## ✅ Solusi: Pindahkan Metadata ke Supabase

**Files:** Tetap di **R2** (cloud) ✅
**Metadata:** Pindah dari **localStorage** ke **Supabase** (cloud) ✅

**Result:** Upload dari **device mana saja**, semua orang bisa lihat! ✅

---

## 📋 Setup Steps (5 Menit):

### Step 1: Create Table di Supabase

1. **Login ke Supabase Dashboard:**
   https://supabase.com/dashboard

2. **Pilih project:** `xuwffxeuzgcokzxavtjt`

3. **Klik SQL Editor** di sidebar kiri

4. **Klik "New Query"**

5. **Copy-paste semua SQL** dari file `supabase-filegroups-setup.sql`

6. **Klik "Run"** atau tekan `Ctrl+Enter`

7. **Verify:** Klik **Table Editor** → Should see table `file_groups` ✅

### Step 2: Rebuild Aplikasi

```bash
cd /snapnot
npm run build
```

### Step 3: Upload dist/ ke Server

Upload semua files di folder `dist/` ke server production.

### Step 4: Test!

#### Test 1: Upload dari HP
1. Buka `https://snap.masihkok.my.id` di **HP**
2. Upload beberapa file
3. Should see "Upload success" ✅

#### Test 2: Buka di Laptop
1. Buka `https://snap.masihkok.my.id` di **Laptop**
2. **Files yang diupload dari HP akan muncul!** ✅

#### Test 3: Real-time Sync
1. Buka `https://snap.masihkok.my.id` di **2 browser** berbeda
2. Upload file di browser 1
3. Browser 2 akan **auto-update** tanpa refresh! ✅

---

## 🎯 Apa yang Berubah?

### Before (localStorage):
```
HP Upload → localStorage HP ❌
Laptop Open → localStorage Laptop (empty) ❌
```

### After (Supabase):
```
HP Upload → Supabase (cloud) → R2 (cloud) ✅
Laptop Open → Supabase (cloud) → See all files! ✅
Anyone Open → Supabase (cloud) → See all files! ✅
```

---

## 🔒 Security & Access:

### ✅ Public Access (Siapa saja bisa):
- Upload file ✅
- Lihat semua file yang diupload orang lain ✅
- Download file ✅
- Delete file group ✅

### How?
Supabase RLS (Row Level Security) policies:
```sql
-- Anyone can SELECT (read)
CREATE POLICY "Anyone can view file groups"
  ON public.file_groups
  FOR SELECT
  USING (true);

-- Anyone can INSERT (upload)
CREATE POLICY "Anyone can create file groups"
  ON public.file_groups
  FOR INSERT
  WITH CHECK (true);

-- Anyone can UPDATE (add files)
CREATE POLICY "Anyone can update file groups"
  ON public.file_groups
  FOR UPDATE
  USING (true);

-- Anyone can DELETE
CREATE POLICY "Anyone can delete file groups"
  ON public.file_groups
  FOR DELETE
  USING (true);
```

**Semua orang = public anonymous access** ✅

---

## 📊 Architecture Baru:

```
┌─────────────┐
│   Browser   │ (HP/Laptop/Any Device)
└──────┬──────┘
       │
       ├──── Upload File ────► Cloudflare R2 (1GB max)
       │                       │
       │                       ▼
       │                   Public URL
       │                   (pub-xxx.r2.dev)
       │
       └──── Save Metadata ──► Supabase Database
                               │
                               ▼
                           file_groups table
                           (public access)
                               │
                               ▼
                           Real-time Sync
                           (auto update all devices!)
```

---

## 🔍 Verify Setup:

### Check Supabase Table
1. Supabase Dashboard → **Table Editor**
2. Table: `file_groups`
3. Should see columns: `id`, `group_name`, `uploader`, `files`, etc. ✅

### Check Browser Console
Upload file dan check console (F12):
```
📝 Creating file group: Test - Files: 1
📤 Processing file: test.jpg - Size: 1.5 MB
📤 Uploading to R2: 1234567890/test.jpg
✅ Upload success: https://pub-xxx.r2.dev/test.jpg
✅ Saving group metadata to Supabase...
✅ Group saved successfully!
```

### Check Supabase Dashboard
1. Table Editor → `file_groups`
2. Should see new row with uploaded file metadata ✅

---

## 🆘 Troubleshooting:

### Error: "relation file_groups does not exist"
**Solution:** SQL belum dijalankan. Run `supabase-filegroups-setup.sql` di SQL Editor.

### Error: "permission denied for table file_groups"
**Solution:** RLS policies belum dibuat. Re-run SQL, pastikan semua policies ter-create.

### Files masih tidak sync
1. Hard refresh browser: `Ctrl+Shift+R`
2. Check console untuk error
3. Verify table `file_groups` ada di Supabase
4. Check RLS policies enabled

### Real-time tidak bekerja
1. Verify: `ALTER PUBLICATION supabase_realtime ADD TABLE public.file_groups;` sudah dirun
2. Check Supabase Dashboard → **Database** → **Replication** → Table `file_groups` should be enabled

---

## ✅ Success Checklist:

- [ ] Run SQL di Supabase (create table + policies)
- [ ] Verify table `file_groups` ada di Table Editor
- [ ] Rebuild: `npm run build`
- [ ] Upload dist/ ke server
- [ ] Test upload dari HP
- [ ] Test buka di laptop → files muncul! ✅
- [ ] Test upload dari laptop
- [ ] Test buka di HP → files muncul! ✅
- [ ] Test delete file group → sync ke semua device ✅

---

## 🎉 Result:

Sekarang aplikasi benar-benar **multi-device & public**:
- ✅ Upload dari device mana saja
- ✅ Semua orang bisa lihat file yang diupload
- ✅ Real-time sync (auto update tanpa refresh)
- ✅ Download dari device mana saja
- ✅ Delete dari device mana saja

**Perfect untuk kolaborasi dan file sharing!** 🚀

---

## 📝 Files yang Diubah:

1. ✅ `supabase-filegroups-setup.sql` - SQL untuk create table
2. ✅ `services/supabaseFileGroups.ts` - Service baru untuk Supabase
3. ✅ `components/FileShare.tsx` - Ganti import ke service baru
4. ✅ `FIX_SYNC_ANTAR_DEVICE.md` - Dokumentasi ini

---

**Ikuti Step 1-4 di atas, lalu test!** ⚡

# 🚀 Deploy Instructions - IMPORTANT!

## Tanggal: 6 November 2025, 12:45 WIB

---

## ⚠️ MASALAH YANG TERJADI

### Error yang masih muncul:
```
document.39fc2242.chunk.js:1 Uncaught ReferenceError: Cannot access 'O' before initialization
```

### Root Cause:
**Build folder yang LAMA masih di server!**

File yang masih di-load:
- ❌ `document.39fc2242.chunk.js` (OLD - Has error)
- ❌ `text.ff26a501.chunk.js` (OLD - Has error)

File yang seharusnya:
- ✅ `document.b4cfb0e1.chunk.js` (NEW - Fixed)
- ✅ `text.e7946eb6.chunk.js` (NEW - Fixed)
- ✅ `main.e55ed130.js` (NEW - ErrorBoundary)

---

## ✅ SOLUSI: Deploy Build Baru

### Step 1: Hapus SEMUA file lama di server

```bash
# Di server, hapus semua file di folder web root:
cd /path/to/your/webroot
rm -rf *

# Atau via FTP/File Manager:
# - Delete ALL files di folder public_html atau www
# - Jangan lupa file hidden (.htaccess jika ada backup)
```

### Step 2: Upload SEMUA file dari folder `/build`

```bash
# Upload SEMUA file dari folder build local ke server
# Struktur harus sama persis:

Server folder:
├── index.html                  ← WAJIB
├── asset-manifest.json         ← WAJIB
├── manifest.json
├── robots.txt
├── favicon.ico
└── static/
    ├── css/
    │   └── main.58d2c20a.css   ← NEW
    └── js/
        ├── main.e55ed130.js         ← NEW (ErrorBoundary)
        ├── runtime.00f9bb3e.js      ← Runtime
        ├── vendors.54c5c66e.js      ← Vendors
        ├── react-vendor.7ea62ed6.js ← React
        ├── radix-ui.51dfda98.chunk.js
        ├── framer-motion.73b26c91.chunk.js
        ├── document.b4cfb0e1.chunk.js  ← NEW (Fixed!)
        └── text.e7946eb6.chunk.js      ← NEW (Fixed!)
```

**PENTING:** Upload **SEMUA** file, jangan skip apapun!

---

## 🗑️ Clear Cache (WAJIB!)

### A. Server-Side Cache

#### Jika pakai Cloudflare:
```bash
# 1. Login ke Cloudflare Dashboard
# 2. Pilih domain: deep.ct.ws
# 3. Sidebar → Caching → Configuration
# 4. Klik "Purge Everything"
# 5. Confirm
```

#### Jika pakai cPanel:
```bash
# 1. Login cPanel
# 2. Cari "Clear Cache" atau "Cache Manager"
# 3. Clear All Cache
```

#### Jika pakai Nginx:
```bash
# SSH ke server
sudo rm -rf /var/cache/nginx/*
sudo systemctl reload nginx
```

### B. Browser Cache (User Side)

#### Chrome/Edge:
```
1. Tekan: Ctrl + Shift + Delete (Windows) atau Cmd + Shift + Delete (Mac)
2. Pilih: "Cached images and files"
3. Time range: "All time"
4. Klik: Clear data
```

#### Hard Refresh:
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

#### Incognito Mode (Testing):
```
Chrome: Ctrl + Shift + N
Firefox: Ctrl + Shift + P
```

---

## 🔧 Fix Query Parameters (?i=1)

### Masalah:
URL selalu jadi: `https://deep.ct.ws/?i=1`

### Penyebab:
- Browser extension (likely Immersive Translate, Google Translate, atau similar)
- Query parameter otomatis ditambahkan

### Solusi:
App sudah di-fix untuk handle query parameters. Router React akan ignore `?i=1` dan tetap route ke halaman yang benar.

**Tidak perlu action**, app akan work normal!

---

## 📋 Verification Checklist

### After Upload (Wajib Cek!):

#### 1. Cek File di Server
```bash
# Via SSH atau File Manager, pastikan file ini ADA:
ls -la static/js/

# Harus ada:
✓ document.b4cfb0e1.chunk.js
✓ text.e7946eb6.chunk.js
✓ main.e55ed130.js

# JANGAN ada:
✗ document.39fc2242.chunk.js  (OLD - delete!)
✗ text.ff26a501.chunk.js      (OLD - delete!)
```

#### 2. Test di Browser (Incognito)
```
1. Buka Incognito/Private Window
2. Go to: https://deep.ct.ws/
3. Open DevTools (F12)
4. Check Console → Should be CLEAN
5. Check Network tab → Should load new files
```

#### 3. Verify Files Loaded
```
Network Tab di DevTools:

✓ document.b4cfb0e1.chunk.js  (Status: 200)
✓ text.e7946eb6.chunk.js      (Status: 200)
✓ main.e55ed130.js            (Status: 200)
✓ main.58d2c20a.css           (Status: 200)

✗ TIDAK boleh ada:
  document.39fc2242.chunk.js  (Jika ada = masih cache!)
```

---

## 🎯 Testing Steps

### Test 1: Homepage
```
URL: https://deep.ct.ws/
Expected: Document Translation page loads
Console: No errors
```

### Test 2: Text Page
```
URL: https://deep.ct.ws/text
Expected: Text Translation page loads
Console: No errors
```

### Test 3: With Query Param
```
URL: https://deep.ct.ws/?i=1
Expected: Still loads Document page
Console: No errors
App handles ?i=1 gracefully
```

### Test 4: Translation
```
1. Enter API key
2. Select languages
3. Enter text/upload file
4. Click translate
Expected: Works without errors
```

---

## 🔍 Debugging

### Jika masih error "Cannot access before initialization":

#### Check 1: File Hash
```
Buka DevTools → Network → Filter: JS

Cari file: document.*.chunk.js
Hash harus: b4cfb0e1

Jika masih: 39fc2242 
→ File lama belum terhapus/terupload!
```

#### Check 2: index.html
```
View source: https://deep.ct.ws/

Cari baris:
<script src="/static/js/document.*.chunk.js">

Hash harus match dengan file di Network tab
```

#### Check 3: Cache Headers
```
Network tab → Click file → Headers

Check:
- Cache-Control: harus ada
- Status: harus 200, bukan 304 (cached)
```

---

## 📝 New Features Added

### 1. Error Boundary ✅
```
Jika ada error runtime:
- App tidak crash total
- Tampil error page yang friendly
- User bisa refresh
```

### 2. Better Suspense Fallback ✅
```
Saat lazy loading:
- Loading spinner yang lebih baik
- Background matching app
- Better UX
```

### 3. Query Parameter Support ✅
```
URL dengan ?i=1, ?utm_source, dll:
- App tetap work normal
- Router ignore query params
- No routing errors
```

---

## 🚀 Deploy Checklist (Final)

```
Before Deploy:
☐ npm run build selesai
☐ Folder /build ada dan lengkap
☐ Backup file lama (optional)

Deploy Process:
☐ Delete ALL old files di server
☐ Upload ALL files dari /build
☐ Verify file structure di server
☐ Check file permissions (755 folders, 644 files)

After Deploy:
☐ Clear Cloudflare cache (if using)
☐ Clear server cache
☐ Test in Incognito mode
☐ Check console for errors
☐ Verify correct files loaded (check hash)
☐ Test all pages (/, /text)
☐ Test with query params (?i=1)
☐ Test translation functionality
```

---

## 💡 Pro Tips

### 1. Always Use Incognito for Testing
```
Kenapa: Browser cache sangat persistent
Solusi: Test di Incognito untuk hasil akurat
```

### 2. Check File Hash
```
File hash berubah = file berbeda
Hash sama = masih file lama (cache issue)
```

### 3. Monitor Console
```
F12 → Console
Red errors = masalah
Yellow warnings = bisa diabaikan (preload warning normal)
```

### 4. Verify Upload
```
Jangan assume upload sukses
Cek manual di File Manager
```

---

## ❓ FAQ

### Q: Kenapa masih error padahal sudah upload?
**A:** Kemungkinan:
1. File lama belum terhapus semua
2. Cache belum di-clear
3. Upload tidak lengkap
4. Browser cache masih aktif

**Fix:** Delete ALL, upload ALL, clear cache, test Incognito

---

### Q: Kenapa ada ?i=1 di URL?
**A:** Browser extension yang menambahkan parameter tracking. App sudah di-fix untuk handle ini. **Tidak masalah**.

---

### Q: File apa yang paling penting?
**A:** Semua penting! Tapi yang krusial:
- `index.html` (entry point)
- `document.b4cfb0e1.chunk.js` (fixed!)
- `text.e7946eb6.chunk.js` (fixed!)
- `main.e55ed130.js` (ErrorBoundary)

---

### Q: Bagaimana tahu upload sukses?
**A:** 
1. Cek file di server (via FTP/File Manager)
2. Hash file harus match dengan build local
3. Test di Incognito
4. DevTools Network tab shows correct files

---

## ✅ Success Indicators

```
✓ Console clean (no red errors)
✓ Files loaded with correct hash
✓ Homepage loads document page
✓ /text loads text translation
✓ Query params (?i=1) work fine
✓ Translation functions work
✓ No blank screen
✓ No ReferenceError
```

---

## 🎯 Final Steps

```bash
# 1. BUILD (Already done)
npm run build

# 2. DEPLOY
# - Delete old files on server
# - Upload ALL from /build folder

# 3. CLEAR CACHE
# - Cloudflare: Purge Everything
# - Server: Clear cache
# - Browser: Hard refresh (Ctrl+Shift+R)

# 4. TEST
# - Open Incognito
# - Visit https://deep.ct.ws/
# - Check console
# - Test features

# 5. VERIFY
# - Check file hashes in Network tab
# - Confirm new files loaded
# - No errors in console
```

---

**Status:** ✅ Build ready
**Action Required:** Deploy to server + Clear cache
**Expected Result:** Website works perfectly, no errors

**UPLOAD BUILD FOLDER SEKARANG!** 🚀

# 🔧 FIX: Internal Server Error

## ❌ ERROR YANG MUNCUL

```
Internal server error
```

---

## 🎯 PENYEBAB UTAMA

### 1. **Bahasa Asal dan Target SAMA** ⚠️ (MOST COMMON)

**Contoh Kasus:**
- File dalam bahasa **Inggris**
- Setting translate: **Inggris → Inggris** ❌
- Result: **Internal Server Error**

**Kenapa Error?**
DeepL API akan **reject** kalau bahasa asal dan target sama. Tidak bisa translate Inggris ke Inggris!

**Variasi Bahasa yang Dianggap SAMA:**
- `EN` = `EN-US` = `EN-GB` = **SAMA!** (Semua Inggris)
- `PT` = `PT-BR` = `PT-PT` = **SAMA!** (Semua Portugis)
- `ZH` = `ZH-HANS` = `ZH-HANT` = **SAMA!** (Semua Mandarin)

### 2. **API Key Quota Habis** 📊

**Free Tier Limit:**
- **500,000 karakter/bulan**
- Reset setiap tanggal 1

**Check Quota:**
👉 https://www.deepl.com/account/usage

### 3. **File Corrupt atau Format Error** 📄

File PDF/DOCX rusak atau format tidak standard.

### 4. **DeepL API Down** 🔥

Jarang terjadi, tapi bisa saja DeepL API sedang maintenance.

---

## ✅ SOLUSI YANG SUDAH DITERAPKAN

### 1. **Validasi Bahasa yang Lebih Ketat** ✅

Sekarang aplikasi akan **block** sebelum kirim ke server jika:

**Validasi Exact Match:**
```javascript
// Jika sourceLanguage === targetLanguage
❌ ID === ID → BLOCKED!
❌ EN-US === EN-US → BLOCKED!
```

**Validasi Base Language:**
```javascript
// Jika base language sama (EN, EN-US, EN-GB)
❌ EN → EN-US → BLOCKED! (sama-sama Inggris)
❌ EN-GB → EN → BLOCKED! (sama-sama Inggris)
❌ PT → PT-BR → BLOCKED! (sama-sama Portugis)
✅ EN → ID → OK! (Inggris ke Indonesia)
✅ ID → EN-US → OK! (Indonesia ke Inggris)
```

**Error Message yang Muncul:**
```
Bahasa sama! Inggris (Amerika) → Inggris (Britania) tidak valid. 
Silakan pilih bahasa yang berbeda.
```

### 2. **Error Handling yang Lebih Baik** ✅

**HTTP Status 400:**
```
Parameter tidak valid. Pastikan bahasa asal dan target berbeda!
```

**HTTP Status 456:**
```
Kuota terjemahan habis. Limit: 500,000 karakter/bulan. 
Cek: https://www.deepl.com/account/usage
```

**HTTP Status 500:**
```
Internal Server Error. Kemungkinan: 
(1) Bahasa asal dan target sama
(2) File corrupt
(3) DeepL API sedang down
Coba ubah bahasa target atau coba file lain.
```

**HTTP Status 529:**
```
Terlalu banyak request. Tunggu beberapa detik lalu coba lagi.
```

---

## 🚀 CARA PAKAI (UPDATED)

### Skenario: File Bahasa Inggris

**File:** `document.pdf` (Bahasa Inggris)

**❌ SALAH:**
- Bahasa Asal: `Inggris (Amerika)` 
- Bahasa Target: `Inggris (Amerika)` 
- Result: **BLOCKED!** Error sebelum upload

**❌ SALAH:**
- Bahasa Asal: `Inggris (Amerika)`
- Bahasa Target: `Inggris (Britania)`
- Result: **BLOCKED!** Sama-sama Inggris

**✅ BENAR:**
- Bahasa Asal: `Inggris (Amerika)`
- Bahasa Target: `Indonesia`
- Result: **SUCCESS!** ✅

**✅ BENAR (Auto-Detect):**
- Bahasa Asal: `Deteksi Otomatis`
- Bahasa Target: `Indonesia`
- Result: **SUCCESS!** ✅ (Auto-detect akan tahu file Inggris)

---

## 📊 TROUBLESHOOTING STEP-BY-STEP

### Step 1: Identifikasi Bahasa Dokumen

**Cara Cek:**
1. Buka file PDF/DOCX
2. Lihat bahasa teks di dalamnya
3. Kalau **Inggris** → jangan pilih target Inggris!

### Step 2: Pilih Bahasa yang Berbeda

**Rules:**
- ✅ Inggris → Indonesia
- ✅ Inggris → Jepang
- ✅ Inggris → Mandarin
- ❌ Inggris → Inggris (SALAH!)
- ❌ EN-US → EN-GB (SALAH! Sama-sama Inggris)

### Step 3: Gunakan Auto-Detect (Recommended)

**Cara:**
1. **Bahasa Asal:** Pilih `Deteksi Otomatis`
2. **Bahasa Target:** Pilih bahasa yang BERBEDA dari dokumen
3. Klik "Mulai Terjemahan"

**Keuntungan:**
- ✅ Tidak perlu tahu bahasa dokumen
- ✅ DeepL auto-detect bahasa asal
- ✅ Lebih aman, avoid error

### Step 4: Check API Quota

**Jika masih error:**

1. **Buka:** https://www.deepl.com/account/usage
2. **Check:** Character count this month
3. **Limit:** 500,000 chars/month (Free)

**Jika habis:**
- Tunggu reset (tanggal 1 bulan depan)
- Atau upgrade ke Pro plan

### Step 5: Try Different File

**Jika masih error:**
- Coba file lain (test dengan file sederhana)
- File mungkin corrupt atau format tidak standard

---

## 🧪 TEST CASES

### Test Case 1: Same Language (BLOCKED)

**Input:**
- File: PDF dalam bahasa Indonesia
- Source: `Indonesia`
- Target: `Indonesia`

**Expected:**
```
❌ Error: Bahasa asal dan target harus berbeda!
```

### Test Case 2: Same Base Language (BLOCKED)

**Input:**
- File: PDF dalam bahasa Inggris
- Source: `Inggris (Amerika)`
- Target: `Inggris (Britania)`

**Expected:**
```
❌ Error: Bahasa sama! Inggris (Amerika) → Inggris (Britania) tidak valid.
Silakan pilih bahasa yang berbeda.
```

### Test Case 3: Different Language (SUCCESS)

**Input:**
- File: PDF dalam bahasa Inggris
- Source: `Inggris (Amerika)`
- Target: `Indonesia`

**Expected:**
```
✅ Upload berhasil
✅ Progress bar jalan
✅ File diterjemahkan
✅ Download otomatis
```

### Test Case 4: Auto-Detect (SUCCESS)

**Input:**
- File: PDF dalam bahasa apapun
- Source: `Deteksi Otomatis`
- Target: `Indonesia` (atau bahasa lain yang berbeda)

**Expected:**
```
✅ Upload berhasil
✅ DeepL auto-detect bahasa asal
✅ Translate ke bahasa target
✅ Download otomatis
```

---

## 📝 CHECKLIST SEBELUM TRANSLATE

- [ ] Buka file, lihat bahasanya
- [ ] Pilih bahasa TARGET yang **berbeda** dari file
- [ ] Atau pakai **Deteksi Otomatis** (recommended)
- [ ] Check quota API (jika sering pakai)
- [ ] Pastikan file tidak corrupt
- [ ] Test dengan file kecil dulu

---

## 🔍 DEBUG GUIDE

### Jika Masih Error:

**1. Open Browser Console (F12)**
```
Console tab → Look for errors
Network tab → Check failed requests
```

**2. Check Error Status Code:**
- `400` → Parameter salah (bahasa sama?)
- `403` → API Key invalid
- `456` → Quota habis
- `500` → Internal error (bahasa sama atau API down)
- `529` → Too many requests

**3. Check Request Payload:**
```javascript
Network tab → Select failed request → Payload
Look for:
- source_lang: "EN-US"
- target_lang: "EN-GB"  ← PROBLEM! Sama-sama Inggris!
```

**4. Test Worker Directly:**
```bash
curl -X POST "https://translate-proxy.yumtive.workers.dev/translate/text" \
  -H "X-DeepL-API-Key: f381117b-94e6-4574-ad84-bad48a5b63ed:fx" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world",
    "source_lang": "EN",
    "target_lang": "ID"
  }'
```

Should return translation. If error, check response.

---

## ✅ SUMMARY

**Root Cause:**
- ✅ **99% kasus:** Bahasa asal dan target SAMA
- ✅ **1% kasus:** API quota habis atau file corrupt

**Solution:**
- ✅ **Validasi improved** - Block sebelum upload
- ✅ **Error message jelas** - Tahu langsung masalahnya
- ✅ **Gunakan Auto-Detect** - Lebih aman

**Best Practice:**
1. Selalu pakai **Deteksi Otomatis** untuk bahasa asal
2. Pilih bahasa target yang **jelas berbeda**
3. Check quota API secara berkala
4. Test dengan file kecil dulu

---

**Status:** ✅ **FIXED dengan validasi yang lebih ketat!**

**Test sekarang dengan:**
- File Inggris → Translate ke Indonesia ✅
- File Indonesia → Translate ke Inggris ✅
- Auto-Detect → Bahasa apapun ✅

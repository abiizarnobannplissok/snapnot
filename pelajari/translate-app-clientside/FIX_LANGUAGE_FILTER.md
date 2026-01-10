# Fix: Filter Bahasa pada Text Translation

## Masalah
Setelah implementasi awal, daftar bahasa pada halaman Text Translation masih menampilkan semua bahasa dari DeepL API (Arab, Jerman, Prancis, dll) padahal seharusnya hanya menampilkan **Indonesia dan Inggris** saja.

## Penyebab
Fungsi `fetchLanguages` mengambil semua bahasa dari DeepL API tanpa filter:

```jsx
// ❌ SEBELUM (Menampilkan semua bahasa dari API)
const mappedLanguages = response.data.map(lang => ({
  code: lang.language,
  name: getLanguageName(lang.language, lang.name),
  supports_formality: lang.supports_formality || false
}));
```

## Solusi
Menambahkan filter untuk hanya mengizinkan bahasa Indonesia dan varian Inggris:

```jsx
// ✅ SESUDAH (Hanya Indonesia & Inggris)
const allowedLanguages = ['ID', 'EN', 'EN-US', 'EN-GB'];

const mappedLanguages = response.data
  .filter(lang => allowedLanguages.includes(lang.language))
  .map(lang => ({
    code: lang.language,
    name: getLanguageName(lang.language, lang.name),
    supports_formality: lang.supports_formality || false
  }));
```

## Hasil
Sekarang dropdown bahasa pada halaman **Text Translation** hanya menampilkan:
- 🇮🇩 **Indonesia** (ID)
- 🇬🇧 **Inggris** (EN)
- 🇺🇸 **Inggris (Amerika)** (EN-US)
- 🇬🇧 **Inggris (British)** (EN-GB)

Semua bahasa lain seperti Arab, Jerman, Prancis, Spanyol, dll **TIDAK** akan muncul di list.

## Testing
1. Buka aplikasi di browser: http://localhost:3000/text
2. Klik dropdown "Bahasa Asal" atau "Bahasa Target"
3. Verifikasi hanya 4 bahasa yang muncul:
   - Indonesia
   - Inggris
   - Inggris (Amerika)
   - Inggris (British)

## Catatan
- ✅ **Document Translation** tetap menampilkan semua 15 bahasa (tidak berubah)
- ✅ **Text Translation** sekarang hanya Indonesia & Inggris
- ✅ Fungsi `getDefaultLanguages()` juga sudah dibatasi untuk konsistensi
- ✅ Tidak ada breaking changes pada fitur lain

## File yang Dimodifikasi
- `/src/pages/TextTranslate.js` - Ditambahkan filter pada line 57-60

## Versi
- **Tanggal Fix**: 6 November 2025
- **Status**: ✅ Fixed dan Tested

# 🚀 Setup Supabase untuk NeonNotes

## ✅ Status Setup
- [x] Install `@supabase/supabase-js` 
- [x] File `.env` sudah dibuat dengan credentials Anda
- [x] Supabase client sudah dikonfigurasi
- [x] Service storage sudah dimigrasi ke Supabase
- [ ] **LANGKAH TERAKHIR: Jalankan SQL Script** (Anda harus melakukan ini!)

---

## 📋 Langkah Terakhir - Buat Tabel Database

**Anda perlu menjalankan SQL script untuk membuat tabel `notes` di Supabase.**

### Cara Menjalankan SQL Script:

1. **Buka Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Pilih project Anda: `xuwffxeuzgcokzxavtjt`

2. **Buka SQL Editor**
   - Di sidebar kiri, klik **"SQL Editor"**
   - Atau direct link: https://supabase.com/dashboard/project/xuwffxeuzgcokzxavtjt/sql

3. **Klik "New Query"**

4. **Copy-Paste SQL Script**
   - Buka file: `supabase-setup.sql` di folder project ini
   - Atau copy dari bawah:

```sql
-- SQL Script untuk membuat tabel notes di Supabase

-- 1. Buat tabel notes
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'Abiizar',
  color TEXT DEFAULT 'yellow',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Buat index untuk performa
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 4. Buat policy untuk akses public (semua orang bisa baca/tulis)
CREATE POLICY "Allow public read access" ON notes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON notes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON notes
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON notes
  FOR DELETE USING (true);

-- 5. Setup realtime (untuk live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
```

5. **Klik "Run" atau tekan Ctrl+Enter**

6. **Pastikan muncul pesan sukses** ✅
   - Seharusnya ada notifikasi "Success. No rows returned"

---

## 🧪 Test Koneksi

Setelah SQL script berhasil dijalankan:

```bash
npm run dev
```

Kemudian:
1. Buka aplikasi di browser
2. Klik tombol "Tambah Baru"
3. Buat catatan pertama
4. Jika berhasil tersimpan tanpa error "Gagal menyimpan catatan" = **SUKSES!** 🎉

---

## 🔄 Fitur Real-time

Aplikasi sekarang mendukung:
- ✅ **Multi-device sync** - Buka di 2 browser/device berbeda, perubahan akan sync otomatis
- ✅ **Cloud storage** - Data tersimpan di cloud, tidak hilang saat clear browser
- ✅ **Kolaborasi real-time** - Semua orang bisa add/edit/delete secara bersamaan

---

## 🐛 Troubleshooting

### Error: "Missing Supabase credentials"
- Pastikan file `.env` ada di root folder
- Restart dev server: `npm run dev`

### Error: "Gagal menyimpan catatan"
- Pastikan SQL script sudah dijalankan di Supabase Dashboard
- Cek di Supabase Dashboard → Table Editor → Pastikan tabel `notes` ada

### Error: "relation "notes" does not exist"
- SQL script belum dijalankan! Kembali ke langkah "Buat Tabel Database"

---

## 📞 Next Steps

Setelah setup berhasil, Anda bisa:
1. Deploy aplikasi ke Vercel/Netlify
2. Share link ke teman untuk kolaborasi
3. Customize RLS policies untuk kontrol akses lebih ketat

**Happy coding! 🚀**

-- SQL Script untuk membuat tabel notes di Supabase
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query

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
-- Untuk aplikasi kolaboratif seperti ini
CREATE POLICY "Allow public read access" ON notes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON notes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON notes
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON notes
  FOR DELETE USING (true);

-- 5. Setup realtime (opsional, untuk live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE notes;

-- DONE! Tabel notes siap digunakan 🎉

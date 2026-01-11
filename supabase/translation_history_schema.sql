-- ===================================
-- TRANSLATION HISTORY SCHEMA
-- ===================================
-- Tabel untuk menyimpan riwayat terjemahan
-- Bisa diakses oleh semua orang (public read)
-- ===================================

-- 1. CREATE TABLE
CREATE TABLE IF NOT EXISTS translation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Translation metadata
  translation_type VARCHAR(20) NOT NULL CHECK (translation_type IN ('text', 'document')),
  source_lang VARCHAR(10) NOT NULL,
  target_lang VARCHAR(10) NOT NULL,
  
  -- Content (for text translation)
  source_text TEXT,
  translated_text TEXT,
  
  -- Document info (for document translation)
  document_name VARCHAR(255),
  document_size BIGINT,
  storage_path TEXT,
  
  translated_by VARCHAR(100) DEFAULT 'Anonymous',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE INDEX untuk performa query
CREATE INDEX idx_translation_history_created_at ON translation_history(created_at DESC);
CREATE INDEX idx_translation_history_type ON translation_history(translation_type);

-- 3. CREATE FUNCTION untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_translation_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CREATE TRIGGER untuk auto-update updated_at
CREATE TRIGGER trigger_update_translation_history_updated_at
  BEFORE UPDATE ON translation_history
  FOR EACH ROW
  EXECUTE FUNCTION update_translation_history_updated_at();

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE translation_history ENABLE ROW LEVEL SECURITY;

-- 6. CREATE RLS POLICIES
-- Policy: Semua orang bisa SELECT (read)
CREATE POLICY "Anyone can view translation history"
  ON translation_history
  FOR SELECT
  TO public
  USING (true);

-- Policy: Semua orang bisa INSERT (create)
CREATE POLICY "Anyone can create translation history"
  ON translation_history
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Semua orang bisa DELETE (hanya admin atau creator, tapi untuk simplicity kita buat public)
CREATE POLICY "Anyone can delete translation history"
  ON translation_history
  FOR DELETE
  TO public
  USING (true);

-- Policy: Semua orang bisa UPDATE (optional, untuk edit translator name)
CREATE POLICY "Anyone can update translation history"
  ON translation_history
  FOR UPDATE
  TO public
  USING (true);

-- ===================================
-- USEFUL QUERIES
-- ===================================

-- SELECT: Get all translation history (sorted by newest)
-- SELECT * FROM translation_history ORDER BY created_at DESC;

-- SELECT: Get text translations only
-- SELECT * FROM translation_history WHERE translation_type = 'text' ORDER BY created_at DESC;

-- SELECT: Get document translations only
-- SELECT * FROM translation_history WHERE translation_type = 'document' ORDER BY created_at DESC;

-- INSERT: Add text translation history
-- INSERT INTO translation_history (translation_type, source_lang, target_lang, source_text, translated_text, translated_by)
-- VALUES ('text', 'EN', 'ID', 'Hello World', 'Halo Dunia', 'Abiizar');

-- INSERT: Add document translation history
-- INSERT INTO translation_history (translation_type, source_lang, target_lang, document_name, document_size, translated_by)
-- VALUES ('document', 'EN', 'ID', 'document.pdf', 3215000, 'Abiizar');

-- DELETE: Remove translation history by ID
-- DELETE FROM translation_history WHERE id = 'your-uuid-here';

-- DELETE: Remove old history (older than 30 days)
-- DELETE FROM translation_history WHERE created_at < NOW() - INTERVAL '30 days';

-- COUNT: Get total translations
-- SELECT COUNT(*) as total_translations FROM translation_history;

-- COUNT: Get translations by type
-- SELECT translation_type, COUNT(*) as count FROM translation_history GROUP BY translation_type;

-- ===================================
-- CLEANUP (if you need to drop everything)
-- ===================================

-- DROP POLICY IF EXISTS "Anyone can view translation history" ON translation_history;
-- DROP POLICY IF EXISTS "Anyone can create translation history" ON translation_history;
-- DROP POLICY IF EXISTS "Anyone can delete translation history" ON translation_history;
-- DROP POLICY IF EXISTS "Anyone can update translation history" ON translation_history;
-- DROP TRIGGER IF EXISTS trigger_update_translation_history_updated_at ON translation_history;
-- DROP FUNCTION IF EXISTS update_translation_history_updated_at();
-- DROP INDEX IF EXISTS idx_translation_history_created_at;
-- DROP INDEX IF EXISTS idx_translation_history_type;
-- DROP TABLE IF EXISTS translation_history;

import { supabase } from '../lib/supabase';

export interface TranslationHistory {
  id: string;
  translationType: 'text' | 'document';
  sourceLang: string;
  targetLang: string;
  sourceText?: string;
  translatedText?: string;
  documentName?: string;
  documentSize?: number;
  translatedBy: string;
  createdAt: number;
  updatedAt: number;
}

interface TranslationHistoryDB {
  id: string;
  translation_type: 'text' | 'document';
  source_lang: string;
  target_lang: string;
  source_text?: string;
  translated_text?: string;
  document_name?: string;
  document_size?: number;
  translated_by: string;
  created_at: string;
  updated_at: string;
}

function mapFromDB(dbRecord: TranslationHistoryDB): TranslationHistory {
  return {
    id: dbRecord.id,
    translationType: dbRecord.translation_type,
    sourceLang: dbRecord.source_lang,
    targetLang: dbRecord.target_lang,
    sourceText: dbRecord.source_text,
    translatedText: dbRecord.translated_text,
    documentName: dbRecord.document_name,
    documentSize: dbRecord.document_size,
    translatedBy: dbRecord.translated_by,
    createdAt: new Date(dbRecord.created_at).getTime(),
    updatedAt: new Date(dbRecord.updated_at).getTime(),
  };
}

export async function createTextTranslationHistory(
  sourceLang: string,
  targetLang: string,
  sourceText: string,
  translatedText: string,
  translatedBy: string = 'Anonymous'
): Promise<TranslationHistory> {
  try {
    const { data, error } = await supabase
      .from('translation_history')
      .insert({
        translation_type: 'text',
        source_lang: sourceLang,
        target_lang: targetLang,
        source_text: sourceText,
        translated_text: translatedText,
        translated_by: translatedBy,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Create text translation history error:', error);
      
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        throw new Error('Table translation_history belum dibuat. Jalankan SQL script di Supabase SQL Editor terlebih dahulu.');
      }
      
      if (error.message.includes('row-level security')) {
        throw new Error('RLS policy untuk translation_history belum diset. Jalankan SQL script lengkap di Supabase SQL Editor.');
      }
      
      throw new Error(`Gagal menyimpan history: ${error.message}`);
    }

    console.log('✅ Text translation history saved:', data.id);
    return mapFromDB(data);
  } catch (error) {
    console.error('Create text translation history error:', error);
    throw error;
  }
}

export async function createDocumentTranslationHistory(
  sourceLang: string,
  targetLang: string,
  documentName: string,
  documentSize: number,
  translatedBy: string = 'Anonymous'
): Promise<TranslationHistory> {
  try {
    const { data, error } = await supabase
      .from('translation_history')
      .insert({
        translation_type: 'document',
        source_lang: sourceLang,
        target_lang: targetLang,
        document_name: documentName,
        document_size: documentSize,
        translated_by: translatedBy,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Create document translation history error:', error);
      
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        throw new Error('Table translation_history belum dibuat. Jalankan SQL script di Supabase SQL Editor terlebih dahulu.');
      }
      
      if (error.message.includes('row-level security')) {
        throw new Error('RLS policy untuk translation_history belum diset. Jalankan SQL script lengkap di Supabase SQL Editor.');
      }
      
      throw new Error(`Gagal menyimpan history: ${error.message}`);
    }

    console.log('✅ Document translation history saved:', data.id);
    return mapFromDB(data);
  } catch (error) {
    console.error('Create document translation history error:', error);
    throw error;
  }
}

export async function getTranslationHistory(): Promise<TranslationHistory[]> {
  try {
    const { data, error } = await supabase
      .from('translation_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Get translation history error:', error);
      throw error;
    }

    return data.map(mapFromDB);
  } catch (error) {
    console.error('Get translation history error:', error);
    return [];
  }
}

export async function deleteTranslationHistory(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('translation_history')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Delete translation history error:', error);
      throw new Error('Gagal menghapus history');
    }

    console.log('✅ Translation history deleted:', id);
  } catch (error) {
    console.error('Delete translation history error:', error);
    throw error;
  }
}

export function subscribeToTranslationHistory(callback: () => void): () => void {
  const channel = supabase
    .channel('translation_history_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'translation_history',
      },
      () => {
        callback();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

import { Note } from '../types';
import { supabase } from '../lib/supabase';

// Database table mapping
interface DbNote {
  id: string;
  title: string;
  content: string;
  author: string;
  color: string;
  created_at: string;
  updated_at: string;
}

// Convert DB format to App format
const dbToNote = (dbNote: DbNote): Note => ({
  id: dbNote.id,
  title: dbNote.title,
  content: dbNote.content,
  author: dbNote.author,
  color: dbNote.color as any,
  createdAt: new Date(dbNote.created_at).getTime(),
  updatedAt: new Date(dbNote.updated_at).getTime(),
});

// Convert App format to DB format
const noteToDb = (note: Note) => ({
  id: note.id,
  title: note.title,
  content: note.content,
  author: note.author,
  color: note.color,
  created_at: new Date(note.createdAt).toISOString(),
  updated_at: new Date(note.updatedAt).toISOString(),
});

export const getNotes = async (): Promise<Note[]> => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(dbToNote);
  } catch (error) {
    console.error('Error reading from Supabase', error);
    return [];
  }
};

export const saveNote = async (note: Note): Promise<void> => {
  console.log('🚀 [SUPABASE] Starting save note process...', note.title);
  try {
    const dbNote = noteToDb(note);
    console.log('🚀 [SUPABASE] Converted to DB format:', dbNote);

    // Check if note exists
    console.log('🚀 [SUPABASE] Checking if note exists...');
    const { data: existing } = await supabase
      .from('notes')
      .select('id')
      .eq('id', note.id)
      .single();

    if (existing) {
      // Update existing note
      console.log('🚀 [SUPABASE] Updating existing note...');
      const { error } = await supabase
        .from('notes')
        .update(dbNote)
        .eq('id', note.id);

      if (error) {
        console.error('❌ [SUPABASE] Update error:', error);
        throw error;
      }
      console.log('✅ [SUPABASE] Note updated successfully!');
    } else {
      // Insert new note
      console.log('🚀 [SUPABASE] Inserting new note...');
      const { error } = await supabase
        .from('notes')
        .insert([dbNote]);

      if (error) {
        console.error('❌ [SUPABASE] Insert error:', error);
        throw error;
      }
      console.log('✅ [SUPABASE] Note inserted successfully!');
    }
  } catch (error) {
    console.error('❌ [SUPABASE] Error saving note:', error);
    throw error;
  }
};

export const deleteNote = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting from Supabase', error);
    throw error;
  }
};

export const deleteMultipleNotes = async (ids: string[]): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .in('id', ids);

    if (error) throw error;
  } catch (error) {
    console.error('Error bulk deleting from Supabase', error);
    throw error;
  }
};

export const subscribeToChanges = (callback: () => void) => {
  // Subscribe to realtime changes
  const channel = supabase
    .channel('notes-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'notes' },
      () => {
        callback();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

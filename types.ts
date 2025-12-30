export type NoteColor = 'yellow' | 'blue' | 'white' | 'purple' | 'green' | 'pink' | 'orange' | 'mint' | 'lavender' | 'coral';

export interface Note {
  id: string;
  title: string;
  content: string;
  author: string;
  color: NoteColor;
  createdAt: number;
  updatedAt: number;
}

export interface NoteFormData {
  title: string;
  content: string;
  author: string;
  color: NoteColor;
}

export type SortOption = 'newest' | 'oldest' | 'az';

import React, { useState, useCallback, memo } from 'react';
import { Edit2, Copy, Trash2, Clock, User, Check } from 'lucide-react';
import { Note } from '../types';
import { COLORS } from '../constants';
import TiltedCard from './TiltedCard';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onCopy: (note: Note) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

const NoteCardComponent: React.FC<NoteCardProps> = ({ 
  note, 
  onEdit, 
  onDelete, 
  onCopy,
  selectionMode = false,
  isSelected = false,
  onToggleSelect
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const colorStyle = COLORS[note.color] || COLORS.yellow;
  const isNew = Date.now() - note.createdAt < 5 * 60 * 1000;

  const formatDate = useCallback((timestamp: number) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (isDeleting) {
      onDelete(note.id);
    } else {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 3000);
    }
  }, [isDeleting, onDelete, note.id]);

  const handleCardClick = useCallback(() => {
    if (selectionMode && onToggleSelect) {
      onToggleSelect();
    }
  }, [selectionMode, onToggleSelect]);

  const handleCopyClick = useCallback(() => {
    onCopy(note);
  }, [onCopy, note]);

  const handleEditClick = useCallback(() => {
    onEdit(note);
  }, [onEdit, note]);

  const handleToggleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect?.();
  }, [onToggleSelect]);

  const cardContent = (
    <div 
      onClick={handleCardClick}
      className={`
        group relative p-6 rounded-3xl border shadow-soft hover:shadow-hover flex flex-col h-full min-h-[220px]
        ${selectionMode ? 'cursor-pointer' : 'transition-all duration-300'}
        ${selectionMode && isSelected ? 'ring-4 ring-red-500/50' : ''}
      `}
      style={{ 
        backgroundColor: colorStyle.hex,
        borderColor: colorStyle.hex === '#FFFFFF' ? '#E5E7EB' : colorStyle.hex
      }}
    >
    {selectionMode && (
      <button
        onClick={handleToggleClick}
        className={`
          absolute top-3 right-3 w-6 h-6 rounded-full border-2 
          flex items-center justify-center z-10
          ${isSelected 
            ? 'bg-red-500 border-red-500 shadow-lg' 
            : 'bg-white border-gray-300 shadow-md hover:border-gray-400'
          }
        `}
        aria-label={isSelected ? 'Batalkan pilihan' : 'Pilih catatan'}
      >
        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
      </button>
    )}

    {isNew && !selectionMode && (
      <span className="absolute -top-3 -right-3 bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md animate-bounce">
        BARU!
      </span>
    )}

    <div className="flex justify-between items-start mb-4">
      <h3 className="text-lg font-bold text-black leading-tight line-clamp-2 w-full pr-2">
        {note.title}
      </h3>
    </div>

    <div className="flex-grow mb-6">
      <p className="text-text-primary/80 text-base leading-relaxed whitespace-pre-line line-clamp-4 font-normal">
        {note.content}
      </p>
    </div>

    <div className="mt-auto border-t border-black/5 pt-4">
      <div className="flex items-center justify-between text-xs text-text-secondary/80 font-medium mb-3">
        <div className="flex items-center gap-1.5" title="Terakhir diedit">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDate(note.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          <span className="truncate max-w-[100px]">{note.author}</span>
        </div>
      </div>

      {!selectionMode && (
        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
         <button
          onClick={handleCopyClick}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-black transition-transform hover:scale-110 shadow-sm"
          title="Salin isi ke clipboard"
        >
          <Copy className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleEditClick}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-black transition-transform hover:scale-110 shadow-sm"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleDeleteConfirm}
          className={`
            h-9 flex items-center justify-center rounded-full transition-all duration-300 shadow-sm
            ${isDeleting ? 'w-24 bg-red-500 text-white' : 'w-9 bg-white/80 hover:bg-white text-red-500 hover:scale-110'}
          `}
          title={isDeleting ? 'Klik lagi untuk hapus' : 'Hapus'}
        >
          {isDeleting ? (
            <span className="text-xs font-bold">Yakin?</span>
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
        </div>
      )}
    </div>
    </div>
  );

  if (selectionMode) {
    return cardContent;
  }

  return (
    <TiltedCard scaleOnHover={1.05} rotateAmplitude={10}>
      {cardContent}
    </TiltedCard>
  );
};

export const NoteCard = memo(NoteCardComponent);
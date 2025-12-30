import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Note, NoteFormData, NoteColor } from '../types';
import { COLORS, COLOR_OPTIONS } from '../constants';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NoteFormData) => void;
  initialData?: Note;
}

export const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: '',
    author: '',
    color: 'yellow',
  });
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content,
        author: initialData.author,
        color: initialData.color,
      });
    } else {
      setFormData({
        title: '',
        content: '',
        author: '',
        color: 'yellow',
      });
    }
  }, [initialData, isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 [MODAL] Form submitted with data:', formData);
    
    if (!formData.title.trim() || !formData.content.trim()) {
      console.warn('⚠️ [MODAL] Form validation failed - empty title or content');
      return;
    }
    
    console.log('📝 [MODAL] Calling onSave...');
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div 
        className={`
          relative w-full max-w-lg bg-white rounded-t-[32px] md:rounded-[32px] p-6 md:p-8 
          shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar
          transform transition-transform duration-300 ease-out
          ${isClosing ? 'translate-y-full md:translate-y-10 md:opacity-0' : 'translate-y-0 opacity-100'}
        `}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {initialData ? 'Edit Catatan' : 'Buat Catatan'}
          </h2>
          <button 
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Color Picker */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-3">
              Pilih Warna - <span className="text-black font-bold">{COLORS[formData.color]?.label || 'Neon'}</span>
            </label>
            <div className="grid grid-cols-5 gap-3">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className="relative w-full aspect-square rounded-2xl border-3 flex items-center justify-center transition-all hover:scale-105 hover:shadow-md active:scale-95"
                  style={{
                    backgroundColor: COLORS[color].hex,
                    borderWidth: '3px',
                    borderColor: formData.color === color ? '#000000' : (color === 'white' ? '#E5E7EB' : COLORS[color].hex),
                    boxShadow: formData.color === color ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                  }}
                  title={COLORS[color].label}
                >
                  {formData.color === color && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-7 h-7 bg-black/80 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  <span className="absolute bottom-1 text-[9px] font-bold text-black/70">
                    {COLORS[color].label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Judul Catatan..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-xl font-bold placeholder:text-gray-300 border-b border-gray-100 pb-2 focus:border-black focus:outline-none transition-colors"
                autoFocus
                required
              />
            </div>

            <div>
              <textarea
                placeholder="Tulis sesuatu..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full min-h-[150px] resize-none text-base leading-relaxed placeholder:text-gray-300 focus:outline-none"
                required
              />
            </div>

            <div>
               <label className="block text-xs font-semibold text-text-secondary mb-1">Nama Penulis (Opsional)</label>
               <input
                type="text"
                placeholder="Abiizar"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full bg-gray-50 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 rounded-[20px] font-semibold border border-gray-200 hover:bg-gray-50 text-text-secondary transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || !formData.content.trim()}
              className="flex-1 px-6 py-3 rounded-[20px] font-semibold bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

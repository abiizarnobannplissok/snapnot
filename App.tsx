import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Plus, Search, Layers, StickyNote, FileUp, Languages, Trash2 } from 'lucide-react';
import { Note, NoteFormData, SortOption } from './types';
import { getNotes, saveNote, deleteNote as deleteNoteService, deleteMultipleNotes, subscribeToChanges } from './services/storage';
import { NoteCard } from './components/NoteCard';
import { NoteModal } from './components/NoteModal';
import { SortDropdown } from './components/SortDropdown';
import { Toast } from './components/Toast';
import { FileShare } from './components/FileShare';
import { Translator } from './components/Translator';
import { InstallPWA } from './components/InstallPWA';
import { FloatingTabNav } from './components/FloatingTabNav';
import { ConfirmDialog } from './components/ConfirmDialog';
import { generateUUID } from './utils/uuid';
import { useDebounce } from './hooks/useDebounce';
import { useSwipeGesture } from './hooks/useSwipeGesture';

type TabType = 'notes' | 'files' | 'translator';

// Tab order for swipe navigation
const TAB_ORDER: TabType[] = ['notes', 'files', 'translator'];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('notes');
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  
  // Debounce search queries untuk performa lebih baik
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedFileSearchQuery = useDebounce(fileSearchQuery, 300);
  const [externalFiles, setExternalFiles] = useState<File[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  
  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Note Selection Mode State (untuk fitur Pilih Catatan & Hapus Massal)
  const [noteSelectionMode, setNoteSelectionMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Swipe Navigation Handlers
  const handleSwipeLeft = useCallback(() => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    if (currentIndex < TAB_ORDER.length - 1) {
      const nextTab = TAB_ORDER[currentIndex + 1];
      setActiveTab(nextTab);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]);

  const handleSwipeRight = useCallback(() => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    if (currentIndex > 0) {
      const prevTab = TAB_ORDER[currentIndex - 1];
      setActiveTab(prevTab);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]);

  // Setup swipe gesture on main container
  useSwipeGesture(mainContainerRef, {
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    minSwipeDistance: 50,
    maxSwipeTime: 500,
  });

  // Initial Load & Subscription
  useEffect(() => {
    const loadNotes = async () => {
      const data = await getNotes();
      setNotes(data);
    };

    loadNotes();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToChanges(loadNotes);
    return () => unsubscribe();
  }, []);

  // Filter and Sort Logic - dengan debounced search
  const filteredNotes = useMemo(() => {
    let result = notes.filter((note) => {
      const query = debouncedSearchQuery.toLowerCase().trim();
      if (!query) return true;
      
      return (
        (note.title && note.title.toLowerCase().includes(query)) ||
        (note.content && note.content.toLowerCase().includes(query)) ||
        (note.author && note.author.toLowerCase().includes(query))
      );
    });

    return result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'az':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [notes, debouncedSearchQuery, sortBy]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Handlers
  const handleSaveNote = async (data: NoteFormData) => {
    try {
      const now = Date.now();
      const newNote: Note = {
        id: editingNote ? editingNote.id : generateUUID(),
        title: data.title,
        content: data.content,
        author: data.author || 'Abiizar',
        color: data.color,
        createdAt: editingNote ? editingNote.createdAt : now,
        updatedAt: now,
      };
      
      await saveNote(newNote);
      const updatedNotes = await getNotes();
      setNotes(updatedNotes);
      setIsModalOpen(false);
      setEditingNote(undefined);
      showToast(editingNote ? 'Catatan berhasil diperbarui' : 'Catatan baru berhasil dibuat', 'success');
    } catch (error) {
      showToast('Gagal menyimpan catatan: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
    }
  };

  const handleDeleteNote = useCallback(async (id: string) => {
    try {
      await deleteNoteService(id);
      const updatedNotes = await getNotes();
      setNotes(updatedNotes);
      showToast('Catatan berhasil dihapus', 'success');
    } catch (error) {
      showToast('Gagal menghapus catatan', 'error');
    }
  }, [showToast]);

  const handleEditClick = useCallback((note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  }, []);

  const handleCopyContent = useCallback(async (note: Note) => {
    try {
      if (!note.content) return;
      
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(note.content);
        showToast('Isi catatan disalin ke clipboard', 'success');
      } else {
        // Fallback for non-HTTPS or older browsers
        const textArea = document.createElement('textarea');
        textArea.value = note.content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          showToast('Isi catatan disalin ke clipboard', 'success');
        } catch (err) {
          showToast('Gagal menyalin ke clipboard', 'error');
        }
        document.body.removeChild(textArea);
      }
    } catch (error) {
      showToast('Gagal menyalin ke clipboard', 'error');
    }
  }, [showToast]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingNote(undefined);
  }, []);

  // Note Selection Mode Handlers
  const toggleNoteSelectionMode = useCallback(() => {
    setNoteSelectionMode(prev => !prev);
    setSelectedNotes(new Set());
  }, []);

  const toggleNoteSelection = useCallback((noteId: string) => {
    setSelectedNotes(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(noteId)) {
        newSelected.delete(noteId);
      } else {
        newSelected.add(noteId);
      }
      return newSelected;
    });
  }, []);

  const handleDeleteSelectedNotes = useCallback(() => {
    if (selectedNotes.size === 0) return;
    setBulkDeleteConfirm(true);
  }, [selectedNotes.size]);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (selectedNotes.size === 0) return;
    
    try {
      await deleteMultipleNotes(Array.from(selectedNotes));
      
      const updatedNotes = await getNotes();
      setNotes(updatedNotes);
      
      showToast(`${selectedNotes.size} catatan berhasil dihapus`, 'success');
      setSelectedNotes(new Set());
      setNoteSelectionMode(false);
    } catch (error) {
      showToast('Gagal menghapus catatan', 'error');
    } finally {
      setBulkDeleteConfirm(false);
    }
  }, [selectedNotes, showToast]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setExternalFiles(files);
      // Scroll to upload area
      setTimeout(() => {
        const uploadArea = document.querySelector('.upload-area-scroll-target');
        uploadArea?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div ref={mainContainerRef} className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#F5F5F5]/90 backdrop-blur-md border-b border-border py-6 px-4 md:px-12">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between md:gap-8 gap-4">
              {/* Left Side: Logo + Tabs */}
              <div className="flex items-center justify-between gap-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  {/* Logo */}
                  <div className="flex items-center gap-3">
                    <div>
                      <h1 className="text-2xl md:text-[32px] font-bold tracking-tight">SnapNotes</h1>
                      <p className="text-sm text-text-secondary mt-1 whitespace-nowrap">Notes File Sharing and Translate</p>
                    </div>
                    {activeTab === 'notes' && (
                      <div className="bg-white px-4 py-2 rounded-[20px] shadow-sm border border-gray-100 md:hidden flex flex-col items-end">
                        <span className="font-bold text-lg">{notes.length}</span>
                        {filteredNotes.length !== notes.length && (
                          <span className="text-[10px] text-text-secondary">Tampil {filteredNotes.length}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {activeTab === 'notes' && (
                  <button
                    onClick={toggleNoteSelectionMode}
                    className={`md:hidden h-10 px-4 font-bold rounded-xl transition-all active:scale-95 shadow-sm whitespace-nowrap flex-shrink-0 ${
                      noteSelectionMode 
                        ? 'bg-gray-200 text-gray-700' 
                        : 'bg-primary text-black'
                    }`}
                  >
                    {noteSelectionMode ? 'Batal' : 'Pilih'}
                  </button>
                )}

                {/* Navigation Tabs - Next to Logo */}
                <div className="hidden md:flex gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`
                      h-10 flex items-center gap-2 px-5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                      ${activeTab === 'notes'
                        ? 'bg-black text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <StickyNote className="w-4 h-4" />
                    <span>Catatan</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('files')}
                    className={`
                      h-10 flex items-center gap-2 px-5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                      ${activeTab === 'files'
                        ? 'bg-black text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <FileUp className="w-4 h-4" />
                    <span>File Share</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('translator')}
                    className={`
                      h-10 flex items-center gap-2 px-5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                      ${activeTab === 'translator'
                        ? 'bg-black text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Languages className="w-4 h-4" />
                    <span>Translator</span>
                  </button>
                </div>
              </div>

              {/* Right Side: Actions */}
              <div className="flex gap-3 flex-1 md:justify-end items-center">
                {activeTab === 'notes' ? (
                  <>
                    <div className="relative group w-full md:w-[260px]">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5 group-focus-within:text-black transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Cari catatan..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-[48px] pl-12 pr-4 rounded-[20px] bg-white border border-transparent focus:border-black focus:outline-none shadow-soft transition-all placeholder:text-gray-400"
                      />
                    </div>

                    <SortDropdown 
                      value={sortBy}
                      onChange={setSortBy}
                    />

                    <button 
                      onClick={() => { setEditingNote(undefined); setIsModalOpen(true); }}
                      className="hidden md:inline-flex h-[48px] items-center justify-center gap-2 bg-primary px-6 rounded-[20px] font-bold text-black hover:scale-105 active:scale-95 transition-transform shadow-[0_4px_12px_rgba(212,255,0,0.4)] whitespace-nowrap flex-shrink-0"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Tambah Baru</span>
                    </button>
                  </>
                ) : activeTab === 'files' ? (
                  <>
                    <div className="relative group w-full md:max-w-[295px]">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5 group-focus-within:text-black transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Cari file atau grup..." 
                        value={fileSearchQuery}
                        onChange={(e) => setFileSearchQuery(e.target.value)}
                        className="w-full h-[48px] pl-12 pr-4 rounded-[20px] bg-white border border-transparent focus:border-black focus:outline-none shadow-soft transition-all placeholder:text-gray-400"
                      />
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="hidden md:inline-flex h-[48px] items-center justify-center gap-2 bg-primary px-6 rounded-[20px] font-bold text-black hover:scale-105 active:scale-95 transition-transform shadow-[0_4px_12px_rgba(212,255,0,0.4)] whitespace-nowrap flex-shrink-0"
                    >
                      <FileUp className="w-5 h-5" />
                      <span>Upload File</span>
                    </button>
                  </>
                ) : activeTab === 'translator' ? (
                  <>
                    <div className="relative group w-full md:max-w-[295px] flex-shrink-0">
                      <Languages className="absolute left-4 top-1/2 -translate-y-1/2 text-[#95E1D3] w-5 h-5" />
                      <div className="w-full h-[48px] pl-12 pr-4 rounded-[20px] bg-white border border-transparent shadow-soft flex items-center">
                        <span className="font-semibold text-gray-700">AI Translate</span>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            {/* Mobile Tabs - Below on Mobile */}
            <div className="flex md:hidden gap-1 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
              <button
                onClick={() => setActiveTab('notes')}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all flex-1 justify-center
                  ${activeTab === 'notes'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <StickyNote className="w-5 h-5" />
                <span>Notes</span>
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all flex-1 justify-center
                  ${activeTab === 'files'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <FileUp className="w-5 h-5" />
                <span>Files</span>
              </button>
              <button
                onClick={() => setActiveTab('translator')}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all flex-1 justify-center
                  ${activeTab === 'translator'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <Languages className="w-5 h-5" />
                <span>Translate</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Action Button for Mobile - Only for Notes Tab (hidden in selection mode) */}
      {activeTab === 'notes' && !noteSelectionMode && (
        <button 
          onClick={() => { setEditingNote(undefined); setIsModalOpen(true); }}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex items-center justify-center z-40 active:scale-90 transition-transform"
        >
          <Plus className="w-7 h-7 text-black" />
        </button>
      )}

      {/* Main Content */}
      {activeTab === 'notes' ? (
        <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        
        {/* Desktop Counter + Selection Button */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-text-secondary">
            <Layers className="w-4 h-4" />
            <span className="font-medium text-sm">
              Total {notes.length} catatan tersimpan
              {filteredNotes.length !== notes.length && (
                <span className="ml-1 text-black font-semibold">(Menampilkan {filteredNotes.length} hasil)</span>
              )}
              {noteSelectionMode && selectedNotes.size > 0 && (
                <span className="ml-2 text-red-500 font-semibold">• {selectedNotes.size} dipilih</span>
              )}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {noteSelectionMode && selectedNotes.size > 0 && (
              <button
                onClick={handleDeleteSelectedNotes}
                className="h-10 px-5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Hapus ({selectedNotes.size})
              </button>
            )}
            <button
              onClick={toggleNoteSelectionMode}
              className={`h-10 px-5 font-bold rounded-xl transition-all active:scale-95 shadow-sm ${
                noteSelectionMode 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : 'bg-primary text-black hover:bg-primary/80'
              }`}
            >
              {noteSelectionMode ? 'Batal' : 'Pilih Catatan'}
            </button>
          </div>
        </div>

        {noteSelectionMode && (
          <div className="md:hidden flex items-center justify-between mb-4 px-2">
            <span className={`text-sm font-medium ${selectedNotes.size > 0 ? 'text-red-500' : 'text-text-secondary'}`}>
              {selectedNotes.size > 0 ? `${selectedNotes.size} dipilih` : 'Pilih catatan untuk dihapus'}
            </span>
            {selectedNotes.size > 0 && (
              <button
                onClick={handleDeleteSelectedNotes}
                className="h-9 px-4 bg-red-500 text-white font-bold rounded-xl active:scale-95 transition-all flex items-center gap-2 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Hapus ({selectedNotes.size})
              </button>
            )}
          </div>
        )}

        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-soft">
              <span className="text-4xl">📝</span>
            </div>
            <h3 className="text-xl font-bold mb-2">
              {notes.length > 0 ? 'Tidak ditemukan' : 'Belum ada catatan'}
            </h3>
            <p className="text-text-secondary max-w-md mb-8">
              {notes.length > 0 
                ? 'Coba gunakan kata kunci lain atau hapus pencarian.' 
                : 'Mulai buat catatan pertamamu dan bagikan ide dengan orang lain!'}
            </p>
            {notes.length === 0 && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-black text-white px-8 py-3 rounded-[20px] font-medium hover:bg-gray-800 transition-colors"
              >
                Buat Catatan Pertama
              </button>
            )}
            {notes.length > 0 && searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-black font-semibold hover:underline"
              >
                Hapus Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditClick}
                onDelete={handleDeleteNote}
                onCopy={handleCopyContent}
                selectionMode={noteSelectionMode}
                isSelected={selectedNotes.has(note.id)}
                onToggleSelect={() => toggleNoteSelection(note.id)}
              />
            ))}
          </div>
        )}
        </main>
      ) : activeTab === 'files' ? (
        <FileShare 
          searchQuery={debouncedFileSearchQuery} 
          externalFiles={externalFiles}
          onExternalFilesProcessed={() => setExternalFiles([])}
        />
      ) : (
        <Translator 
          onShowToast={showToast}
        />
      )}

      {/* Modal - Only for Notes Tab */}
      {activeTab === 'notes' && isModalOpen && (
        <NoteModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveNote}
          initialData={editingNote}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        title={`Hapus ${selectedNotes.size} catatan?`}
        message="Semua catatan yang dipilih akan dihapus permanen dan tidak dapat dikembalikan."
        confirmText="Hapus Semua"
        cancelText="Batal"
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />

      {/* PWA Install Prompt */}
      <InstallPWA />

      {/* Floating Tab Navigation - Mobile Only - Hidden when modal is open */}
      <FloatingTabNav 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isHidden={isModalOpen}
      />
    </div>
  );
}
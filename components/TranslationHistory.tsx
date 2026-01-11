import React, { useState, useEffect } from 'react';
import { Clock, Trash2, FileText, Download, Languages, Globe } from 'lucide-react';
import {
  TranslationHistory,
  getTranslationHistory,
  deleteTranslationHistory,
  subscribeToTranslationHistory,
  getTranslatedDocumentUrl,
} from '../services/translationHistoryService';
import { ConfirmDialog } from './ConfirmDialog';
import { Toast } from './Toast';

interface TranslationHistoryProps {
  searchQuery: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
  EN: 'English',
  ID: 'Indonesia',
  JA: '日本語',
  ZH: '中文',
  KO: '한국어',
  ES: 'Español',
  FR: 'Français',
  DE: 'Deutsch',
  PT: 'Português',
  RU: 'Русский',
  AR: 'العربية',
  IT: 'Italiano',
  NL: 'Nederlands',
  PL: 'Polski',
  TR: 'Türkçe',
};

const CARD_COLORS = [
  { bg: '#FEF3C7', border: '#FDE047', text: '#92400E' },
  { bg: '#DBEAFE', border: '#93C5FD', text: '#1E3A8A' },
  { bg: '#FCE7F3', border: '#F9A8D4', text: '#831843' },
  { bg: '#D1FAE5', border: '#6EE7B7', text: '#065F46' },
  { bg: '#E0E7FF', border: '#A5B4FC', text: '#3730A3' },
  { bg: '#FFE4E6', border: '#FDA4AF', text: '#881337' },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} hari yang lalu`;
  if (hours > 0) return `${hours} jam yang lalu`;
  if (minutes > 0) return `${minutes} menit yang lalu`;
  return 'Baru saja';
}

export function TranslationHistoryView({ searchQuery }: TranslationHistoryProps) {
  const [history, setHistory] = useState<TranslationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadHistory();

    const unsubscribe = subscribeToTranslationHistory(loadHistory);
    return () => unsubscribe();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getTranslationHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load translation history:', error);
      showToast('Gagal memuat history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      await deleteTranslationHistory(deleteConfirm.id);
      showToast('History berhasil dihapus', 'success');
      setDeleteConfirm({ isOpen: false, id: null });
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Gagal menghapus history', 'error');
    }
  };

  const handleDownload = async (item: TranslationHistory) => {
    if (!item.storagePath || !item.documentName) {
      showToast('File tidak tersedia untuk didownload', 'error');
      return;
    }

    try {
      showToast('📥 Mengunduh dokumen...', 'success');
      
      const publicUrl = getTranslatedDocumentUrl(item.storagePath);
      
      const response = await fetch(publicUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = item.documentName.replace(/\.(pdf|docx|doc)$/i, `_${item.targetLang.toLowerCase()}.$1`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast('✓ Download selesai!', 'success');
    } catch (error) {
      console.error('Download error:', error);
      showToast('Gagal mendownload file', 'error');
    }
  };

  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const langFrom = LANGUAGE_NAMES[item.sourceLang]?.toLowerCase() || item.sourceLang.toLowerCase();
    const langTo = LANGUAGE_NAMES[item.targetLang]?.toLowerCase() || item.targetLang.toLowerCase();
    
    return (
      langFrom.includes(query) ||
      langTo.includes(query) ||
      item.translatedBy.toLowerCase().includes(query) ||
      item.documentName?.toLowerCase().includes(query) ||
      item.sourceText?.toLowerCase().includes(query) ||
      item.translatedText?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span>Memuat history...</span>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-10 h-10 text-gray-600" />
        </div>
        <h3 className="text-xl font-medium text-gray-300 mb-2">Belum Ada History</h3>
        <p className="text-gray-500 max-w-md">
          Riwayat terjemahan kamu akan muncul di sini setelah kamu melakukan terjemahan dokumen.
        </p>
      </div>
    );
  }

  if (filteredHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
          <Globe className="w-10 h-10 text-gray-600" />
        </div>
        <h3 className="text-xl font-medium text-gray-300 mb-2">Tidak Ada Hasil</h3>
        <p className="text-gray-500 max-w-md">
          Tidak ada history yang cocok dengan pencarian "{searchQuery}"
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredHistory.map((item, index) => {
          const color = CARD_COLORS[index % CARD_COLORS.length];
          
          return (
            <div
              key={item.id}
              className="rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group relative overflow-hidden"
              style={{
                backgroundColor: color.bg,
                borderLeft: `4px solid ${color.border}`,
              }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="w-4 h-4 flex-shrink-0" style={{ color: color.text }} />
                    <span className="text-xs font-medium truncate" style={{ color: color.text }}>
                      {item.translatedBy}
                    </span>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: true, id: item.id })}
                    className="flex-shrink-0 p-1.5 hover:bg-black/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Hapus history"
                    style={{ color: color.text }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-white/60 rounded-md text-xs font-medium" style={{ color: color.text }}>
                    <span>{LANGUAGE_NAMES[item.sourceLang] || item.sourceLang}</span>
                  </div>
                  <Languages className="w-3.5 h-3.5 flex-shrink-0" style={{ color: color.text }} />
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-white/60 rounded-md text-xs font-medium" style={{ color: color.text }}>
                    <span>{LANGUAGE_NAMES[item.targetLang] || item.targetLang}</span>
                  </div>
                </div>

                {item.documentName && (
                  <div className="bg-white/60 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium truncate mb-1" style={{ color: color.text }}>
                      {item.documentName}
                    </p>
                    {item.documentSize && (
                      <p className="text-xs opacity-70" style={{ color: color.text }}>
                        {formatBytes(item.documentSize)}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs opacity-70" style={{ color: color.text }}>
                    <Clock className="w-3 h-3" />
                    <span>{formatRelativeTime(item.createdAt)}</span>
                  </div>
                  
                  {item.storagePath && (
                    <button
                      onClick={() => handleDownload(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 hover:bg-white rounded-lg transition-colors text-xs font-medium"
                      style={{ color: color.text }}
                      title="Download dokumen"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Hapus History?"
        message="History ini akan dihapus secara permanen dan tidak bisa dikembalikan."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
      />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}

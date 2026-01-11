import React, { useState, useEffect } from 'react';
import { Clock, Trash2, FileText, FileCheck, Languages, Globe } from 'lucide-react';
import {
  TranslationHistory,
  getTranslationHistory,
  deleteTranslationHistory,
  subscribeToTranslationHistory,
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
          Riwayat terjemahan kamu akan muncul di sini setelah kamu melakukan terjemahan.
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
      <div className="space-y-4">
        {filteredHistory.map((item) => (
          <div
            key={item.id}
            className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {item.translationType === 'text' ? (
                    <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  ) : (
                    <FileCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium text-gray-300 capitalize">
                    {item.translationType === 'text' ? 'Teks' : 'Dokumen'}
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="text-sm text-gray-400 truncate">
                    {item.translatedBy}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700/50 rounded-lg text-sm">
                    <span className="text-gray-300 font-medium">
                      {LANGUAGE_NAMES[item.sourceLang] || item.sourceLang}
                    </span>
                  </div>
                  <Languages className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700/50 rounded-lg text-sm">
                    <span className="text-gray-300 font-medium">
                      {LANGUAGE_NAMES[item.targetLang] || item.targetLang}
                    </span>
                  </div>
                </div>

                {item.translationType === 'text' && item.sourceText && (
                  <div className="space-y-2">
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
                      <p className="text-xs text-gray-500 mb-1">Teks Asli:</p>
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {item.sourceText}
                      </p>
                    </div>
                    {item.translatedText && (
                      <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
                        <p className="text-xs text-gray-500 mb-1">Hasil Terjemahan:</p>
                        <p className="text-sm text-gray-300 line-clamp-2">
                          {item.translatedText}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {item.translationType === 'document' && item.documentName && (
                  <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-300 truncate">
                          {item.documentName}
                        </p>
                        {item.documentSize && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatBytes(item.documentSize)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatRelativeTime(item.createdAt)}</span>
                </div>
              </div>

              <button
                onClick={() => setDeleteConfirm({ isOpen: true, id: item.id })}
                className="flex-shrink-0 p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Hapus history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
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

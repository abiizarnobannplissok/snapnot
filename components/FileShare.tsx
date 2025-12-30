import React, { useState, useEffect } from 'react';
import { FileUp, FolderOpen, Loader2, Trash2 } from 'lucide-react';
import { FileGroup, FileItem } from '../fileTypes';
import { FileUploadArea } from './FileUploadArea';
import { FileGroupCard } from './FileGroupCard';
import { ConfirmDialog } from './ConfirmDialog';
import { Toast } from './Toast';
import { 
  getFileGroups, 
  createFileGroup,
  deleteFileGroup,
  addFilesToGroup,
  subscribeToFileChanges 
} from '../services/supabaseFileGroups';
import { 
  getFileExtension
} from '../utils/fileUtils';

interface FileShareProps {
  searchQuery: string;
  externalFiles: File[];
  onExternalFilesProcessed: () => void;
}

export function FileShare({ searchQuery, externalFiles, onExternalFilesProcessed }: FileShareProps) {
  const [fileGroups, setFileGroups] = useState<FileGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; groupId: string | null }>({
    isOpen: false,
    groupId: null
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFileGroups();

    const unsubscribe = subscribeToFileChanges(loadFileGroups);
    return () => unsubscribe();
  }, []);

  const loadFileGroups = async () => {
    const groups = await getFileGroups();
    setFileGroups(groups);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpload = async (
    files: File[], 
    groupName: string, 
    uploader: string, 
    onProgress?: (progress: number) => void,
    onFileUploaded?: (index: number) => void
  ) => {
    if (files.length === 0) return;

    setLoading(true);
    try {
      const MAX_SIZE = 1024 * 1024 * 1024; // 1GB per file
      
      const validFiles = [];
      for (const file of files) {
        if (file.size > MAX_SIZE) {
          showToast(`File ${file.name} melebihi batas maksimal 1GB`, 'error');
          continue;
        }
        
        const extension = getFileExtension(file.name);
        validFiles.push({ file, extension });
      }

      if (validFiles.length === 0) {
        throw new Error('Tidak ada file yang valid untuk diupload');
      }

      // Show progress notification
      showToast(`Mengupload ${validFiles.length} file...`, 'success');
      console.log('📤 Starting upload for', validFiles.length, 'files...');
      
      const result = await createFileGroup(
        groupName.trim() || 'A',
        uploader.trim() || 'Abiizar',
        validFiles,
        onProgress,
        onFileUploaded
      );
      
      console.log('✅ Upload complete:', result);

      await loadFileGroups();
      showToast(`✓ ${validFiles.length} file berhasil diupload!`, 'success');
    } catch (error) {
      console.error('❌ Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengupload file';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (file: FileItem): Promise<void> => {
    try {
      showToast(`📥 Mengunduh ${file.name}...`, 'success');

      // Add download parameter to force download instead of preview
      const downloadUrl = file.data.includes('?') 
        ? `${file.data}&download=${encodeURIComponent(file.name)}`
        : `${file.data}?download=${encodeURIComponent(file.name)}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('❌ [DOWNLOAD ERROR]', error);
      showToast(`❌ Gagal download`, 'error');
      throw error;
    }
  };

  const handleDownloadAll = async (group: FileGroup): Promise<void> => {
    try {
      showToast(`📥 Mendownload ${group.fileCount} file...`, 'success');
      
      // Download all files sequentially using fetch blob
      for (let i = 0; i < group.files.length; i++) {
        const file = group.files[i];
        
        const response = await fetch(file.data);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = file.name;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        if (i < group.files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      showToast(`✅ ${group.fileCount} file berhasil didownload!`, 'success');
    } catch (error) {
      console.error('❌ Download all error:', error);
      showToast('❌ Gagal download file', 'error');
      throw error;
    }
  };

  const handleAddFiles = async (groupId: string, files: File[]) => {
    if (files.length === 0) return;

    setLoading(true);
    try {
      const MAX_SIZE = 1024 * 1024 * 1024; // 1GB per file
      
      const validFiles = [];
      for (const file of files) {
        if (file.size > MAX_SIZE) {
          showToast(`File ${file.name} melebihi batas maksimal 1GB`, 'error');
          continue;
        }
        
        const extension = getFileExtension(file.name);
        validFiles.push({ file, extension });
      }

      if (validFiles.length === 0) {
        throw new Error('Tidak ada file yang valid untuk ditambahkan');
      }

      await addFilesToGroup(groupId, validFiles);
      await loadFileGroups();
      showToast(`Berhasil menambahkan ${validFiles.length} file!`, 'success');
    } catch (error) {
      console.error('Add files error:', error);
      showToast(error instanceof Error ? error.message : 'Gagal menambahkan file', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (groupId: string) => {
    setDeleteConfirm({ isOpen: true, groupId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.groupId) return;

    setLoading(true);
    try {
      await deleteFileGroup(deleteConfirm.groupId);
      await loadFileGroups();
      showToast('File group berhasil dihapus', 'success');
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Gagal menghapus file group', 'error');
    } finally {
      setLoading(false);
      setDeleteConfirm({ isOpen: false, groupId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, groupId: null });
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedGroups(new Set());
  };

  const toggleGroupSelection = (groupId: string) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroups(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedGroups.size === 0) return;
    
    setLoading(true);
    try {
      await Promise.all(Array.from(selectedGroups).map(id => deleteFileGroup(id)));
      await loadFileGroups();
      showToast(`${selectedGroups.size} grup berhasil dihapus`, 'success');
      setSelectedGroups(new Set());
      setSelectionMode(false);
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Gagal menghapus grup', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = fileGroups.filter(group => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      group.groupName.toLowerCase().includes(query) ||
      group.uploader.toLowerCase().includes(query) ||
      group.files.some(file => file.name.toLowerCase().includes(query))
    );
  });

  const stats = {
    totalGroups: fileGroups.length,
    totalFiles: fileGroups.reduce((sum, g) => sum + g.fileCount, 0)
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 pt-8">
        {/* Stats */}
        <div className="flex items-center gap-3 text-gray-600 mb-8">
          <FolderOpen className="w-5 h-5" />
          <span className="font-semibold">
            {stats.totalGroups} Grup • {stats.totalFiles} File
            {filteredGroups.length !== fileGroups.length && (
              <span className="ml-2 text-black font-bold">
                (Menampilkan {filteredGroups.length} hasil)
              </span>
            )}
          </span>
        </div>

        {/* Upload Area */}
        <div className="mb-8 upload-area-scroll-target">
          <FileUploadArea 
            onUpload={handleUpload} 
            loading={loading}
            externalFiles={externalFiles}
            onExternalFilesProcessed={onExternalFilesProcessed}
          />
        </div>

        {/* File Groups Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileUp className="w-6 h-6" />
              Semua File ({filteredGroups.length})
            </h2>
            
            <div className="flex items-center gap-3">
              {selectionMode && selectedGroups.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={loading}
                  className="h-12 px-6 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  <Trash2 className="w-5 h-5" />
                  Hapus ({selectedGroups.size})
                </button>
              )}
              <button
                onClick={toggleSelectionMode}
                className={`h-12 px-6 font-bold rounded-xl transition-all active:scale-95 shadow-sm ${
                  selectionMode 
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                    : 'bg-primary text-black hover:bg-primary/80'
                }`}
              >
                {selectionMode ? 'Batal' : 'Pilih Grup'}
              </button>
            </div>
          </div>

          {filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-soft">
                <span className="text-4xl">📁</span>
              </div>
              <h3 className="text-xl font-bold mb-2">
                {fileGroups.length > 0 ? 'Tidak ditemukan' : 'Belum ada file yang diupload'}
              </h3>
              <p className="text-gray-600 max-w-md">
                {fileGroups.length > 0
                  ? 'Coba gunakan kata kunci lain atau hapus pencarian.'
                  : 'Berbagi file jadi mudah dan cepat'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredGroups.map((group) => (
                <FileGroupCard
                  key={group.id}
                  group={group}
                  onDownloadFile={handleDownloadFile}
                  onDownloadAll={handleDownloadAll}
                  onDelete={handleDeleteClick}
                  onAddFiles={handleAddFiles}
                  loading={loading}
                  selectionMode={selectionMode}
                  isSelected={selectedGroups.has(group.id)}
                  onToggleSelect={() => toggleGroupSelection(group.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Hapus grup file ini?"
        message="Semua file dalam grup akan terhapus"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

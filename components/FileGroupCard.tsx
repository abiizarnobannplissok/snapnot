import React, { useState, DragEvent } from 'react';
import { Download, Trash2, Plus, Folder, Loader2, Check } from 'lucide-react';
import { FileGroup, FileItem } from '../fileTypes';
import { FileIcon } from './FileIcon';

interface FileGroupCardProps {
  group: FileGroup;
  onDownloadFile: (file: FileItem) => void;
  onDownloadAll: (group: FileGroup) => void;
  onDelete: (groupId: string) => void;
  onAddFiles: (groupId: string, files: File[]) => void;
  loading?: boolean;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function FileGroupCard({
  group,
  onDownloadFile,
  onDownloadAll,
  onDelete,
  onAddFiles,
  loading = false,
  selectionMode = false,
  isSelected = false,
  onToggleSelect
}: FileGroupCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (loading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onAddFiles(group.id, files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onAddFiles(group.id, files);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getInitials = (name: string) => {
    if (!name || name === 'A') return 'A';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarColor = React.useMemo(() => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-red-500',
      'bg-orange-500',
      'bg-green-500',
      'bg-teal-500',
      'bg-indigo-500'
    ];
    const index = group.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }, [group.id]);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        bg-white rounded-2xl p-5 shadow-soft border-2 transition-all duration-200
        hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] relative
        ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-100'}
        ${loading ? 'opacity-50' : ''}
        ${selectionMode && isSelected ? 'ring-4 ring-primary/50' : ''}
      `}
    >
      {/* Selection Checkbox */}
      {selectionMode && (
        <button
          onClick={onToggleSelect}
          className={`
            absolute top-4 right-4 w-7 h-7 rounded-full border-2 flex items-center justify-center
            transition-all duration-200 z-10
            ${isSelected 
              ? 'bg-primary border-primary' 
              : 'bg-white border-gray-300 hover:border-primary'
            }
          `}
        >
          {isSelected && <Check className="w-4 h-4 text-black" />}
        </button>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-11 h-11 ${avatarColor} rounded-full flex items-center justify-center flex-shrink-0`}>
            <span className="text-white font-bold text-lg">
              {getInitials(group.groupName)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate">{group.groupName}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#8FB4FF]/20 text-[#8FB4FF] text-xs font-semibold rounded-full">
                <Folder className="w-3 h-3" />
                {group.fileCount} file
              </span>
              <span className="text-xs text-gray-500">{group.totalSize}</span>
            </div>
          </div>
        </div>
        {!selectionMode && (
          <button
            onClick={() => onDelete(group.id)}
            disabled={loading}
            className="p-2 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Hapus grup"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500 mb-4">
        <p>Uploader: <span className="font-semibold text-gray-700">{group.uploader}</span></p>
        <p>Diupload: {formatDate(group.createdAt)}</p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Drag Zone Info */}
      <div className={`
        p-4 rounded-xl mb-4 text-center transition-colors
        ${isDragging ? 'bg-primary/20 border-2 border-primary' : 'bg-gray-50 border-2 border-dashed border-gray-300'}
      `}>
        <p className="text-sm font-semibold text-gray-700">
          {isDragging ? 'Lepas file di sini' : 'Tarik file ke sini untuk ditambahkan'}
        </p>
        <p className="text-xs text-gray-500 mt-1">Drag & drop untuk menambah file</p>
      </div>

      {/* File List */}
      <div className="space-y-2.5 mb-4">
        {group.files.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
          >
            <FileIcon extension={file.extension} className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{file.size}</p>
            </div>
            <button
              onClick={() => onDownloadFile(file)}
              disabled={loading}
              className="w-7 h-7 flex items-center justify-center bg-primary rounded-full hover:bg-primary/80 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              aria-label={`Download ${file.name}`}
            >
              <Download className="w-4 h-4 text-black" />
            </button>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={async () => {
            setDownloadingAll(true);
            try {
              await onDownloadAll(group);
            } finally {
              setTimeout(() => setDownloadingAll(false), 1000);
            }
          }}
          disabled={loading || downloadingAll}
          className="w-full h-11 bg-primary text-black text-sm font-bold rounded-xl hover:bg-primary/80 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(212,255,0,0.4)]"
        >
          {downloadingAll ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Mendownload...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Semua</span>
            </>
          )}
        </button>

        <label className={`
          block w-full h-11 border-2 border-black text-black text-sm font-bold rounded-xl
          hover:bg-gray-100 active:scale-[0.98] transition-all
          cursor-pointer flex items-center justify-center gap-2
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          <input
            type="file"
            multiple
            onChange={handleFileInputChange}
            disabled={loading}
            className="hidden"
          />
          <Plus className="w-4 h-4" />
          <span>Tambah File</span>
        </label>
      </div>
    </div>
  );
}

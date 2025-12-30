import React, { useState, useRef, useEffect, DragEvent } from 'react';
import { Upload, X, Loader2, CheckCircle } from 'lucide-react';
import { FileIcon } from './FileIcon';
import { formatFileSize, getFileExtension } from '../utils/fileUtils';

interface FilePreview {
  file: File;
  id: string;
  uploaded?: boolean;
}

interface FileUploadAreaProps {
  onUpload: (files: File[], groupName: string, uploader: string, onProgress?: (progress: number) => void, onFileUploaded?: (index: number) => void) => Promise<void>;
  loading?: boolean;
  externalFiles?: File[];
  onExternalFilesProcessed?: () => void;
}

export function FileUploadArea({ onUpload, loading = false, externalFiles = [], onExternalFilesProcessed }: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [groupName, setGroupName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle external files from header button
  useEffect(() => {
    if (externalFiles.length > 0) {
      addFiles(externalFiles);
      onExternalFilesProcessed?.();
    }
  }, [externalFiles]);

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

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files);
    }
  };

  const addFiles = (files: File[]) => {
    const newFiles = files.map(file => ({
      file,
      id: `${Date.now()}-${Math.random()}`
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(1); // Start at 1% so progress bar shows immediately
    
    const files = selectedFiles.map(f => f.file);
    
    // Progress callback
    const onProgress = (progress: number) => {
      console.log('📊 Upload progress:', Math.round(progress) + '%');
      setUploadProgress(progress);
    };
    
    // File uploaded callback - mark file as uploaded
    const onFileUploaded = (index: number) => {
      console.log('✅ File', index + 1, 'uploaded - updating UI');
      setSelectedFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, uploaded: true } : f
      ));
    };
    
    try {
      await onUpload(files, groupName, 'Abiizar', onProgress, onFileUploaded);
      
      // Success - reset
      setSelectedFiles([]);
      setGroupName('');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-soft border-2 border-gray-100">
      <h2 className="text-xl font-bold mb-4">Upload File</h2>
      
      {/* Upload Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !loading && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
          transition-all duration-200
          ${isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          disabled={loading}
          className="hidden"
        />
        
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
            <Upload className="w-6 h-6 text-black" />
          </div>
          <h3 className="text-base font-bold mb-1.5">Unggah File</h3>
          <p className="text-gray-600 text-sm mb-3">Klik atau Tarik File ke Sini!</p>
          <p className="text-xs text-gray-400">
            Maks 1GB per file • Cloudflare R2 Storage • Gratis selamanya!
          </p>
        </div>
      </div>

      {/* Input Field - Nama Grup */}
      <div className="mt-4">
        <label className="block text-xs font-semibold mb-1.5">
          Nama Grup <span className="text-gray-400 font-normal">(Opsional)</span>
        </label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="A"
          disabled={loading}
          className="w-full h-10 px-3 text-sm rounded-lg border-2 border-gray-200 focus:border-black focus:outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* File Preview List */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-sm mb-2">File yang Dipilih ({selectedFiles.length})</h3>
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {selectedFiles.map((preview, index) => {
              const extension = getFileExtension(preview.file.name);
              return (
                <div
                  key={preview.id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-all ${
                    preview.uploaded 
                      ? 'bg-green-50 border-2 border-green-200' 
                      : 'bg-gray-50'
                  }`}
                >
                  <FileIcon extension={extension} className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${
                      preview.uploaded ? 'text-green-700' : ''
                    }`}>
                      {preview.file.name}
                    </p>
                    <p className="text-[10px] text-gray-500">{formatFileSize(preview.file.size)}</p>
                  </div>
                  
                  {preview.uploaded ? (
                    <div className="w-6 h-6 flex items-center justify-center bg-green-500 rounded-full">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(preview.id);
                      }}
                      disabled={loading || isUploading}
                      className="p-1 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Button & Progress Bar */}
      {selectedFiles.length > 0 && (
        <div>
          {isUploading && (
            <div className="mt-4 mb-3 space-y-1.5 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">Upload Progress</span>
                <span className="font-bold text-black text-base">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out relative"
                  style={{ width: `${uploadProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
              <p className="text-[10px] text-gray-600 text-center font-medium">
                Uploading {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}...
              </p>
            </div>
          )}

          <button
          onClick={handleUpload}
          disabled={loading || isUploading}
          className="w-full mt-4 h-10 bg-primary text-black text-sm font-bold rounded-lg hover:bg-primary/80 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(212,255,0,0.4)]"
        >
          {loading || isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Mengupload...</span>
            </>
          ) : (
            <span>Upload {selectedFiles.length} File</span>
          )}
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, CheckCircle2, Download, Loader2, X, Languages } from 'lucide-react';
import { SOURCE_LANGUAGES, TARGET_LANGUAGES } from '@/constants/languages';
import { 
  uploadDocument, 
  checkDocumentStatus, 
  downloadDocument,
  type DocumentStatusResponse
} from '@/services/deepLService';
import { translatorColors } from '@/constants/translatorColors';
import { createDocumentTranslationHistory, uploadTranslatedDocument } from '@/services/translationHistoryService';

interface DocumentTranslationProps {
  apiKey: string;
  onError?: (error: string) => void;
  className?: string;
}

type Stage = 'upload' | 'progress' | 'complete';

const ACCEPTED_FILE_TYPES = '.pdf,.docx,.doc';
const MAX_FILE_SIZE_2GB = 2 * 1024 * 1024 * 1024;
const POLL_INTERVAL_MS = 2000;
const STORAGE_KEY = 'snapnot_doc_translation_state';

interface TranslationState {
  documentId: string;
  documentKey: string;
  fileName: string;
  fileSize: number;
  sourceLang: string;
  targetLang: string;
  uploadProgress: number;
  statusMessage: string;
  pollAttempts: number;
  estimatedChars: number;
  maxAttempts: number;
  timestamp: number;
}

const estimateCharacterCount = (file: File): number => {
  const fileSizeMB = file.size / (1024 * 1024);
  const fileSizeKB = file.size / 1024;
  
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return Math.floor(fileSizeKB * 100);
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
             file.name.toLowerCase().endsWith('.docx')) {
    return Math.floor(fileSizeKB * 150);
  } else if (file.type === 'application/msword' || file.name.toLowerCase().endsWith('.doc')) {
    return Math.floor(fileSizeKB * 120);
  }
  
  return Math.floor(fileSizeKB * 100);
};

const calculateMaxAttempts = (estimatedChars: number): number => {
  if (estimatedChars < 10000) {
    return 150;
  } else if (estimatedChars < 50000) {
    return 450;
  } else if (estimatedChars < 150000) {
    return 900;
  } else if (estimatedChars < 300000) {
    return 1500;
  } else {
    return 2400;
  }
};

const formatCharacterCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}k`;
  }
  return count.toString();
};

export default function DocumentTranslation({ 
  apiKey, 
  onError, 
  className = '' 
}: DocumentTranslationProps) {
  const [stage, setStage] = useState<Stage>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceLang, setSourceLang] = useState('EN');
  const [targetLang, setTargetLang] = useState('ID');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [documentKey, setDocumentKey] = useState('');
  const [translatedBlob, setTranslatedBlob] = useState<Blob | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showBackgroundNotice, setShowBackgroundNotice] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollAttemptsRef = useRef(0);
  const isPollingRef = useRef(false);
  const maxAttemptsRef = useRef(0);
  const estimatedCharsRef = useRef(0);

  // Save state to localStorage
  const saveState = useCallback((state: Partial<TranslationState>) => {
    const docId = state.documentId || documentId;
    if (!docId) {
      console.log('[DocTranslate] No documentId, skipping state save');
      return;
    }
    
    const currentState: TranslationState = {
      documentId: docId,
      documentKey: state.documentKey || documentKey,
      fileName: state.fileName || selectedFile?.name || '',
      fileSize: state.fileSize || selectedFile?.size || 0,
      sourceLang: state.sourceLang || sourceLang,
      targetLang: state.targetLang || targetLang,
      uploadProgress: state.uploadProgress ?? uploadProgress,
      statusMessage: state.statusMessage || statusMessage,
      pollAttempts: state.pollAttempts ?? pollAttemptsRef.current,
      estimatedChars: state.estimatedChars ?? estimatedCharsRef.current,
      maxAttempts: state.maxAttempts ?? maxAttemptsRef.current,
      timestamp: state.timestamp || Date.now(),
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
      console.log('[DocTranslate] State saved to localStorage');
    } catch (error) {
      console.error('[DocTranslate] Failed to save state:', error);
    }
  }, [documentId, documentKey, selectedFile, sourceLang, targetLang, uploadProgress, statusMessage]);

  // Clear state from localStorage
  const clearState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('[DocTranslate] State cleared from localStorage');
    } catch (error) {
      console.error('[DocTranslate] Failed to clear state:', error);
    }
  }, []);

  // Restore state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (!savedState) return;

      const state: TranslationState = JSON.parse(savedState);
      
      // Check if state is stale (older than 2 hours)
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      if (state.timestamp < twoHoursAgo) {
        console.log('[DocTranslate] Saved state is stale, ignoring');
        clearState();
        return;
      }

      // Restore state
      console.log('[DocTranslate] Restoring state from localStorage');
      setDocumentId(state.documentId);
      setDocumentKey(state.documentKey);
      setSourceLang(state.sourceLang);
      setTargetLang(state.targetLang);
      setUploadProgress(state.uploadProgress);
      setStatusMessage(state.statusMessage + ' (resumed)');
      setStage('progress');
      pollAttemptsRef.current = state.pollAttempts;
      estimatedCharsRef.current = state.estimatedChars;
      maxAttemptsRef.current = state.maxAttempts;

      // Resume polling
      const resumeFile = new File([], state.fileName, { type: 'application/pdf' });
      Object.defineProperty(resumeFile, 'size', { value: state.fileSize });
      setSelectedFile(resumeFile);
      
      // Start polling immediately
      setTimeout(() => {
        pollDocumentStatus(state.documentId, state.documentKey, resumeFile);
      }, 100);
    } catch (error) {
      console.error('[DocTranslate] Failed to restore state:', error);
      clearState();
    }
  }, []);

  // Handle page visibility changes (browser tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[DocTranslate] Tab hidden, state saved');
        saveState({});
      } else {
        console.log('[DocTranslate] Tab visible again');
        
        // If polling was active, resume it
        if (stage === 'progress' && documentId && documentKey && !isPollingRef.current) {
          console.log('[DocTranslate] Resuming polling after tab became visible');
          const resumeFile = selectedFile || new File([], '', { type: 'application/pdf' });
          pollDocumentStatus(documentId, documentKey, resumeFile);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [stage, documentId, documentKey, selectedFile, saveState]);

  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) return;

    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!validTypes.includes(file.type)) {
      onError?.('Pilih file PDF, DOCX, atau DOC aja ya!');
      return;
    }

    if (file.size > MAX_FILE_SIZE_2GB) {
      onError?.('Waduh, filenya kegedean! Maksimal 2GB ya.');
      return;
    }

    setSelectedFile(file);
  }, [onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  }, [handleFileSelect]);

  const stopPolling = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    isPollingRef.current = false;
  }, []);

  const pollDocumentStatus = useCallback(async (docId: string, docKey: string, file: File) => {
    if (isPollingRef.current) {
      console.log('[DocTranslate] Polling already active, skipping duplicate');
      return;
    }

    isPollingRef.current = true;
    const estimatedChars = estimateCharacterCount(file);
    const maxAttempts = calculateMaxAttempts(estimatedChars);
    const estimatedMinutes = Math.ceil((maxAttempts * POLL_INTERVAL_MS) / 60000);
    
    estimatedCharsRef.current = estimatedChars;
    maxAttemptsRef.current = maxAttempts;
    
    console.log(`[DocTranslate] File: ${(file.size / (1024 * 1024)).toFixed(2)} MB, Est chars: ${formatCharacterCount(estimatedChars)}, Max attempts: ${maxAttempts} (${estimatedMinutes} min)`);

    const poll = async () => {
      try {
        pollAttemptsRef.current += 1;

        const status: DocumentStatusResponse = await checkDocumentStatus(docId, docKey, apiKey);
        console.log('[DocTranslate] Status:', status.status, 'Remaining:', status.seconds_remaining, 'Attempt:', pollAttemptsRef.current);

        if (status.status === 'queued') {
          setStatusMessage('Bentar ya bos, lagi antre nih...');
          setUploadProgress(15);
          saveState({ uploadProgress: 15, statusMessage: 'Bentar ya bos, lagi antre nih...' });
        } else if (status.status === 'translating') {
          const remaining = status.seconds_remaining || 0;
          
          const estimatedAttemptsNeeded = remaining > 0 
            ? Math.ceil(remaining / (POLL_INTERVAL_MS / 1000)) + pollAttemptsRef.current
            : pollAttemptsRef.current;
          
          const dynamicMaxAttempts = Math.max(maxAttempts, estimatedAttemptsNeeded + 30);
          
          if (pollAttemptsRef.current > dynamicMaxAttempts) {
            stopPolling();
            clearState();
            onError?.('Aduh, kelamaan nih. DeepL-nya lagi lemot, coba lagi ntar ya!');
            setStage('upload');
            return;
          }
          
          const progressPct = Math.min(25 + (pollAttemptsRef.current * 2), 70);
          setUploadProgress(Math.floor(progressPct));
          
          let message = '';
          if (remaining > 0) {
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            if (minutes > 0) {
              message = `Sabar ya, lagi dimasak nih... (sekitar ${minutes} menit ${seconds} detik lagi)`;
            } else {
              message = `Sabar ya, lagi dimasak nih... (sekitar ${seconds} detik lagi)`;
            }
          } else {
            message = `Sabar ya, lagi dimasak nih... (${progressPct}%)`;
          }
          setStatusMessage(message);
          saveState({ uploadProgress: Math.floor(progressPct), statusMessage: message });
        } else if (status.status === 'done') {
          stopPolling();
          clearState();
          setStatusMessage('Mantap! Berhasil diterjemahin!');
          setUploadProgress(100);

          try {
            const blob = await downloadDocument(docId, docKey, apiKey);
            setTranslatedBlob(blob);
            setStage('complete');

            try {
              console.log('[DocTranslate] Uploading translated document to storage...');
              const storagePath = await uploadTranslatedDocument(blob, file.name);
              console.log('[DocTranslate] Uploaded to:', storagePath);

              await createDocumentTranslationHistory(
                sourceLang,
                targetLang,
                file.name,
                file.size,
                storagePath,
                'Anonymous'
              );
              console.log('[DocTranslate] History saved successfully with storage path');
            } catch (historyError) {
              console.error('[DocTranslate] Failed to save history:', historyError);
            }
          } catch (downloadError) {
            const errorMessage = downloadError instanceof Error 
              ? downloadError.message 
              : 'Gagal download hasil terjemahan';
            console.error('[DocTranslate] Download error:', downloadError);
            onError?.(errorMessage);
            setStage('upload');
          }
          return;
        } else if (status.status === 'error') {
          stopPolling();
          clearState();
          onError?.(status.error || 'Waduh, terjemahannya gagal nih. Coba cek filenya.');
          setStage('upload');
          return;
        }

        pollTimeoutRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (error) {
        stopPolling();
        clearState();
        const errorMessage = error instanceof Error ? error.message : 'Gagal ngecek status nih';
        onError?.(errorMessage);
        setStage('upload');
      }
    };

    await poll();
  }, [apiKey, onError, stopPolling, saveState, clearState]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      onError?.('Pilih filenya dulu dong bos!');
      return;
    }

    pollAttemptsRef.current = 0;
    setStage('progress');
    setUploadProgress(0);
    
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    const estimatedChars = estimateCharacterCount(selectedFile);
    
    if (estimatedChars > 100000) {
      setStatusMessage(`Dokumen besar nih (~${formatCharacterCount(estimatedChars)} karakter), sabar ya...`);
    } else {
      setStatusMessage('Lagi ngirim dokumennya nih...');
    }

    try {
      setUploadProgress(5);
      const result = await uploadDocument(selectedFile, sourceLang, targetLang, apiKey);
      
      setDocumentId(result.document_id);
      setDocumentKey(result.document_key);
      setUploadProgress(10);
      setStatusMessage('Sip, sudah kekirim! Mulai terjemahin ya...');

      estimatedCharsRef.current = estimateCharacterCount(selectedFile);
      maxAttemptsRef.current = calculateMaxAttempts(estimatedCharsRef.current);

      saveState({
        documentId: result.document_id,
        documentKey: result.document_key,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        sourceLang,
        targetLang,
        uploadProgress: 10,
        statusMessage: 'Sip, sudah kekirim! Mulai terjemahin ya...',
        pollAttempts: 0,
        estimatedChars: estimatedCharsRef.current,
        maxAttempts: maxAttemptsRef.current,
        timestamp: Date.now(),
      });
      console.log('[DocTranslate] State saved immediately after upload');
      
      setShowBackgroundNotice(true);

      await pollDocumentStatus(result.document_id, result.document_key, selectedFile);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal upload nih';
      onError?.(errorMessage);
      setStage('upload');
    }
  }, [selectedFile, sourceLang, targetLang, apiKey, onError, pollDocumentStatus]);

  const handleDownload = useCallback(() => {
    if (!translatedBlob || !selectedFile) return;

    const url = URL.createObjectURL(translatedBlob);
    const link = document.createElement('a');
    link.href = url;
    
    const originalName = selectedFile.name;
    const dotIndex = originalName.lastIndexOf('.');
    const baseName = dotIndex !== -1 ? originalName.substring(0, dotIndex) : originalName;
    const extension = dotIndex !== -1 ? originalName.substring(dotIndex) : '';
    link.download = `${baseName}_${targetLang.toLowerCase()}${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [translatedBlob, selectedFile, targetLang]);

  const handleReset = useCallback(() => {
    stopPolling();
    clearState();
    setStage('upload');
    setSelectedFile(null);
    setUploadProgress(0);
    setStatusMessage('');
    setDocumentId('');
    setDocumentKey('');
    setTranslatedBlob(null);
    setShowBackgroundNotice(false);
    pollAttemptsRef.current = 0;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [stopPolling, clearState]);

  const handleCancel = useCallback(() => {
    stopPolling();
    clearState();
    onError?.('Translation cancelled');
    setStage('upload');
    setUploadProgress(0);
    setStatusMessage('');
    setShowBackgroundNotice(false);
    pollAttemptsRef.current = 0;
  }, [stopPolling, clearState, onError]);

  return (
    <div className={className} style={{ padding: '8px' }}>
      <div
        style={{
          backgroundColor: translatorColors.neutral.warmGray,
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {stage === 'upload' && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                aria-label="Source language"
                style={{
                  flex: '1',
                  minWidth: '150px',
                  padding: '12px 16px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: translatorColors.text.dark,
                  backgroundColor: translatorColors.neutral.white,
                  border: `1px solid ${translatorColors.neutral.borderLight}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {SOURCE_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>

              <div
                style={{
                  fontSize: '24px',
                  color: translatorColors.text.gray,
                }}
              >
                →
              </div>

              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                aria-label="Target language"
                style={{
                  flex: '1',
                  minWidth: '150px',
                  padding: '12px 16px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: translatorColors.text.dark,
                  backgroundColor: translatorColors.neutral.white,
                  border: `1px solid ${translatorColors.neutral.borderLight}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {TARGET_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              style={{
                height: '220px',
                border: `2px dashed ${isDragOver ? translatorColors.primary.brightRed : translatorColors.neutral.border}`,
                borderRadius: '12px',
                backgroundColor: isDragOver ? translatorColors.primary.rosePink : translatorColors.neutral.lightGray,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              aria-label="Upload document area"
            >
              <Upload 
                size={64} 
                color={selectedFile ? translatorColors.accent.successGreen : translatorColors.text.gray} 
              />
              
              {selectedFile ? (
                <>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: translatorColors.text.dark,
                        marginBottom: '8px',
                      }}
                    >
                      {selectedFile.name}
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        color: translatorColors.text.gray,
                        marginBottom: '4px',
                      }}
                    >
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · ~{formatCharacterCount(estimateCharacterCount(selectedFile))} karakter
                    </div>
                    {estimateCharacterCount(selectedFile) > 100000 && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: translatorColors.accent.warningOrange,
                          fontWeight: '500',
                        }}
                      >
                        ⏱️ Dokumen besar, estimasi ~{Math.ceil(calculateMaxAttempts(estimateCharacterCount(selectedFile)) * 2 / 60)} menit
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      color: translatorColors.accent.errorRed,
                      backgroundColor: 'transparent',
                      border: `1px solid ${translatorColors.accent.errorRed}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: translatorColors.text.dark,
                    }}
                  >
                    Geser file ke sini bosku
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: translatorColors.text.gray,
                    }}
                  >
                    atau klik buat cari file
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: translatorColors.text.light,
                    }}
                  >
                    Supported: PDF, DOCX, DOC (max 2GB)
                  </div>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
                aria-label="File input"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '0 32px',
                height: '52px',
                fontSize: '16px',
                fontWeight: '700',
                color: translatorColors.neutral.white,
                background: selectedFile 
                  ? `linear-gradient(135deg, ${translatorColors.primary.brightRed} 0%, ${translatorColors.primary.deepRed} 100%)`
                  : translatorColors.neutral.border,
                border: 'none',
                borderRadius: '12px',
                cursor: selectedFile ? 'pointer' : 'not-allowed',
                opacity: selectedFile ? 1 : 0.7,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: selectedFile 
                  ? `0 4px 14px 0 rgba(255, 59, 48, 0.4)`
                  : 'none',
                letterSpacing: '0.3px',
              }}
              onMouseEnter={(e) => {
                if (selectedFile) {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(255, 59, 48, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = selectedFile 
                  ? '0 4px 14px 0 rgba(255, 59, 48, 0.4)'
                  : 'none';
              }}
              onMouseDown={(e) => {
                if (selectedFile) {
                  e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
                }
              }}
              onMouseUp={(e) => {
                if (selectedFile) {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                }
              }}
            >
              <Languages size={22} strokeWidth={2.5} />
              <span>Terjemahkan Dokumen</span>
            </button>
          </>
        )}

        {stage === 'progress' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              alignItems: 'center',
              padding: '24px 16px',
            }}
          >
            <Loader2
              size={48}
              color={translatorColors.primary.brightRed}
              style={{ animation: 'spin 1s linear infinite' }}
            />
            
            <div
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: translatorColors.text.dark,
                textAlign: 'center',
              }}
            >
              {statusMessage}
            </div>

            {showBackgroundNotice && uploadProgress >= 15 && (
              <div
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '12px 16px',
                  backgroundColor: '#E3F2FD',
                  border: '1px solid #1976D2',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#1565C0',
                  textAlign: 'center',
                  lineHeight: '1.5',
                  position: 'relative',
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  ℹ️ Translate berjalan di background
                </div>
                <div style={{ fontSize: '12px' }}>
                  Kamu bisa pindah tab, proses tetap jalan
                </div>
                <button
                  onClick={() => setShowBackgroundNotice(false)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: '#1565C0',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#BBDEFB';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  aria-label="Tutup notifikasi"
                >
                  ✕
                </button>
              </div>
            )}

            <div style={{ width: '100%', maxWidth: '400px' }}>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: translatorColors.neutral.borderLight,
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    backgroundColor: translatorColors.primary.brightRed,
                    borderRadius: '999px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: translatorColors.text.gray,
                  textAlign: 'center',
                  marginTop: '8px',
                }}
              >
                {uploadProgress}%
              </div>
            </div>

            <button
              onClick={handleCancel}
              style={{
                padding: '0 24px',
                height: '36px',
                fontSize: '14px',
                fontWeight: '500',
                color: translatorColors.text.gray,
                backgroundColor: 'transparent',
                border: `1px solid ${translatorColors.neutral.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = translatorColors.accent.errorRed;
                e.currentTarget.style.color = translatorColors.accent.errorRed;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = translatorColors.neutral.border;
                e.currentTarget.style.color = translatorColors.text.gray;
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {stage === 'complete' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              alignItems: 'center',
              padding: '24px 16px',
            }}
          >
            <CheckCircle2 size={64} color={translatorColors.accent.successGreen} />
            
            <div
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: translatorColors.text.dark,
                textAlign: 'center',
              }}
            >
              Mantap! Sudah Selesai!
            </div>

            <div
              style={{
                fontSize: '14px',
                color: translatorColors.text.gray,
                textAlign: 'center',
              }}
            >
              Dokumen kamu sudah berhasil diterjemahkan.
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <button
                onClick={handleDownload}
                style={{
                  padding: '0 32px',
                  height: '44px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: translatorColors.neutral.white,
                  backgroundColor: translatorColors.primary.brightRed,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: translatorColors.shadow.light,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = translatorColors.primary.deepRed;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = translatorColors.shadow.medium;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = translatorColors.primary.brightRed;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = translatorColors.shadow.light;
                }}
              >
                <Download size={20} />
                Download
              </button>

              <button
                onClick={handleReset}
                style={{
                  padding: '0 24px',
                  height: '44px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: translatorColors.text.dark,
                  backgroundColor: 'transparent',
                  border: `1px solid ${translatorColors.neutral.border}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = translatorColors.primary.brightRed;
                  e.currentTarget.style.color = translatorColors.primary.brightRed;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = translatorColors.neutral.border;
                  e.currentTarget.style.color = translatorColors.text.dark;
                }}
              >
                Translate Another
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

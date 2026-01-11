'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, CheckCircle2, Download, Loader2, X, Languages } from 'lucide-react';
import { SOURCE_LANGUAGES, TARGET_LANGUAGES } from '@/constants/languages';
import { 
  uploadDocument, 
  checkDocumentStatus, 
  downloadDocument,
  type DocumentStatusResponse
} from '@/services/deepLService';
import { translatorColors } from '@/constants/translatorColors';

interface DocumentTranslationProps {
  apiKey: string;
  onError?: (error: string) => void;
  className?: string;
}

type Stage = 'upload' | 'progress' | 'complete';

const ACCEPTED_FILE_TYPES = '.pdf,.docx,.doc';
const MAX_FILE_SIZE_2GB = 2 * 1024 * 1024 * 1024;
const POLL_INTERVAL_MS = 2000; // Match reference: 2 seconds
const MAX_POLL_ATTEMPTS = 120; // 120 attempts * 2s = 4 minutes max

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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollAttemptsRef = useRef(0);

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
  }, []);

  const pollDocumentStatus = useCallback(async (docId: string, docKey: string) => {
    pollAttemptsRef.current = 0;

    const poll = async () => {
      try {
        pollAttemptsRef.current += 1;

        if (pollAttemptsRef.current > MAX_POLL_ATTEMPTS) {
          stopPolling();
          onError?.('Aduh, kelamaan nih. DeepL-nya lagi lemot, coba lagi ntar ya!');
          setStage('upload');
          return;
        }

        const status: DocumentStatusResponse = await checkDocumentStatus(docId, docKey, apiKey);
        console.log('[DocTranslate] Status:', status.status, 'Remaining:', status.seconds_remaining, 'Attempt:', pollAttemptsRef.current);

        if (status.status === 'queued') {
          setStatusMessage('Bentar ya bos, lagi antre nih...');
          setUploadProgress(15);
        } else if (status.status === 'translating') {
          const remaining = status.seconds_remaining || 0;
          const progressPct = Math.min(25 + (pollAttemptsRef.current * 2), 70);
          setUploadProgress(Math.floor(progressPct));
          
          if (remaining > 0) {
            setStatusMessage(`Sabar ya, lagi dimasak nih... (sekitar ${remaining} detik lagi)`);
          } else {
            setStatusMessage(`Sabar ya, lagi dimasak nih... (${progressPct}%)`);
          }
        } else if (status.status === 'done') {
          stopPolling();
          setStatusMessage('Mantap! Berhasil diterjemahin!');
          setUploadProgress(100);

          const blob = await downloadDocument(docId, docKey, apiKey);
          setTranslatedBlob(blob);
          setStage('complete');
          return;
        } else if (status.status === 'error') {
          stopPolling();
          onError?.(status.error || 'Waduh, terjemahannya gagal nih. Coba cek filenya.');
          setStage('upload');
          return;
        }

        pollTimeoutRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (error) {
        stopPolling();
        const errorMessage = error instanceof Error ? error.message : 'Gagal ngecek status nih';
        onError?.(errorMessage);
        setStage('upload');
      }
    };

    await poll();
  }, [apiKey, onError, stopPolling]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      onError?.('Pilih filenya dulu dong bos!');
      return;
    }

    setStage('progress');
    setUploadProgress(0);
    setStatusMessage('Lagi ngirim dokumennya nih...');

    try {
      setUploadProgress(5);
      const result = await uploadDocument(selectedFile, sourceLang, targetLang, apiKey);
      
      setDocumentId(result.document_id);
      setDocumentKey(result.document_key);
      setUploadProgress(10);
      setStatusMessage('Sip, sudah kekirim! Mulai terjemahin ya...');

      await pollDocumentStatus(result.document_id, result.document_key);
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
    setStage('upload');
    setSelectedFile(null);
    setUploadProgress(0);
    setStatusMessage('');
    setDocumentId('');
    setDocumentKey('');
    setTranslatedBlob(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [stopPolling]);

  const handleCancel = useCallback(() => {
    stopPolling();
    onError?.('Translation cancelled');
    setStage('upload');
    setUploadProgress(0);
    setStatusMessage('');
  }, [stopPolling, onError]);

  return (
    <div className={className} style={{ padding: '16px' }}>
      <div
        style={{
          backgroundColor: translatorColors.neutral.warmGray,
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
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
                height: '300px',
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
                      }}
                    >
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
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
                padding: '0 32px',
                height: '44px',
                fontSize: '16px',
                fontWeight: '600',
                color: translatorColors.neutral.white,
                backgroundColor: translatorColors.primary.brightRed,
                border: 'none',
                borderRadius: '8px',
                cursor: selectedFile ? 'pointer' : 'not-allowed',
                opacity: selectedFile ? 1 : 0.6,
                transition: 'all 0.2s',
                boxShadow: translatorColors.shadow.light,
              }}
              onMouseEnter={(e) => {
                if (selectedFile) {
                  e.currentTarget.style.backgroundColor = translatorColors.primary.deepRed;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = translatorColors.shadow.medium;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = translatorColors.primary.brightRed;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = translatorColors.shadow.light;
              }}
            >
              <Languages size={20} style={{ marginRight: '8px' }} />
              AI Translate Document
            </button>
          </>
        )}

        {stage === 'progress' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              alignItems: 'center',
              padding: '32px 16px',
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
              gap: '24px',
              alignItems: 'center',
              padding: '32px 16px',
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

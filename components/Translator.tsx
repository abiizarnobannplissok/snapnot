import React, { useState, useEffect } from 'react';
import { SegmentedControl } from './translator/SegmentedControl';
import { ApiKeyManager } from './translator/ApiKeyManager';
import TextTranslation from './translator/TextTranslation';
import DocumentTranslation from './translator/DocumentTranslation';
import { TranslationHistoryView } from './TranslationHistory';
import { translatorColors } from '@/constants/translatorColors';
import { FileText, FileUp, Clock } from 'lucide-react';

type TranslationMode = 'text' | 'document' | 'history';

interface TranslatorProps {
  onShowToast?: (message: string, type: 'success' | 'error') => void;
}

const API_KEY_STORAGE_KEY = 'snapnot_deepl_api_key';
const MODE_STORAGE_KEY = 'snapnot_translator_mode';
const DOC_STATE_STORAGE_KEY = 'snapnot_doc_translation_state';

export const Translator: React.FC<TranslatorProps> = ({ onShowToast }) => {
  const [mode, setMode] = useState<TranslationMode>('text');
  const [selectedApiKey, setSelectedApiKey] = useState<string>('');
  const [showApiKeyManager, setShowApiKeyManager] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    try {
      const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      const savedMode = localStorage.getItem(MODE_STORAGE_KEY) as TranslationMode | null;
      const docState = localStorage.getItem(DOC_STATE_STORAGE_KEY);
      
      if (savedApiKey) {
        console.log('[Translator] Restored API key from localStorage');
        setSelectedApiKey(savedApiKey);
        setShowApiKeyManager(false);
      }
      
      if (docState) {
        console.log('[Translator] Active document translation detected, switching to document mode');
        setMode('document');
      } else if (savedMode && (savedMode === 'text' || savedMode === 'document' || savedMode === 'history')) {
        console.log('[Translator] Restored mode from localStorage:', savedMode);
        setMode(savedMode);
      }
    } catch (error) {
      console.error('[Translator] Failed to restore state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleError = (error: string) => {
    if (onShowToast) {
      onShowToast(error, 'error');
    } else {
      console.error('Translation Error:', error);
    }
  };

  const handleApiKeySelect = (apiKey: string) => {
    try {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
      console.log('[Translator] API key saved to localStorage');
    } catch (error) {
      console.error('[Translator] Failed to save API key:', error);
    }
    
    setSelectedApiKey(apiKey);
    setShowApiKeyManager(false);
    if (onShowToast) {
      onShowToast('API key selected successfully!', 'success');
    }
  };

  const handleModeChange = (newMode: TranslationMode) => {
    try {
      localStorage.setItem(MODE_STORAGE_KEY, newMode);
      console.log('[Translator] Mode saved to localStorage:', newMode);
    } catch (error) {
      console.error('[Translator] Failed to save mode:', error);
    }
    setMode(newMode);
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: translatorColors.neutral.warmGray,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          fontSize: '18px',
          color: translatorColors.text.gray,
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: translatorColors.neutral.warmGray,
      padding: '24px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '32px',
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: translatorColors.text.dark,
          marginBottom: '8px',
          letterSpacing: '-0.5px',
        }}>
          SnapNot Translator
        </h1>
        <p style={{
          fontSize: '16px',
          color: translatorColors.text.gray,
          lineHeight: '1.5',
        }}>
          Terjemahkan teks dan dokumen dengan DeepL API
        </p>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {!selectedApiKey || showApiKeyManager ? (
          <div style={{ marginBottom: '24px' }}>
            <ApiKeyManager onKeySelect={handleApiKeySelect} />
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '12px' }}>
              <SegmentedControl
                options={[
                  { value: 'text', label: 'Teks', icon: <FileText size={16} /> },
                  { value: 'document', label: 'Dokumen', icon: <FileUp size={16} /> },
                  { value: 'history', label: 'History', icon: <Clock size={16} /> },
                ]}
                value={mode}
                onChange={(value) => handleModeChange(value as TranslationMode)}
              />
            </div>

            <div style={{ display: mode === 'text' ? 'block' : 'none' }}>
              <TextTranslation
                apiKey={selectedApiKey}
                onError={handleError}
              />
            </div>
            <div style={{ display: mode === 'document' ? 'block' : 'none' }}>
              <DocumentTranslation
                apiKey={selectedApiKey}
                onError={handleError}
              />
            </div>
            <div style={{ display: mode === 'history' ? 'block' : 'none' }}>
              <TranslationHistoryView searchQuery="" />
            </div>

            <div style={{ marginTop: '16px' }}>
              <button
                onClick={() => setShowApiKeyManager(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  backgroundColor: translatorColors.neutral.white,
                  border: `1px solid ${translatorColors.neutral.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: translatorColors.text.gray,
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s',
                }}
              >
                <span>🔑</span>
                <span>API Key: {selectedApiKey.slice(0, 8)}...{selectedApiKey.slice(-3)}</span>
                <span style={{ marginLeft: 'auto', fontSize: '12px' }}>Click to change</span>
              </button>
            </div>
          </>
        )}

        {!selectedApiKey && (
          <div style={{
            backgroundColor: translatorColors.neutral.white,
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: translatorColors.shadow.light,
            marginTop: '24px',
          }}>
            <div style={{ 
              fontSize: '64px', 
              marginBottom: '16px',
            }}>
              🔑
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: translatorColors.text.dark,
              marginBottom: '12px',
            }}>
              API Key Required
            </h3>
            <p style={{
              fontSize: '16px',
              color: translatorColors.text.gray,
              marginBottom: '24px',
              maxWidth: '400px',
              margin: '0 auto',
            }}>
              Please select or enter your DeepL API key above to start translating
            </p>
            <a
              href="https://www.deepl.com/pro-api"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                color: translatorColors.neutral.white,
                backgroundColor: translatorColors.primary.brightRed,
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.2s',
                boxShadow: translatorColors.shadow.light,
              }}
            >
              Get Free API Key
            </a>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="padding: 24px"] {
            padding: 16px !important;
          }
          
          h1 {
            font-size: 24px !important;
          }
          
          p {
            font-size: 14px !important;
          }
        }
      `}</style>
    </div>
  );
};

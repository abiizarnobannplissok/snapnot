import React, { useState } from 'react';
import { SegmentedControl } from './translator/SegmentedControl';
import { ApiKeyManager } from './translator/ApiKeyManager';
import TextTranslation from './translator/TextTranslation';
import DocumentTranslation from './translator/DocumentTranslation';
import { translatorColors } from '@/constants/translatorColors';
import { FileText, FileUp } from 'lucide-react';

type TranslationMode = 'text' | 'document';

interface TranslatorProps {
  onShowToast?: (message: string, type: 'success' | 'error') => void;
}

export const Translator: React.FC<TranslatorProps> = ({ onShowToast }) => {
  const [mode, setMode] = useState<TranslationMode>('text');
  const [selectedApiKey, setSelectedApiKey] = useState<string>('');
  const [showApiKeyManager, setShowApiKeyManager] = useState<boolean>(true);
  
  const handleError = (error: string) => {
    if (onShowToast) {
      onShowToast(error, 'error');
    } else {
      console.error('Translation Error:', error);
    }
  };

  const handleApiKeySelect = (apiKey: string) => {
    setSelectedApiKey(apiKey);
    setShowApiKeyManager(false);
    if (onShowToast) {
      onShowToast('API key selected successfully!', 'success');
    }
  };

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
        {/* API Key Section - Collapsed when key selected */}
        {selectedApiKey && !showApiKeyManager ? (
          <div style={{ marginBottom: '16px' }}>
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
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = translatorColors.primary.brightRed;
                e.currentTarget.style.color = translatorColors.text.dark;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = translatorColors.neutral.borderLight;
                e.currentTarget.style.color = translatorColors.text.gray;
              }}
            >
              <span>🔑</span>
              <span>API Key: {selectedApiKey.slice(0, 8)}...{selectedApiKey.slice(-3)}</span>
              <span style={{ marginLeft: 'auto', fontSize: '12px' }}>Click to change</span>
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: '24px' }}>
            <ApiKeyManager onKeySelect={handleApiKeySelect} />
          </div>
        )}

        {selectedApiKey && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <SegmentedControl
                options={[
                  { value: 'text', label: 'Teks', icon: <FileText size={16} /> },
                  { value: 'document', label: 'Dokumen', icon: <FileUp size={16} /> },
                ]}
                value={mode}
                onChange={(value) => setMode(value as TranslationMode)}
              />
            </div>

            {mode === 'text' ? (
              <TextTranslation
                apiKey={selectedApiKey}
                onError={handleError}
              />
            ) : (
              <DocumentTranslation
                apiKey={selectedApiKey}
                onError={handleError}
              />
            )}
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

import React, { useState } from 'react';
import { ArrowLeftRight, ChevronDown, Languages } from 'lucide-react';
import { SOURCE_LANGUAGES, TARGET_LANGUAGES, type Language } from '@/constants/languages';
import { translateText as apiTranslateText } from '@/services/deepLService';
import { translatorColors } from '@/constants/translatorColors';

interface TextTranslationProps {
  apiKey: string;
  onError?: (error: string) => void;
  className?: string;
}

export default function TextTranslation({ apiKey, onError, className = '' }: TextTranslationProps) {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('EN-US');
  const [targetLang, setTargetLang] = useState('ID');
  const [isLoading, setIsLoading] = useState(false);

  const charCount = sourceText.length;
  const maxChars = 5000;
  const isSwapDisabled = sourceLang === 'auto';

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      onError?.('Please enter text to translate');
      return;
    }

    if (charCount > maxChars) {
      onError?.(`Text exceeds ${maxChars} character limit`);
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiTranslateText({
        text: sourceText,
        sourceLang: sourceLang === 'auto' ? undefined : sourceLang,
        targetLang: targetLang,
        apiKey: apiKey,
      });
      setTranslatedText(result.translatedText);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Translation failed';
      onError?.(errorMessage);
      setTranslatedText('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = () => {
    if (isSwapDisabled) return;

    let newSourceLang = targetLang;
    let newTargetLang = sourceLang;

    if (newSourceLang === 'EN-US' || newSourceLang === 'EN-GB') {
      newSourceLang = 'EN';
    } else if (newSourceLang === 'PT-BR' || newSourceLang === 'PT-PT') {
      newSourceLang = 'PT';
    }

    if (newTargetLang === 'EN') {
      newTargetLang = 'EN-US';
    } else if (newTargetLang === 'PT') {
      newTargetLang = 'PT-BR';
    }

    setSourceLang(newSourceLang);
    setTargetLang(newTargetLang);

    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && !isLoading) {
      handleTranslate();
    }
  };

  return (
    <div className={className} style={{ padding: '16px' }}>
      <div
        style={{
          backgroundColor: translatorColors.neutral.warmGray,
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
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

          <button
            onClick={handleSwap}
            disabled={isSwapDisabled}
            aria-label="Swap languages"
            style={{
              padding: '12px',
              backgroundColor: translatorColors.neutral.white,
              border: `1px solid ${translatorColors.neutral.borderLight}`,
              borderRadius: '8px',
              cursor: isSwapDisabled ? 'not-allowed' : 'pointer',
              opacity: isSwapDisabled ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isSwapDisabled) {
                e.currentTarget.style.backgroundColor = translatorColors.interactive.hover;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = translatorColors.neutral.white;
            }}
          >
            <ArrowLeftRight size={20} color={translatorColors.text.gray} />
          </button>

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

        <div className="translation-content-grid">
          <style>{`
            .translation-content-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 16px;
            }

            @media (min-width: 992px) {
              .translation-content-grid {
                grid-template-columns: 1fr auto 1fr;
                align-items: stretch;
              }
            }

            .middle-action-separator {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 12px;
              padding: 8px 0;
            }

            .main-translate-btn {
              width: 100%;
              min-height: 56px;
              padding: 0 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
              background: ${translatorColors.primary.brightRed};
              color: white;
              border: none;
              border-radius: 12px;
              font-size: 18px;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.2s ease;
              box-shadow: ${translatorColors.shadow.medium};
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            @media (min-width: 992px) {
              .main-translate-btn {
                width: 64px;
                height: 100%;
                flex-direction: column;
                padding: 24px 0;
                border-radius: 32px;
              }
              
              .main-translate-btn span {
                writing-mode: vertical-lr;
                transform: rotate(180deg);
                margin: 12px 0;
              }
            }

            .main-translate-btn:hover:not(:disabled) {
              background: ${translatorColors.primary.deepRed};
              transform: scale(1.02);
              box-shadow: ${translatorColors.shadow.heavy};
            }

            .main-translate-btn:active:not(:disabled) {
              transform: scale(0.98);
            }

            .main-translate-btn:disabled {
              background: ${translatorColors.neutral.border};
              opacity: 0.6;
              cursor: not-allowed;
              box-shadow: none;
            }
          `}</style>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter text to translate..."
              aria-label="Source text"
              style={{
                height: '300px',
                padding: '20px',
                fontSize: '17px',
                lineHeight: '1.6',
                color: translatorColors.text.dark,
                backgroundColor: translatorColors.neutral.white,
                border: `1px solid ${translatorColors.neutral.borderLight}`,
                borderRadius: '12px',
                resize: 'none',
                outline: 'none',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            />
            <div
              style={{
                fontSize: '13px',
                color: charCount > maxChars ? translatorColors.accent.errorRed : translatorColors.text.gray,
                fontWeight: '600',
                marginTop: '8px',
                textAlign: 'right'
              }}
            >
              {charCount.toLocaleString()} / {maxChars.toLocaleString()}
            </div>
          </div>

          <div className="middle-action-separator">
            <button
              className="main-translate-btn"
              onClick={handleTranslate}
              disabled={isLoading || !sourceText.trim() || charCount > maxChars}
            >
              <Languages size={24} />
              <span>{isLoading ? '...' : 'Translate'}</span>
              <ChevronDown size={24} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <textarea
              value={translatedText}
              readOnly
              placeholder={isLoading ? 'Translating...' : 'Translation will appear here...'}
              aria-label="Translated text"
              style={{
                height: '300px',
                padding: '20px',
                fontSize: '17px',
                lineHeight: '1.6',
                color: translatorColors.text.dark,
                backgroundColor: translatorColors.neutral.white,
                border: `1px solid ${translatorColors.neutral.borderLight}`,
                borderRadius: '12px',
                resize: 'none',
                outline: 'none',
                cursor: 'default',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            />
            <div
              style={{
                fontSize: '12px',
                color: translatorColors.text.light,
                marginTop: '8px',
                textAlign: 'center',
              }}
            >
              Press Ctrl+Enter to translate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

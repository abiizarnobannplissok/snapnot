import React, { useState } from 'react';
import { ArrowLeftRight, ChevronDown, Languages } from 'lucide-react';
import { SOURCE_LANGUAGES, TARGET_LANGUAGES } from '@/constants/languages';
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
  const [sourceLang, setSourceLang] = useState('EN');
  const [targetLang, setTargetLang] = useState('ID');
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#D4FF00',
    color: '#000000',
    border: 'none',
    borderRadius: '20px',
    fontSize: '18px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    cursor: (isLoading || !sourceText.trim() || charCount > maxChars) ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isHovered && !isLoading ? '0 8px 25px rgba(212, 255, 0, 0.5)' : '0 4px 15px rgba(212, 255, 0, 0.3)',
    transform: isHovered && !isLoading ? 'scale(1.05)' : 'scale(1)',
    opacity: (isLoading || !sourceText.trim() || charCount > maxChars) ? 0.6 : 1,
    padding: '20px 32px',
    width: '100%',
    minHeight: '64px',
    zIndex: 50,
  };

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
              padding: '14px 18px',
              fontSize: '16px',
              fontWeight: '600',
              color: translatorColors.text.dark,
              backgroundColor: translatorColors.neutral.white,
              border: `1px solid ${translatorColors.neutral.border}`,
              borderRadius: '12px',
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
              padding: '14px',
              backgroundColor: translatorColors.neutral.white,
              border: `1px solid ${translatorColors.neutral.border}`,
              borderRadius: '12px',
              cursor: isSwapDisabled ? 'not-allowed' : 'pointer',
              opacity: isSwapDisabled ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            <ArrowLeftRight size={22} color={translatorColors.text.dark} />
          </button>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            aria-label="Target language"
            style={{
              flex: '1',
              minWidth: '150px',
              padding: '14px 18px',
              fontSize: '16px',
              fontWeight: '600',
              color: translatorColors.text.dark,
              backgroundColor: translatorColors.neutral.white,
              border: `1px solid ${translatorColors.neutral.border}`,
              borderRadius: '12px',
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

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter text to translate..."
              aria-label="Source text"
              style={{
                width: '100%',
                height: '250px',
                padding: '20px',
                fontSize: '18px',
                lineHeight: '1.6',
                color: '#000000',
                backgroundColor: '#FFFFFF',
                border: '2px solid #E5E5E5',
                borderRadius: '16px',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
              }}
            />
            <div style={{
              fontSize: '13px',
              color: charCount > maxChars ? '#FF3B30' : '#86868B',
              fontWeight: '600',
              marginTop: '8px',
              textAlign: 'right'
            }}>
              {charCount.toLocaleString()} / {maxChars.toLocaleString()}
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            padding: '10px 0'
          }}>
            <button
              onClick={handleTranslate}
              disabled={isLoading || !sourceText.trim() || charCount > maxChars}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={buttonStyle}
            >
              <Languages size={28} strokeWidth={2.5} />
              <span>{isLoading ? 'Translating...' : 'AI Translate'}</span>
              <ChevronDown size={28} strokeWidth={2.5} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <textarea
              value={translatedText}
              readOnly
              placeholder={isLoading ? 'Translating...' : 'Translation will appear here...'}
              aria-label="Translated text"
              style={{
                width: '100%',
                height: '250px',
                padding: '20px',
                fontSize: '18px',
                lineHeight: '1.6',
                color: '#000000',
                backgroundColor: '#FFFFFF',
                border: '2px solid #E5E5E5',
                borderRadius: '16px',
                outline: 'none',
                resize: 'none',
                cursor: 'default',
                fontFamily: 'inherit',
              }}
            />
            <div style={{
              fontSize: '12px',
              color: '#999999',
              marginTop: '8px',
              textAlign: 'center',
            }}>
              Press Ctrl+Enter to translate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
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
  const [sourceLang, setSourceLang] = useState('EN');
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
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter text to translate..."
              aria-label="Source text"
              style={{
                height: '300px',
                padding: '16px',
                fontSize: '16px',
                lineHeight: '1.5',
                color: translatorColors.text.dark,
                backgroundColor: translatorColors.neutral.white,
                border: `1px solid ${translatorColors.neutral.borderLight}`,
                borderRadius: '8px',
                resize: 'vertical',
                outline: 'none',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <textarea
              value={translatedText}
              readOnly
              placeholder={isLoading ? 'Translating...' : 'Translation will appear here...'}
              aria-label="Translated text"
              style={{
                height: '300px',
                padding: '16px',
                fontSize: '16px',
                lineHeight: '1.5',
                color: translatorColors.text.dark,
                backgroundColor: translatorColors.neutral.white,
                border: `1px solid ${translatorColors.neutral.borderLight}`,
                borderRadius: '8px',
                resize: 'vertical',
                outline: 'none',
                cursor: 'default',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              color: charCount > maxChars ? translatorColors.accent.errorRed : translatorColors.text.gray,
              fontWeight: '500',
            }}
          >
            {charCount} / {maxChars}
          </div>

          <button
            onClick={handleTranslate}
            disabled={isLoading || !sourceText.trim() || charCount > maxChars}
            aria-label="Translate text"
            style={{
              padding: '0 32px',
              height: '44px',
              fontSize: '16px',
              fontWeight: '600',
              color: translatorColors.neutral.white,
              backgroundColor: translatorColors.primary.brightRed,
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading || !sourceText.trim() || charCount > maxChars ? 'not-allowed' : 'pointer',
              opacity: isLoading || !sourceText.trim() || charCount > maxChars ? 0.6 : 1,
              transition: 'all 0.2s',
              boxShadow: translatorColors.shadow.light,
            }}
            onMouseEnter={(e) => {
              if (!isLoading && sourceText.trim() && charCount <= maxChars) {
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
            {isLoading ? 'Translating...' : 'Translate'}
          </button>
        </div>

        <div
          style={{
            fontSize: '12px',
            color: translatorColors.text.light,
            textAlign: 'center',
          }}
        >
          Press Ctrl+Enter to translate
        </div>
      </div>
    </div>
  );
}

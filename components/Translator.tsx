import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftRight, Copy, X, Loader2, Languages, AlertCircle } from 'lucide-react';
import { ApiKeyConfig } from './ApiKeyConfig';
import { LanguageSelector } from './LanguageSelector';
import { SOURCE_LANGUAGES, TARGET_LANGUAGES } from '../constants/languages';
import { translateText, getApiKey } from '../services/deepLService';

interface TranslatorProps {
  onShowToast?: (message: string, type: 'success' | 'error') => void;
}

export const Translator: React.FC<TranslatorProps> = ({ onShowToast }) => {
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('EN-US');
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);

  const sourceTextareaRef = useRef<HTMLTextAreaElement>(null);
  const targetTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedKey = getApiKey();
    if (savedKey) {
      setApiKey(savedKey);
      setIsApiKeyValid(true);
    }
  }, []);

  // Auto-resize textareas
  useEffect(() => {
    if (sourceTextareaRef.current) {
      sourceTextareaRef.current.style.height = 'auto';
      sourceTextareaRef.current.style.height = `${Math.max(200, sourceTextareaRef.current.scrollHeight)}px`;
    }
  }, [sourceText]);

  useEffect(() => {
    if (targetTextareaRef.current) {
      targetTextareaRef.current.style.height = 'auto';
      targetTextareaRef.current.style.height = `${Math.max(200, targetTextareaRef.current.scrollHeight)}px`;
    }
  }, [targetText]);

  const getCharacterCount = () => {
    const count = sourceText.length;
    const max = 5000;
    const percentage = (count / max) * 100;

    let color = '#666666';
    if (percentage > 96) color = '#EF4444';
    else if (percentage > 90) color = '#F59E0B';

    return { count, max, color, isOverLimit: count > max };
  };

  const handleTranslate = async () => {
    if (!apiKey) {
      onShowToast?.('Please set your API key first', 'error');
      return;
    }

    if (!sourceText.trim()) {
      onShowToast?.('Please enter text to translate', 'error');
      return;
    }

    const { isOverLimit } = getCharacterCount();
    if (isOverLimit) {
      onShowToast?.('Text exceeds 5000 character limit', 'error');
      return;
    }

    if (sourceLang !== 'auto' && sourceLang === targetLang.split('-')[0]) {
      onShowToast?.('Source and target language cannot be the same', 'error');
      return;
    }

    setIsTranslating(true);
    setDetectedLanguage(null);

    try {
      const result = await translateText({
        text: sourceText,
        sourceLang: sourceLang === 'auto' ? undefined : sourceLang,
        targetLang: targetLang,
        apiKey: apiKey,
      });

      setTargetText(result.translatedText);
      if (result.detectedLanguage) {
        setDetectedLanguage(result.detectedLanguage);
      }
      onShowToast?.('Translation completed!', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Translation failed';
      onShowToast?.(message, 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') {
      onShowToast?.('Cannot swap with auto-detect', 'error');
      return;
    }

    // Swap languages
    const tempLang = sourceLang;
    setSourceLang(targetLang.split('-')[0]);
    setTargetLang(tempLang === 'EN' ? 'EN-US' : tempLang);

    // Swap texts
    const tempText = sourceText;
    setSourceText(targetText);
    setTargetText(tempText);
  };

  const handleClearAll = () => {
    setSourceText('');
    setTargetText('');
    setDetectedLanguage(null);
  };

  const handleCopyToClipboard = async () => {
    if (!targetText) return;

    try {
      await navigator.clipboard.writeText(targetText);
      onShowToast?.('Copied to clipboard!', 'success');
    } catch (error) {
      onShowToast?.('Failed to copy', 'error');
    }
  };

  const handlePasteText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSourceText(text);
    } catch (error) {
      onShowToast?.('Failed to paste. Please paste manually.', 'error');
    }
  };

  const charInfo = getCharacterCount();

  const canTranslate = apiKey && sourceText.trim() && !charInfo.isOverLimit && !isTranslating;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (canTranslate) {
          handleTranslate();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handleClearAll();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSwapLanguages();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canTranslate, sourceLang, sourceText, targetText]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
      {/* Hero Section */}
      <div className="text-center mb-8 md:mb-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Languages className="w-12 h-12 text-[#95E1D3]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">AI Text Translator</h1>
        <p className="text-lg text-[#666666] mb-4">
          Translate text dengan akurasi tinggi menggunakan DeepL
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#95E1D3]/10 rounded-full text-sm font-medium text-[#2C7A6B]">
          <span>Powered by DeepL</span>
        </div>
      </div>

      {/* API Key Configuration */}
      <div className="mb-8">
        <ApiKeyConfig
          onApiKeyChange={setApiKey}
          onValidationStatusChange={setIsApiKeyValid}
        />
      </div>

      {/* Empty State when no API key */}
      {!apiKey && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#E5E5E5]">
          <div className="text-6xl mb-4">🔑</div>
          <h3 className="text-2xl font-semibold mb-3">API Key Required</h3>
          <p className="text-[#666666] text-base mb-6 max-w-md mx-auto">
            Please enter your DeepL API key above to start translating
          </p>
          <a
            href="https://www.deepl.com/pro-api"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 text-base bg-[#95E1D3] text-black font-medium rounded-xl hover:bg-[#81CABB] transition-colors"
          >
            Get Free API Key
          </a>
        </div>
      )}

      {/* Main Translator */}
      {apiKey && (
        <div className="bg-white rounded-2xl p-5 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#E5E5E5]">
          {/* Language Selection */}
          <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4 mb-5">
            <LanguageSelector
              languages={SOURCE_LANGUAGES}
              selectedLanguage={sourceLang}
              onLanguageChange={setSourceLang}
              label="Source Language"
              ariaLabel="Source language selector"
            />

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwapLanguages}
              disabled={sourceLang === 'auto'}
              className={`
                md:mb-[22px] h-11 w-11 mx-auto md:mx-0 rounded-full flex items-center justify-center transition-all
                ${sourceLang === 'auto'
                  ? 'bg-[#E5E5E5] text-[#999999] cursor-not-allowed'
                  : 'bg-[#F5F5F5] text-black hover:bg-[#95E1D3] hover:text-black active:rotate-180'
                }
              `}
              style={{ transition: 'all 0.3s ease' }}
              aria-label="Swap languages"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>

            <LanguageSelector
              languages={TARGET_LANGUAGES}
              selectedLanguage={targetLang}
              onLanguageChange={setTargetLang}
              label="Target Language"
              ariaLabel="Target language selector"
            />
          </div>

          {/* Detected Language Info */}
          {detectedLanguage && sourceLang === 'auto' && (
            <div className="mb-4 flex items-center gap-2 text-sm text-[#666666]">
              <AlertCircle className="w-4 h-4" />
              <span>Detected language: {detectedLanguage}</span>
            </div>
          )}

          {/* Text Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Source Textarea */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#666666]">
                  Source Text
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePasteText}
                    className="text-xs text-[#95E1D3] hover:text-[#81CABB] font-medium transition-colors"
                    aria-label="Paste from clipboard"
                  >
                    📋 Paste
                  </button>
                  {sourceText && (
                    <button
                      type="button"
                      onClick={() => setSourceText('')}
                      className="text-xs text-[#EF4444] hover:text-[#DC2626] font-medium transition-colors"
                      aria-label="Clear source text"
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="relative">
                <textarea
                  ref={sourceTextareaRef}
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Masukkan text yang ingin ditranslate..."
                  className="w-full min-h-[180px] max-h-[360px] p-4 rounded-xl border border-[#E5E5E5] focus:border-[#95E1D3] focus:outline-none resize-none text-base leading-relaxed"
                  style={{ lineHeight: '1.6' }}
                  aria-label="Source text input"
                />
                <div
                  className="absolute bottom-3 right-3 text-xs font-medium px-2 py-1 rounded"
                  style={{
                    color: charInfo.color,
                    backgroundColor: charInfo.isOverLimit ? '#FEE2E2' : 'transparent',
                  }}
                >
                  {charInfo.count} / {charInfo.max}
                </div>
              </div>
            </div>

            {/* Target Textarea */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#666666]">
                  Translated Text
                </label>
                {targetText && (
                  <button
                    type="button"
                    onClick={handleCopyToClipboard}
                    className="text-xs text-[#95E1D3] hover:text-[#81CABB] font-medium transition-colors flex items-center gap-1.5"
                    aria-label="Copy translated text"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                )}
              </div>
              <textarea
                ref={targetTextareaRef}
                value={targetText}
                readOnly
                placeholder="Hasil translate akan muncul di sini..."
                className="w-full min-h-[180px] max-h-[360px] p-4 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] resize-none text-base leading-relaxed cursor-default"
                style={{ lineHeight: '1.6' }}
                aria-label="Translated text output"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleTranslate}
              disabled={!canTranslate}
              className={`
                flex-1 h-11 rounded-xl font-medium text-base flex items-center justify-center gap-2 transition-all
                ${canTranslate
                  ? 'bg-[#95E1D3] text-black hover:bg-[#81CABB] active:scale-[0.98]'
                  : 'bg-[#CCCCCC] text-white cursor-not-allowed'
                }
              `}
              aria-label="Translate text"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <Languages className="w-5 h-5" />
                  <span>Translate</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              disabled={!sourceText && !targetText}
              className={`
                sm:w-[140px] h-11 rounded-xl font-medium text-base flex items-center justify-center gap-2 transition-all
                ${sourceText || targetText
                  ? 'bg-white text-[#666666] border border-[#E5E5E5] hover:bg-[#F5F5F5] active:scale-[0.98]'
                  : 'bg-white text-[#CCCCCC] border border-[#E5E5E5] cursor-not-allowed'
                }
              `}
              aria-label="Clear all text"
            >
              <X className="w-5 h-5" />
              <span>Clear All</span>
            </button>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="mt-5 pt-5 border-t border-[#E5E5E5]">
            <p className="text-xs text-[#999999] text-center">
              Shortcuts: <span className="font-medium">Ctrl/⌘ + Enter</span> to translate • 
              <span className="font-medium"> Ctrl/⌘ + K</span> to clear • 
              <span className="font-medium"> Ctrl/⌘ + S</span> to swap
            </p>
          </div>

          {/* Quick Tips */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 bg-[#F5F5F5] rounded-xl">
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-xs font-semibold mb-1">Free Quota</p>
                <p className="text-xs text-[#666666]">API key gratis bisa translate 500,000 char/bulan</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-[#F5F5F5] rounded-xl">
              <span className="text-2xl">🌐</span>
              <div>
                <p className="text-xs font-semibold mb-1">Auto-Detect</p>
                <p className="text-xs text-[#666666]">Gunakan auto-detect untuk deteksi bahasa otomatis</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-[#F5F5F5] rounded-xl">
              <span className="text-2xl">⇄</span>
              <div>
                <p className="text-xs font-semibold mb-1">Swap Languages</p>
                <p className="text-xs text-[#666666]">Klik tombol swap untuk tukar bahasa cepat</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

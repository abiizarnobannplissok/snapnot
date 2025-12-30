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
    <div className="max-w-[1200px] mx-auto px-3 md:px-6 py-6">
      {/* Hero Section */}
      <div className="text-center mb-6 md:mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Languages className="w-10 h-10 text-[#95E1D3]" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">AI Text Translator</h1>
        <p className="text-base text-[#666666] mb-3">
          Translate text dengan akurasi tinggi menggunakan DeepL
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#95E1D3]/10 rounded-full text-xs font-medium text-[#2C7A6B]">
          <span>Powered by DeepL</span>
        </div>
      </div>

      {/* API Key Configuration */}
      <div className="mb-6">
        <ApiKeyConfig
          onApiKeyChange={setApiKey}
          onValidationStatusChange={setIsApiKeyValid}
        />
      </div>

      {/* Empty State when no API key */}
      {!apiKey && (
        <div className="bg-white rounded-xl p-10 text-center shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#E5E5E5]">
          <div className="text-5xl mb-3">🔑</div>
          <h3 className="text-xl font-semibold mb-2">API Key Required</h3>
          <p className="text-[#666666] text-sm mb-5 max-w-md mx-auto">
            Please enter your DeepL API key above to start translating
          </p>
          <a
            href="https://www.deepl.com/pro-api"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm bg-[#95E1D3] text-black font-medium rounded-lg hover:bg-[#81CABB] transition-colors"
          >
            Get Free API Key
          </a>
        </div>
      )}

      {/* Main Translator */}
      {apiKey && (
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#E5E5E5]">
          {/* Language Selection */}
          <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3 mb-4">
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
                md:mb-[22px] h-10 w-10 mx-auto md:mx-0 rounded-full flex items-center justify-center transition-all
                ${sourceLang === 'auto'
                  ? 'bg-[#E5E5E5] text-[#999999] cursor-not-allowed'
                  : 'bg-[#F5F5F5] text-black hover:bg-[#95E1D3] hover:text-black active:rotate-180'
                }
              `}
              style={{ transition: 'all 0.3s ease' }}
              aria-label="Swap languages"
            >
              <ArrowLeftRight className="w-4 h-4" />
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
            <div className="mb-3 flex items-center gap-1.5 text-xs text-[#666666]">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Detected language: {detectedLanguage}</span>
            </div>
          )}

          {/* Text Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Source Textarea */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#666666]">
                  Source Text
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePasteText}
                    className="text-[10px] text-[#95E1D3] hover:text-[#81CABB] font-medium transition-colors"
                    aria-label="Paste from clipboard"
                  >
                    📋 Paste
                  </button>
                  {sourceText && (
                    <button
                      type="button"
                      onClick={() => setSourceText('')}
                      className="text-[10px] text-[#EF4444] hover:text-[#DC2626] font-medium transition-colors"
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
                  className="w-full min-h-[160px] max-h-[320px] p-3 rounded-lg border border-[#E5E5E5] focus:border-[#95E1D3] focus:outline-none resize-none text-sm leading-relaxed"
                  style={{ lineHeight: '1.6' }}
                  aria-label="Source text input"
                />
                <div
                  className="absolute bottom-2 right-2 text-[10px] font-medium px-1.5 py-0.5 rounded"
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#666666]">
                  Translated Text
                </label>
                {targetText && (
                  <button
                    type="button"
                    onClick={handleCopyToClipboard}
                    className="text-[10px] text-[#95E1D3] hover:text-[#81CABB] font-medium transition-colors flex items-center gap-1"
                    aria-label="Copy translated text"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    Copy
                  </button>
                )}
              </div>
              <textarea
                ref={targetTextareaRef}
                value={targetText}
                readOnly
                placeholder="Hasil translate akan muncul di sini..."
                className="w-full min-h-[160px] max-h-[320px] p-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] resize-none text-sm leading-relaxed cursor-default"
                style={{ lineHeight: '1.6' }}
                aria-label="Translated text output"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleTranslate}
              disabled={!canTranslate}
              className={`
                flex-1 h-10 rounded-lg font-medium text-sm flex items-center justify-center gap-1.5 transition-all
                ${canTranslate
                  ? 'bg-[#95E1D3] text-black hover:bg-[#81CABB] active:scale-[0.98]'
                  : 'bg-[#CCCCCC] text-white cursor-not-allowed'
                }
              `}
              aria-label="Translate text"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <Languages className="w-4 h-4" />
                  <span>Translate</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              disabled={!sourceText && !targetText}
              className={`
                sm:w-[120px] h-10 rounded-lg font-medium text-sm flex items-center justify-center gap-1.5 transition-all
                ${sourceText || targetText
                  ? 'bg-white text-[#666666] border border-[#E5E5E5] hover:bg-[#F5F5F5] active:scale-[0.98]'
                  : 'bg-white text-[#CCCCCC] border border-[#E5E5E5] cursor-not-allowed'
                }
              `}
              aria-label="Clear all text"
            >
              <X className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
            <p className="text-[10px] text-[#999999] text-center">
              Shortcuts: <span className="font-medium">Ctrl/⌘ + Enter</span> to translate • 
              <span className="font-medium"> Ctrl/⌘ + K</span> to clear • 
              <span className="font-medium"> Ctrl/⌘ + S</span> to swap
            </p>
          </div>

          {/* Quick Tips */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-start gap-2 p-3 bg-[#F5F5F5] rounded-lg">
              <span className="text-xl">💡</span>
              <div>
                <p className="text-[10px] font-semibold mb-0.5">Free Quota</p>
                <p className="text-[10px] text-[#666666]">API key gratis bisa translate 500,000 char/bulan</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-[#F5F5F5] rounded-lg">
              <span className="text-xl">🌐</span>
              <div>
                <p className="text-[10px] font-semibold mb-0.5">Auto-Detect</p>
                <p className="text-[10px] text-[#666666]">Gunakan auto-detect untuk deteksi bahasa otomatis</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-[#F5F5F5] rounded-lg">
              <span className="text-xl">⇄</span>
              <div>
                <p className="text-[10px] font-semibold mb-0.5">Swap Languages</p>
                <p className="text-[10px] text-[#666666]">Klik tombol swap untuk tukar bahasa cepat</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

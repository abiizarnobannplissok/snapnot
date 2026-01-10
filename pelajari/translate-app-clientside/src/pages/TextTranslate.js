import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import axios from 'axios';
import { Type, Languages, Copy, Repeat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import ApiKeyManager from '@/components/ApiKeyManager';
import '@/App.css';

// Cloudflare Worker Proxy Configuration
const WORKER_URL = process.env.REACT_APP_WORKER_URL || 'https://translate-proxy.yumtive.workers.dev';

function TextTranslate() {
  const [languages, setLanguages] = useState([]);
  const [sourceLanguage, setSourceLanguage] = useState('ID');
  const [targetLanguage, setTargetLanguage] = useState('EN-US');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [deeplApiKey, setDeeplApiKey] = useState('');
  const [charCount, setCharCount] = useState(0);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('deepl_api_key');
    if (savedApiKey) {
      setDeeplApiKey(savedApiKey);
    }
  }, []);

  const handleApiKeyChange = useCallback((newApiKey) => {
    setDeeplApiKey(newApiKey);
  }, []);

  // Helper functions MUST BE BEFORE useEffect that uses them
  const getDefaultLanguages = useMemo(() => () => {
    return [
      { code: 'ID', name: 'Indonesia', supports_formality: false },
      { code: 'EN-US', name: 'Inggris (Amerika)', supports_formality: false }
    ];
  }, []);

  const getLanguageName = useMemo(() => (code, fallbackName) => {
    const nameMap = {
      'ID': 'Indonesia',
      'EN': 'Inggris',
      'EN-US': 'Inggris (Amerika)',
      'EN-GB': 'Inggris (British)'
    };
    return nameMap[code] || fallbackName || code;
  }, []);

  // Character count effect
  useEffect(() => {
    setCharCount(sourceText.length);
  }, [sourceText]);

  // Fetch languages - Optimized with AbortController
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchLanguages = async () => {
      if (!deeplApiKey) {
        setLanguages(getDefaultLanguages());
        return;
      }

      try {
        const response = await axios.get(`${WORKER_URL}/languages`, {
          headers: { 'X-DeepL-API-Key': deeplApiKey },
          signal: controller.signal
        });
        
        // Filter only Indonesian and English (US) - exactly 2 languages
        const allowedLanguages = ['ID', 'EN-US'];
        
        const mappedLanguages = response.data
          .filter(lang => allowedLanguages.includes(lang.language))
          .map(lang => ({
            code: lang.language,
            name: getLanguageName(lang.language, lang.name),
            supports_formality: lang.supports_formality || false
          }));
        
        setLanguages(mappedLanguages);
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('Error fetching languages:', error);
          setLanguages(getDefaultLanguages());
        }
      }
    };

    fetchLanguages();
    
    return () => controller.abort();
  }, [deeplApiKey, getDefaultLanguages, getLanguageName]);

  const translateText = useCallback(async () => {
    if (!sourceText.trim()) {
      toast.error('Silakan masukkan teks yang ingin diterjemahkan');
      return;
    }

    // Validate: Source and target language cannot be the same
    if (sourceLanguage === targetLanguage) {
      toast.error('Bahasa asal dan target harus berbeda!');
      return;
    }

    // Validate: Check for language base match (EN, EN-US, EN-GB are same base)
    const sourceBase = sourceLanguage.split('-')[0];
    const targetBase = targetLanguage.split('-')[0];
    if (sourceBase === targetBase && sourceLanguage !== 'auto') {
      const sourceName = getLanguageName(sourceLanguage, sourceLanguage);
      const targetName = getLanguageName(targetLanguage, targetLanguage);
      toast.error(`Bahasa sama! ${sourceName} → ${targetName} tidak valid. Silakan pilih bahasa yang berbeda.`);
      return;
    }

    setIsTranslating(true);
    setTranslatedText('');

    try {
      const response = await axios.post(
        `${WORKER_URL}/translate/text`,
        {
          text: sourceText,
          target_lang: targetLanguage,
          source_lang: sourceLanguage !== 'auto' ? sourceLanguage : undefined
        },
        {
          headers: {
            'X-DeepL-API-Key': deeplApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      setTranslatedText(response.data.translations[0].text);
      toast.success('Terjemahan berhasil!');
    } catch (error) {
      console.error('Translation error:', error);
      
      let errorMessage = 'Terjemahan gagal. Silakan coba lagi.';
      
      if (error.response?.status === 400) {
        errorMessage = 'Parameter tidak valid. Pastikan bahasa asal dan target berbeda!';
      } else if (error.response?.status === 403) {
        errorMessage = 'API Key tidak valid. Silakan periksa kembali API Key Anda.';
      } else if (error.response?.status === 456) {
        errorMessage = 'Kuota terjemahan habis. Limit: 500,000 karakter/bulan. Cek: https://www.deepl.com/account/usage';
      } else if (error.response?.status === 500) {
        errorMessage = 'Internal Server Error. Kemungkinan bahasa asal dan target sama, atau DeepL API sedang down.';
      } else if (error.response?.status === 529) {
        errorMessage = 'Terlalu banyak request. Tunggu beberapa detik lalu coba lagi.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, { duration: 8000 });
    } finally {
      setIsTranslating(false);
    }
  }, [sourceText, sourceLanguage, targetLanguage, deeplApiKey]);

  const swapLanguages = useCallback(() => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
    
    // Swap text if both exist
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  }, [sourceLanguage, targetLanguage, sourceText, translatedText]);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    toast.success('Teks berhasil disalin!');
  }, []);


  return (
    <>
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid gap-6">
          
          {/* Modern Text Translation Interface */}
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Type className="h-6 w-6 text-blue-500" />
                Translate Teks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Language Selection Bar - Compact & Modern */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex-1">
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                    <SelectTrigger className="bg-white border-blue-200 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">🔍 Deteksi Otomatis</SelectItem>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={swapLanguages}
                  className="shrink-0 h-11 w-11 hover:bg-white hover:scale-110 transition-transform"
                  title="Tukar bahasa"
                >
                  <Repeat className="h-5 w-5 text-blue-600" />
                </Button>

                <div className="flex-1">
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger className="bg-white border-blue-200 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Translate Button - Desktop with Animation */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden md:block shrink-0"
                >
                  <Button
                    onClick={translateText}
                    disabled={!sourceText || isTranslating}
                    className="h-11 px-6 bg-blue-500 hover:bg-blue-600 gap-2 flex items-center"
                  >
                    {isTranslating ? (
                      <>
                        <Languages className="h-5 w-5 animate-spin" />
                        <span>Menerjemahkan...</span>
                      </>
                    ) : (
                      <>
                        <Languages className="h-5 w-5" />
                        <span>Terjemahkan</span>
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>

              {/* Translate Button - Mobile (Below language selector) with Animation */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="md:hidden w-full"
              >
                <Button
                  onClick={translateText}
                  disabled={!sourceText || isTranslating}
                  className="w-full h-12 text-base font-medium bg-blue-500 hover:bg-blue-600"
                >
                  {isTranslating ? (
                    <>
                      <Languages className="mr-2 h-5 w-5 animate-spin" />
                      Menerjemahkan...
                    </>
                  ) : (
                    <>
                      <Languages className="mr-2 h-5 w-5" />
                      Terjemahkan Teks
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Side by Side Text Areas */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Source Text - Left */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Teks Sumber
                    </label>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {charCount} karakter
                    </span>
                  </div>
                  <Textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Paste atau ketik teks di sini..."
                    className="min-h-[350px] resize-none bg-white border-2 border-gray-200 focus:border-blue-400 transition-colors text-base leading-relaxed"
                    disabled={isTranslating}
                  />
                  <Button
                    onClick={() => setSourceText('')}
                    variant="outline"
                    size="sm"
                    className="w-full border-gray-300 hover:bg-gray-50"
                    disabled={!sourceText || isTranslating}
                  >
                    Hapus Teks
                  </Button>
                </div>

                {/* Translated Text - Right with Animation */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Hasil Terjemahan
                    </label>
                    <AnimatePresence>
                      {translatedText && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded"
                        >
                          {translatedText.length} karakter
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <AnimatePresence mode="wait">
                    {translatedText ? (
                      <motion.div
                        key="translated"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        <Textarea
                          value={translatedText}
                          readOnly
                          placeholder="Hasil terjemahan akan muncul di sini..."
                          className="min-h-[350px] resize-none bg-gradient-to-br from-gray-50 to-blue-50/30 border-2 border-gray-200 text-base leading-relaxed"
                        />
                      </motion.div>
                    ) : (
                      <Textarea
                        value={translatedText}
                        readOnly
                        placeholder="Hasil terjemahan akan muncul di sini..."
                        className="min-h-[350px] resize-none bg-gradient-to-br from-gray-50 to-blue-50/30 border-2 border-gray-200 text-base leading-relaxed"
                      />
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {translatedText && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Button
                          onClick={() => copyToClipboard(translatedText)}
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 border-green-300 hover:bg-green-50 hover:border-green-400 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                          Salin Terjemahan
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* API Key Management Section */}
          <ApiKeyManager onApiKeyChange={handleApiKeyChange} />

        </div>
      </main>
    </>
  );
}

export default memo(TextTranslate);

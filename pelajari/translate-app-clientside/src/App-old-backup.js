import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Download, FileText, Languages, CheckCircle, XCircle, Loader2, RotateCcw, KeyRound, AlertTriangle, Copy } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Progress } from './components/ui/progress';
import { Alert, AlertDescription } from './components/ui/alert';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { toast } from 'sonner';
import './App.css';
import { Popover, PopoverTrigger, PopoverContent } from './components/ui/popover';
import { Input } from './components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

// Cloudflare Worker Proxy Configuration
// TODO: Replace with your deployed Cloudflare Worker URL after deployment
const WORKER_URL = process.env.REACT_APP_WORKER_URL || 'http://localhost:8787';
// For local testing: http://localhost:8787
// After deploy: https://your-worker.your-subdomain.workers.dev

function App() {
  const [languages, setLanguages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sourceLanguage, setSourceLanguage] = useState('ID');
  const [targetLanguage, setTargetLanguage] = useState('EN-US');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [translatedFile, setTranslatedFile] = useState(null);
  const [translationError, setTranslationError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [deeplApiKey, setDeeplApiKey] = useState(() => localStorage.getItem('deeplApiKey') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(deeplApiKey);
  
  // Hardcoded API Keys for personal use
  const predefinedApiKeys = [
    {
      id: '1',
      name: 'Abii',
      key: 'f381117b-94e6-4574-ad84-bad48a5b63ed:fx'
    },
    {
      id: '2',
      name: 'Valda',
      key: '2bc8a00a-3238-42d3-a569-490a3dcb31ae:fx'
    },
    {
      id: '3',
      name: 'Azzahra',
      key: 'bf66784d-823d-4503-87de-be73bf3e6657:fx'
    }
  ];

  useEffect(() => {
    localStorage.setItem('deeplApiKey', deeplApiKey);
  }, [deeplApiKey]);

  // Simplified API Key functions for predefined keys
  const copyApiKey = (key) => {
    navigator.clipboard.writeText(key.key);
    toast.success(`API Key "${key.name}" disalin ke clipboard!`);
  };

  // Fetch available languages from Worker proxy
  useEffect(() => {
    const fetchLanguages = async () => {
      if (!deeplApiKey) {
        // Use default languages if no API key
        setLanguages(getDefaultLanguages());
        return;
      }

      try {
        const response = await axios.get(
          `${WORKER_URL}/languages`,
          {
            headers: {
              'X-DeepL-API-Key': deeplApiKey,
            },
          }
        );
        // Map DeepL response to our format
        const mappedLanguages = response.data.map(lang => ({
          code: lang.language,
          name: getLanguageName(lang.language, lang.name),
          supports_formality: lang.supports_formality || false
        }));
        
        setLanguages(mappedLanguages);
      } catch (error) {
        console.error('Error fetching languages:', error);
        toast.error('Gagal memuat bahasa. Menggunakan daftar default.');
        setLanguages(getDefaultLanguages());
      }
    };
    fetchLanguages();
  }, [deeplApiKey]);

  // Helper function to get default languages
  const getDefaultLanguages = () => {
    return [
      { code: 'AR', name: 'Arab', supports_formality: false },
      { code: 'NL', name: 'Belanda', supports_formality: true },
      { code: 'ID', name: 'Indonesia', supports_formality: false },
      { code: 'EN-US', name: 'Inggris (Amerika)', supports_formality: true },
      { code: 'EN-GB', name: 'Inggris (Britania)', supports_formality: true },
      { code: 'IT', name: 'Italia', supports_formality: true },
      { code: 'JA', name: 'Jepang', supports_formality: true },
      { code: 'DE', name: 'Jerman', supports_formality: true },
      { code: 'KO', name: 'Korea', supports_formality: false },
      { code: 'ZH', name: 'Mandarin (Sederhana)', supports_formality: false },
      { code: 'PT-PT', name: 'Portugis', supports_formality: true },
      { code: 'PT-BR', name: 'Portugis (Brasil)', supports_formality: true },
      { code: 'FR', name: 'Prancis', supports_formality: true },
      { code: 'RU', name: 'Rusia', supports_formality: true },
      { code: 'ES', name: 'Spanyol', supports_formality: true },
    ];
  };

  // Helper function to get Indonesian language names
  const getLanguageName = (code, originalName) => {
    const nameMap = {
      'AR': 'Arab',
      'NL': 'Belanda',
      'ID': 'Indonesia',
      'EN-US': 'Inggris (Amerika)',
      'EN-GB': 'Inggris (Britania)',
      'EN': 'Inggris',
      'IT': 'Italia',
      'JA': 'Jepang',
      'DE': 'Jerman',
      'KO': 'Korea',
      'ZH': 'Mandarin (Sederhana)',
      'PT-PT': 'Portugis',
      'PT-BR': 'Portugis (Brasil)',
      'FR': 'Prancis',
      'RU': 'Rusia',
      'ES': 'Spanyol',
    };
    return nameMap[code] || originalName;
  };

  const handleFileSelect = (file) => {
    // Validate file type
    const allowedTypes = ['.pdf', '.docx', '.doc'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error('File type not supported. Please upload PDF or DOCX files only.');
      return;
    }

    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 50MB.');
      return;
    }

    setSelectedFile(file);
    setTranslatedFile(null);
    setTranslationError(null);
    toast.success(`File "${file.name}" selected successfully`);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const startTranslation = async () => {
    if (!deeplApiKey) {
      toast.error('Silakan masukkan DeepL API Key terlebih dahulu!');
      return;
    }

    if (!selectedFile) {
      toast.error('Silakan pilih file terlebih dahulu');
      return;
    }

    if (sourceLanguage === targetLanguage) {
      toast.error('Bahasa asal dan target harus berbeda');
      return;
    }

    setIsTranslating(true);
    setTranslationProgress(0);
    setTranslationError(null);
    setTranslatedFile(null);

    try {
      // Step 1: Upload document to DeepL
      setTranslationProgress(10);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('target_lang', targetLanguage);
      
      if (sourceLanguage && sourceLanguage !== 'auto') {
        formData.append('source_lang', sourceLanguage);
      }

      const uploadResponse = await axios.post(
        `${WORKER_URL}/document/upload`,
        formData,
        {
          headers: {
            'X-DeepL-API-Key': deeplApiKey,
          },
        }
      );

      const { document_id, document_key } = uploadResponse.data;
      setTranslationProgress(25);
      toast.success('File berhasil diupload, sedang menerjemahkan...');

      // Step 2: Poll translation status
      let translationComplete = false;
      let attempts = 0;
      const maxAttempts = 60; // 60 attempts * 2 seconds = 2 minutes max

      while (!translationComplete && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        
        const statusResponse = await axios.post(
          `${WORKER_URL}/document/${document_id}/status`,
          new URLSearchParams({ document_key }),
          {
            headers: {
              'X-DeepL-API-Key': deeplApiKey,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );

        const status = statusResponse.data.status;
        
        if (status === 'done') {
          translationComplete = true;
          setTranslationProgress(75);
        } else if (status === 'error') {
          throw new Error(statusResponse.data.message || 'Terjemahan gagal');
        } else if (status === 'translating') {
          // Update progress
          const progress = Math.min(25 + (attempts * 2), 70);
          setTranslationProgress(progress);
        }
        
        attempts++;
      }

      if (!translationComplete) {
        throw new Error('Timeout: Terjemahan memakan waktu terlalu lama');
      }

      // Step 3: Download translated document
      setTranslationProgress(80);
      const downloadResponse = await axios.post(
        `${WORKER_URL}/document/${document_id}/download`,
        new URLSearchParams({ document_key }),
        {
          headers: {
            'X-DeepL-API-Key': deeplApiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          responseType: 'blob',
        }
      );

      // Create file blob
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.'));
      const translatedFileName = `${selectedFile.name.replace(fileExtension, '')}_${targetLanguage}${fileExtension}`;
      
      const translatedFileBlob = new File(
        [downloadResponse.data],
        translatedFileName,
        { type: selectedFile.type }
      );

      setTranslatedFile(translatedFileBlob);
      setTranslationProgress(100);
      setIsTranslating(false);
      toast.success('Terjemahan berhasil! Silakan download file hasil terjemahan.');
      
    } catch (error) {
      setIsTranslating(false);
      setTranslationProgress(0);
      console.error('Translation error:', error);
      
      let errorMessage = 'Terjemahan gagal. Silakan coba lagi.';
      
      if (error.response?.status === 403) {
        errorMessage = 'API Key tidak valid. Silakan periksa kembali API Key Anda.';
      } else if (error.response?.status === 456) {
        errorMessage = 'Kuota terjemahan habis. Silakan upgrade akun DeepL Anda.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setTranslationError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const downloadTranslatedFile = () => {
    if (!translatedFile) return;

    try {
      const url = window.URL.createObjectURL(translatedFile);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', translatedFile.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('File berhasil didownload!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Gagal mendownload file');
    }
  };

  const resetTranslation = () => {
    setSelectedFile(null);
    setTranslatedFile(null);
    setTranslationError(null);
    setIsTranslating(false);
    setTranslationProgress(0);
  };

  const getDisplayLanguageName = (code) => {
    const language = languages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Floating API Key Button */}
      <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }}>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="icon" className="shadow-lg animate-fadeIn">
              <KeyRound className="w-5 h-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="mb-2 font-semibold flex items-center gap-2">
              <KeyRound className="w-4 h-4" /> DeepL API Key
            </div>
            <div className="mb-2 text-xs text-gray-500">Masukkan API key DeepL Anda. Key ini hanya disimpan di browser Anda.</div>
            <div className="flex items-center gap-2 mb-2">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                placeholder="Masukkan API Key..."
                className="pr-10"
                autoFocus
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => setShowApiKey(v => !v)}>
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setDeeplApiKey(apiKeyInput);
                toast.success('API Key berhasil disimpan!');
              }}
              disabled={!apiKeyInput}
            >
              Simpan API Key
            </Button>
            {deeplApiKey && (
              <div className="mt-2 text-xs text-green-600 break-all">
                Key aktif: <span className="font-mono">{deeplApiKey.replace(/.(?=.{4})/g, '*')}</span>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Languages className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Translate Dokumen</h1>
              <p className="text-sm text-gray-600">Terjemahkan dokumenmu dalam sekejap — akurat, cepat, dan gratis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Main Translation Interface */}
        <div className="grid gap-8">
          
          {/* File Upload Section */}
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-500" />
                Upload Dokumen
              </CardTitle>
              <CardDescription>
                Upload file PDF atau DOCX untuk diterjemahkan (maksimal 50MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
                  ${dragOver 
                    ? 'border-blue-500 bg-blue-50' 
                    : selectedFile 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('file-input').click()}
                data-testid="file-drop-zone"
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                  data-testid="file-input"
                />
                
                {selectedFile ? (
                  <div className="space-y-3">
                    <FileText className="h-12 w-12 text-green-500 mx-auto" />
                    <div>
                      <p className="font-medium text-green-700">{selectedFile.name}</p>
                      <p className="text-sm text-green-600">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Siap diterjemahkan
                    </Badge>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="font-medium text-gray-700">
                        Drag & drop file di sini atau klik untuk browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Mendukung format: PDF, DOCX, DOC
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Language Selection */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Bahasa Asal</label>
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage} data-testid="source-language-select">
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Deteksi Otomatis</SelectItem>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Bahasa Target</label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage} data-testid="target-language-select">
                    <SelectTrigger className="bg-white">
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
              </div>

              {/* Translation Button */}
              <div className="flex gap-3">
                <Button 
                  onClick={startTranslation}
                  disabled={!selectedFile || isTranslating}
                  className="flex-1 h-12 text-base font-medium bg-blue-500 hover:bg-blue-600"
                  data-testid="start-translation-btn"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Menerjemahkan...
                    </>
                  ) : (
                    <>
                      <Languages className="mr-2 h-5 w-5" />
                      Mulai Terjemahan
                    </>
                  )}
                </Button>

                {(selectedFile || translatedFile) && (
                  <Button 
                    variant="outline" 
                    onClick={resetTranslation}
                    disabled={isTranslating}
                    className="h-12"
                    data-testid="reset-btn"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Translation Status */}
          {(isTranslating || translatedFile || translationError) && (
            <Card className={`shadow-xl border-0 ${
              translatedFile ? 'bg-green-50 border-green-200' : 
              translationError ? 'bg-red-50 border-red-200' : 
              'bg-blue-50 border-blue-200'
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {translatedFile ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : translationError ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  )}
                  Status Terjemahan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Progress Bar */}
                {isTranslating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{translationProgress}%</span>
                    </div>
                    <Progress 
                      value={translationProgress} 
                      className="h-2"
                      data-testid="translation-progress"
                    />
                  </div>
                )}

                {/* Status Details */}
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">File:</span>
                    <span className="ml-2">{selectedFile?.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Terjemahan:</span>
                    <span className="ml-2">
                      {getDisplayLanguageName(sourceLanguage)} → {getDisplayLanguageName(targetLanguage)}
                    </span>
                  </div>
                </div>

                {/* Error Message */}
                {translationError && (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-700">
                      {translationError}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Download Button */}
                {translatedFile && (
                  <>
                    <Separator />
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-700">
                        Terjemahan selesai! File: <strong>{translatedFile.name}</strong> ({(translatedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </AlertDescription>
                    </Alert>
                    <Button 
                      onClick={downloadTranslatedFile}
                      className="w-full h-12 text-base font-medium bg-green-500 hover:bg-green-600"
                      data-testid="download-btn"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download Dokumen Terjemahan
                    </Button>
                  </>
                )}

              </CardContent>
            </Card>
          )}

          {/* API Key Warning */}
          {!deeplApiKey && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700">
                <strong>Perhatian:</strong> Anda belum memasukkan DeepL API Key. Klik tombol <KeyRound className="inline h-3 w-3" /> di pojok kanan bawah untuk memasukkan API Key Anda.
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          <Card className="shadow-xl border-0 bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Cara Menggunakan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6 text-sm">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h3 className="font-medium">Setup API Key</h3>
                  <p className="text-gray-600">Masukkan DeepL API Key Dibawah Ini</p>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <h3 className="font-medium">Upload File</h3>
                  <p className="text-gray-600">Pilih file PDF atau DOCX yang ingin diterjemahkan</p>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <h3 className="font-medium">Pilih Bahasa</h3>
                  <p className="text-gray-600">Tentukan bahasa asal dan bahasa target terjemahan</p>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-blue-600 font-bold">4</span>
                  </div>
                  <h3 className="font-medium">Download Hasil</h3>
                  <p className="text-gray-600">Tunggu proses selesai dan download file terjemahan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daftar API Key DeepL */}
          <Card className="shadow-xl border-0 bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">Daftar API Key DeepL</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Predefined API Keys List */}
              <div className="grid md:grid-cols-3 gap-4">
                {predefinedApiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3"
                  >
                    <h4 className="font-medium text-base">{key.name}</h4>
                    <div className="bg-white p-2 rounded border font-mono text-xs break-all">
                      {key.key}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => copyApiKey(key)}
                    >
                      <Copy className="h-3 w-3" />
                      Salin
                    </Button>
                  </div>
                ))}
              </div>

              {/* Instructions */}
              <div className="text-xs text-gray-500 pt-2 border-t">
                <p>
                  <strong>Tip:</strong> Klik "Salin" untuk menyalin API key, lalu paste ke input API key di pojok kanan bawah.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/50 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p className="font-medium">© 2025 Translate Dokumen • Powered by DeepL API</p>
            <p className="mt-2 text-xs text-gray-500">100% Client-Side • Privasi Terjaga • Format Tetap Akurat</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { Key, Copy, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

const PREDEFINED_API_KEYS = [
  { name: 'Abii', key: 'f381117b-94e6-4574-ad84-bad48a5b63ed:fx' },
  { name: 'Valda', key: '2bc8a00a-3238-42d3-a569-490a3dcb31ae:fx' },
  { name: 'Azzahra', key: 'bf66784d-823d-4503-87de-be73bf3e6657:fx' }
];

export default function ApiKeyManager({ onApiKeyChange }) {
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    // Load API key from localStorage on mount
    const savedApiKey = localStorage.getItem('deepl_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setTempApiKey(savedApiKey);
      onApiKeyChange(savedApiKey);
    }
  }, [onApiKeyChange]);

  const handleSaveApiKey = () => {
    if (!tempApiKey.trim()) {
      toast.error('API Key tidak boleh kosong');
      return;
    }

    // Basic validation: DeepL API keys have a specific format
    if (!tempApiKey.includes(':fx') && !tempApiKey.includes('-')) {
      toast.error('Format API Key tidak valid');
      return;
    }

    localStorage.setItem('deepl_api_key', tempApiKey);
    setApiKey(tempApiKey);
    onApiKeyChange(tempApiKey);
    toast.success('API Key berhasil disimpan!');
  };

  const handleCopyPredefinedKey = (key, index) => {
    navigator.clipboard.writeText(key);
    setCopiedIndex(index);
    setTempApiKey(key);
    toast.success('API Key berhasil disalin! Klik tombol "Simpan API Key" untuk menggunakannya.');
    
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('deepl_api_key');
    setApiKey('');
    setTempApiKey('');
    onApiKeyChange('');
    toast.success('API Key berhasil dihapus');
  };

  return (
    <div className="space-y-6">
      {/* API Key Input Section */}
      <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-500" />
            API Key DeepL
          </CardTitle>
          <CardDescription>
            Masukkan API Key DeepL Anda untuk menggunakan layanan terjemahan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current API Key Status */}
          {apiKey ? (
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">
                API Key aktif: <code className="font-mono text-xs bg-green-100 px-2 py-1 rounded">
                  {apiKey.substring(0, 20)}...
                </code>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-700">
                Belum ada API Key tersimpan. Silakan masukkan atau pilih dari daftar di bawah.
              </AlertDescription>
            </Alert>
          )}

          {/* API Key Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Masukkan API Key</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx"
                className="bg-white font-mono text-sm"
              />
              <Button onClick={handleSaveApiKey} className="bg-blue-500 hover:bg-blue-600 whitespace-nowrap">
                Simpan API Key
              </Button>
            </div>
          </div>

          {/* Clear Button */}
          {apiKey && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearApiKey}
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              Hapus API Key Tersimpan
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Predefined API Keys Section */}
      <Card className="shadow-xl border-0 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Daftar API Key DeepL</CardTitle>
          <CardDescription>
            Klik tombol "Salin" untuk menyalin API Key, lalu tempel di area input di atas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {PREDEFINED_API_KEYS.map((item, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <code className="text-xs text-gray-600 font-mono break-all">
                    {item.key}
                  </code>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyPredefinedKey(item.key, index)}
                  className={`ml-4 gap-2 ${
                    copiedIndex === index 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : ''
                  }`}
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="h-4 w-4" />
                      Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Salin
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

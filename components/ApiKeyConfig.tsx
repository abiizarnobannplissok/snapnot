import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X, AlertCircle, ExternalLink } from 'lucide-react';
import { getApiKey, saveApiKey, validateApiKey } from '../services/deepLService';

interface ApiKeyConfigProps {
  onApiKeyChange?: (key: string | null) => void;
  onValidationStatusChange?: (isValid: boolean) => void;
}

type ValidationStatus = 'not-set' | 'valid' | 'invalid' | 'testing';

export const ApiKeyConfig: React.FC<ApiKeyConfigProps> = ({ 
  onApiKeyChange, 
  onValidationStatusChange 
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<ValidationStatus>('not-set');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const savedKey = getApiKey();
    if (savedKey) {
      setApiKey(savedKey);
      setStatus('valid');
      onApiKeyChange?.(savedKey);
      onValidationStatusChange?.(true);
    }
  }, []);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      setStatus('invalid');
      setErrorMessage('Please enter an API key');
      return;
    }
    
    // Validate before saving
    setStatus('testing');
    setErrorMessage('');
    
    const result = await validateApiKey(apiKey);
    
    if (result.isValid) {
      saveApiKey(apiKey);
      setStatus('valid');
      onApiKeyChange?.(apiKey);
      onValidationStatusChange?.(true);
    } else {
      setStatus('invalid');
      setErrorMessage(result.error || 'Validation failed');
      onValidationStatusChange?.(false);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setStatus('invalid');
      setErrorMessage('Please enter an API key');
      return;
    }

    setStatus('testing');
    setErrorMessage('');

    const result = await validateApiKey(apiKey);
    
    if (result.isValid) {
      setStatus('valid');
      saveApiKey(apiKey);
      onApiKeyChange?.(apiKey);
      onValidationStatusChange?.(true);
    } else {
      setStatus('invalid');
      setErrorMessage(result.error || 'Validation failed');
      onValidationStatusChange?.(false);
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'valid':
        return (
          <div className="flex items-center gap-2 text-[#10B981] text-sm font-medium">
            <Check className="w-4 h-4" />
            <span>API Key Valid</span>
          </div>
        );
      case 'invalid':
        return (
          <div className="flex items-center gap-2 text-[#EF4444] text-sm font-medium">
            <X className="w-4 h-4" />
            <span>API Key Invalid</span>
          </div>
        );
      case 'testing':
        return (
          <div className="flex items-center gap-2 text-[#95E1D3] text-sm font-medium">
            <div className="w-4 h-4 border-2 border-[#95E1D3] border-t-transparent rounded-full animate-spin" />
            <span>Testing...</span>
          </div>
        );
      case 'not-set':
        return (
          <div className="flex items-center gap-2 text-[#F59E0B] text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>API Key Not Set</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#E5E5E5]">
      <div className="flex flex-col gap-4">
        {/* Label and Status */}
        <div className="flex items-center justify-between">
          <label htmlFor="api-key" className="text-sm font-semibold text-black">
            DeepL API Key
          </label>
          {getStatusDisplay()}
        </div>

        {/* Input Field */}
        <div className="relative">
          <input
            id="api-key"
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="w-full h-[44px] px-4 pr-12 rounded-[12px] border border-[#CCCCCC] focus:border-[#95E1D3] focus:outline-none text-base transition-colors"
            aria-label="DeepL API key input"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#666666] hover:text-black transition-colors"
            aria-label={showKey ? 'Hide API key' : 'Show API key'}
          >
            {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="text-[#EF4444] text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleSaveKey}
            className="flex-1 h-[44px] bg-[#95E1D3] text-black font-medium rounded-[12px] hover:bg-[#81CABB] active:scale-[0.98] transition-all"
          >
            Save Key
          </button>
          <button
            onClick={handleTestConnection}
            disabled={status === 'testing'}
            className="flex-1 h-[44px] bg-white text-black font-medium rounded-[12px] border-2 border-[#95E1D3] hover:bg-[#F5F5F5] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test Connection
          </button>
        </div>

        {/* Helper Text */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[#666666]">
            API key disimpan lokal di browser Anda, tidak dibagikan
          </p>
          <a
            href="https://www.deepl.com/pro-api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#95E1D3] hover:text-[#81CABB] font-medium flex items-center gap-1 transition-colors"
          >
            <span>Dapatkan API Key Gratis</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

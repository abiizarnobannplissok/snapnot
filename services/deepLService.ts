// DeepL API Service via Cloudflare Worker
const WORKER_PROXY_URL = 'https://translate-proxy.yumtive.workers.dev';
const DEEPL_API_URL = 'https://api-free.deepl.com/v2';

export interface TranslationRequest {
  text: string;
  sourceLang?: string;
  targetLang: string;
  apiKey: string;
}

export interface TranslationResponse {
  translatedText: string;
  detectedLanguage?: string;
}

export interface ApiKeyValidationResult {
  isValid: boolean;
  error?: string;
}

// API Key Management
export const saveApiKey = (key: string): void => {
  localStorage.setItem('deepl_api_key', key);
  localStorage.setItem('deepl_key_saved_at', Date.now().toString());
};

export const getApiKey = (): string | null => {
  return localStorage.getItem('deepl_api_key');
};

export const clearApiKey = (): void => {
  localStorage.removeItem('deepl_api_key');
  localStorage.removeItem('deepl_key_saved_at');
};

// Validate API key
export const validateApiKey = async (key: string): Promise<ApiKeyValidationResult> => {
  try {
    // Try worker proxy first, fallback to direct
    const response = await fetch(`${WORKER_PROXY_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: ['test'],
        target_lang: 'DE',
        auth_key: key,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // If we get translations array, API key is valid
      if (data.translations && Array.isArray(data.translations)) {
        return { isValid: true };
      }
      return { isValid: false, error: 'Invalid response from server' };
    } else if (response.status === 403 || response.status === 401) {
      return { isValid: false, error: 'Invalid API key' };
    } else if (response.status === 456) {
      return { isValid: false, error: 'Quota exceeded' };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return { isValid: false, error: errorData.message || `Error: ${response.status}` };
    }
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error 
        ? 'Connection failed. Please check your internet connection.' 
        : 'Network error' 
    };
  }
};

// Translate text (via proxy)
export const translateText = async ({
  text,
  sourceLang,
  targetLang,
  apiKey,
}: TranslationRequest): Promise<TranslationResponse> => {
  if (!text.trim()) {
    throw new Error('Please enter text to translate.');
  }

  if (text.length > 5000) {
    throw new Error('Text exceeds 5000 character limit.');
  }

  if (sourceLang && sourceLang !== 'auto' && sourceLang === targetLang) {
    throw new Error('Source and target language cannot be the same.');
  }

  try {
    const body: any = {
      text: [text],
      target_lang: targetLang.toUpperCase(),
      auth_key: apiKey,
    };
    
    // Add source_lang only if not auto-detect
    if (sourceLang && sourceLang !== 'auto') {
      body.source_lang = sourceLang.toUpperCase();
    }
    
    const response = await fetch(`${WORKER_PROXY_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 403 || response.status === 401) {
        throw new Error('Invalid API key. Please check and try again.');
      } else if (response.status === 456) {
        throw new Error('Translation quota exceeded. Please upgrade your DeepL plan.');
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment.');
      } else if (response.status === 413) {
        throw new Error('Text is too large to translate.');
      } else if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(errorData.error || `Translation failed: ${response.status}`);
      }
    }
    
    const data = await response.json();
    
    // DeepL API response format
    if (data.translations && Array.isArray(data.translations) && data.translations.length > 0) {
      return {
        translatedText: data.translations[0].text,
        detectedLanguage: data.translations[0].detected_source_language,
      };
    } else {
      throw new Error('Invalid response format from translation service');
    }
  } catch (error) {
    if (error instanceof Error) {
      // Check if it's a network error
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        throw new Error('Connection failed. Please check your internet connection.');
      }
      throw error;
    }
    throw new Error('Connection failed. Please check your internet.');
  }
};

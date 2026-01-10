import React, { useState, useCallback } from 'react';
import { Copy, Check, Key } from 'lucide-react';
import { translatorColors } from '@/constants/translatorColors';

const SHARED_API_KEYS = [
  {
    id: 'abii',
    label: "Abii's Key",
    key: 'f381117b-94e6-4574-ad84-bad48a5b63ed:fx',
  },
  {
    id: 'valda',
    label: "Valda's Key",
    key: '2bc8a00a-3238-42d3-a569-490a3dcb31ae:fx',
  },
  {
    id: 'azzahra',
    label: "Azzahra's Key",
    key: 'bf66784d-823d-4503-87de-be73bf3e6657:fx',
  },
] as const;

interface ApiKeyManagerProps {
  onKeySelect?: (apiKey: string) => void;
  className?: string;
}

const maskApiKey = (key: string): string => {
  if (key.length <= 11) return key;
  return `${key.slice(0, 8)}...${key.slice(-3)}`;
};

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  onKeySelect,
  className = '',
}) => {
  const [customKey, setCustomKey] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleCopy = useCallback(async (key: string, id: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedId(id);
      
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);

      if (onKeySelect) {
        onKeySelect(key);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [onKeySelect]);

  const handleTestKey = useCallback(async () => {
    if (!customKey.trim()) {
      setTestStatus({
        type: 'error',
        message: 'Please enter an API key',
      });
      return;
    }

    setIsTestingKey(true);
    setTestStatus({ type: null, message: '' });

    try {
      const response = await fetch('https://api-free.deepl.com/v2/usage', {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${customKey.trim()}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTestStatus({
          type: 'success',
          message: `✓ Valid! Usage: ${data.character_count?.toLocaleString() || 0} / ${data.character_limit?.toLocaleString() || 'N/A'} characters`,
        });
        
        if (onKeySelect) {
          onKeySelect(customKey.trim());
        }
      } else if (response.status === 403) {
        setTestStatus({
          type: 'error',
          message: '✗ Invalid API key',
        });
      } else if (response.status === 456) {
        setTestStatus({
          type: 'error',
          message: '✗ Quota exceeded (500k chars/month)',
        });
      } else {
        setTestStatus({
          type: 'error',
          message: `✗ Error: ${response.statusText}`,
        });
      }
    } catch (error) {
      setTestStatus({
        type: 'error',
        message: '✗ Network error. Check your connection.',
      });
    } finally {
      setIsTestingKey(false);
    }
  }, [customKey, onKeySelect]);

  return (
    <div className={`api-key-manager ${className}`}>
      <style>{`
        .api-key-manager {
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .key-manager-container {
          background: ${translatorColors.neutral.warmGray};
          border-radius: 12px;
          padding: 16px;
          box-shadow: ${translatorColors.shadow.light};
        }

        .key-manager-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 600;
          color: ${translatorColors.text.dark};
          margin-bottom: 16px;
        }

        .key-manager-title svg {
          color: ${translatorColors.primary.brightRed};
        }

        .custom-key-section {
          margin-bottom: 20px;
        }

        .custom-key-label {
          font-size: 14px;
          font-weight: 500;
          color: ${translatorColors.text.dark};
          margin-bottom: 8px;
          display: block;
        }

        .custom-key-input-wrapper {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .custom-key-input {
          flex: 1;
          height: 44px;
          padding: 0 16px;
          border-radius: 8px;
          border: 1px solid ${translatorColors.neutral.border};
          font-size: 14px;
          font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
          color: ${translatorColors.text.dark};
          background: ${translatorColors.neutral.white};
          transition: all 0.2s ease;
        }

        .custom-key-input:focus {
          outline: none;
          border-color: ${translatorColors.primary.brightRed};
          box-shadow: ${translatorColors.shadow.focusRed};
        }

        .custom-key-input::placeholder {
          color: ${translatorColors.text.gray};
        }

        .test-key-button {
          height: 44px;
          padding: 0 20px;
          border-radius: 8px;
          border: none;
          background: ${translatorColors.primary.brightRed};
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .test-key-button:hover {
          background: ${translatorColors.primary.deepRed};
          transform: scale(1.02);
        }

        .test-key-button:active {
          transform: scale(0.98);
        }

        .test-key-button:disabled {
          background: ${translatorColors.neutral.borderLight};
          color: ${translatorColors.text.gray};
          cursor: not-allowed;
          transform: none;
        }

        .test-status-message {
          font-size: 13px;
          padding: 8px 12px;
          border-radius: 6px;
          margin-top: 8px;
        }

        .test-status-success {
          background: rgba(52, 199, 89, 0.1);
          color: ${translatorColors.accent.successGreen};
          border: 1px solid ${translatorColors.accent.successGreen};
        }

        .test-status-error {
          background: rgba(239, 68, 68, 0.1);
          color: ${translatorColors.accent.errorRed};
          border: 1px solid ${translatorColors.accent.errorRed};
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 20px 0;
          color: ${translatorColors.text.gray};
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid ${translatorColors.neutral.border};
        }

        .divider::before {
          margin-right: 12px;
        }

        .divider::after {
          margin-left: 12px;
        }

        .shared-keys-header {
          font-size: 14px;
          font-weight: 500;
          color: ${translatorColors.text.dark};
          margin-bottom: 8px;
        }

        .shared-keys-subtitle {
          font-size: 12px;
          color: ${translatorColors.text.gray};
          margin-bottom: 12px;
        }

        .shared-keys-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .key-card {
          background: ${translatorColors.neutral.white};
          border-radius: 8px;
          padding: 12px;
          border: 1px solid ${translatorColors.neutral.borderLight};
          transition: all 0.2s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .key-card:hover {
          border-color: ${translatorColors.primary.brightRed};
          box-shadow: ${translatorColors.shadow.light};
        }

        .key-info {
          flex: 1;
          min-width: 0;
        }

        .key-label {
          font-size: 14px;
          font-weight: 600;
          color: ${translatorColors.text.dark};
          margin-bottom: 4px;
        }

        .key-display {
          font-size: 13px;
          font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
          color: ${translatorColors.text.gray};
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .copy-button {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          height: 36px;
          padding: 0 12px;
          border-radius: 6px;
          border: 1px solid ${translatorColors.primary.brightRed};
          background: transparent;
          color: ${translatorColors.primary.brightRed};
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .copy-button:hover {
          background: ${translatorColors.primary.brightRed};
          color: white;
        }

        .copy-button:active {
          transform: scale(0.98);
        }

        .copy-button.copied {
          background: ${translatorColors.accent.successGreen};
          border-color: ${translatorColors.accent.successGreen};
          color: white;
        }

        .copy-button svg {
          width: 14px;
          height: 14px;
        }

        @media (max-width: 768px) {
          .key-manager-container {
            padding: 12px;
          }

          .custom-key-input-wrapper {
            flex-direction: column;
          }

          .test-key-button {
            width: 100%;
          }

          .copy-button span {
            display: none;
          }

          .copy-button {
            padding: 0 10px;
          }
        }
      `}</style>

      <div className="key-manager-container">
        <h3 className="key-manager-title">
          <Key size={20} />
          DeepL API Configuration
        </h3>

        <div className="custom-key-section">
          <label className="custom-key-label">Your API Key:</label>
          <div className="custom-key-input-wrapper">
            <input
              type="text"
              className="custom-key-input"
              placeholder="Enter your DeepL API key (e.g., xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx)"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTestKey();
                }
              }}
              aria-label="Custom API Key"
            />
            <button
              className="test-key-button"
              onClick={handleTestKey}
              disabled={isTestingKey || !customKey.trim()}
              aria-label="Test API Key"
            >
              {isTestingKey ? 'Testing...' : 'Test Key'}
            </button>
          </div>

          {testStatus.type && (
            <div
              className={`test-status-message test-status-${testStatus.type}`}
              role="alert"
            >
              {testStatus.message}
            </div>
          )}
        </div>

        <div className="divider">OR USE SHARED API KEYS</div>

        <div className="shared-keys-header">📋 Daftar API Key DeepL</div>
        <div className="shared-keys-subtitle">
          Klik "Salin" untuk copy ke clipboard
        </div>

        <div className="shared-keys-list">
          {SHARED_API_KEYS.map((apiKey) => {
            const isCopied = copiedId === apiKey.id;

            return (
              <div key={apiKey.id} className="key-card">
                <div className="key-info">
                  <div className="key-label">{apiKey.label}</div>
                  <div className="key-display" title={apiKey.key}>
                    {maskApiKey(apiKey.key)}
                  </div>
                </div>

                <button
                  className={`copy-button ${isCopied ? 'copied' : ''}`}
                  onClick={() => handleCopy(apiKey.key, apiKey.id)}
                  aria-label={`Copy ${apiKey.label}`}
                >
                  {isCopied ? (
                    <>
                      <Check />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;

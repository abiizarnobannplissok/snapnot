# Test Translator Configuration

## DeepL API Format (Correct)

### Request Format
```bash
curl -X POST https://translate-proxy.yumtive.workers.dev/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": ["Hello, world!"],
    "target_lang": "ID",
    "auth_key": "YOUR_API_KEY_HERE"
  }'
```

### Expected Response
```json
{
  "translations": [
    {
      "detected_source_language": "EN",
      "text": "Halo, dunia!"
    }
  ]
}
```

## Configuration Summary

✅ **Proxy URL**: `https://translate-proxy.yumtive.workers.dev/translate`
✅ **API Type**: Free (api-free.deepl.com)
✅ **Auth Format**: `auth_key` in request body (not header!)
✅ **Text Format**: Array `["text here"]`
✅ **Response**: `{ translations: [{ text, detected_source_language }] }`

## Test Steps

1. **Get API Key**
   - Visit: https://www.deepl.com/pro-api
   - Sign up for free account
   - Copy API key (format: `xxx:fx`)

2. **Test dengan cURL**
   ```bash
   curl -X POST https://translate-proxy.yumtive.workers.dev/translate \
     -H "Content-Type: application/json" \
     -d '{"text":["Hello"],"target_lang":"ID","auth_key":"YOUR_KEY:fx"}'
   ```

3. **Test di Browser**
   - Open app: http://localhost:3000
   - Go to Translator tab
   - Enter API key
   - Click "Test Connection"
   - Should show "API Key Valid" ✓

4. **Translate Text**
   - Source: Auto-detect
   - Target: Indonesian
   - Text: "Hello, how are you?"
   - Click Translate
   - Result: "Halo, apa kabar?"

## Troubleshooting

### 401 Unauthorized
- Check API key format (must include `:fx`)
- Verify key is valid in DeepL dashboard
- Try copying key again

### Invalid Response
- Check proxy URL is correct
- Verify internet connection
- Check DeepL API status

### Quota Exceeded (456)
- Free tier: 500,000 chars/month
- Check usage in DeepL dashboard
- Wait for next month or upgrade

## Current Implementation

File: `/services/deepLService.ts`

```typescript
const PROXY_URL = 'https://translate-proxy.yumtive.workers.dev';

// Request format
{
  text: [text],                    // Array of strings
  target_lang: 'DE',              // Uppercase
  source_lang: 'EN' (optional)    // Omit for auto-detect
}

// Headers
{
  'Content-Type': 'application/json',
  'Authorization': 'DeepL-Auth-Key YOUR_KEY'
}

// Response
{
  translations: [{
    text: "Translated text",
    detected_source_language: "EN"
  }]
}
```

---

**Status**: ✅ Configuration Updated & Ready to Test

# Debug API Key Issue

## Problem
- "Save Key" shows "Valid" without actual validation
- "Test Connection" shows "Invalid"
- Translate fails with "Invalid API key"

## Fix Applied

### 1. ApiKeyConfig.tsx - handleSaveKey
**Before:** Save tanpa validate
**After:** Validate dulu, baru save jika valid

```typescript
const handleSaveKey = async () => {
  // Validate before saving
  setStatus('testing');
  const result = await validateApiKey(apiKey);
  
  if (result.isValid) {
    saveApiKey(apiKey);
    setStatus('valid');
  } else {
    setStatus('invalid');
    setErrorMessage(result.error);
  }
};
```

### 2. deepLService.ts - validateApiKey
**Before:** Check `data.valid` property
**After:** Check response has `translations` array (actual DeepL format)

```typescript
if (response.ok) {
  const data = await response.json();
  // DeepL returns: { translations: [...] }
  if (data.translations && Array.isArray(data.translations)) {
    return { isValid: true };
  }
}
```

## Test Steps

1. **Clear Cache**
   ```javascript
   // Browser console
   localStorage.removeItem('deepl_api_key');
   localStorage.removeItem('deepl_key_saved_at');
   ```

2. **Hard Refresh**
   - Ctrl/Cmd + Shift + R

3. **Enter API Key Again**
   - Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx`

4. **Click "Save Key"**
   - Should show "Testing..." 
   - Then "API Key Valid" ✓ (if actually valid)
   - Or "Invalid API key" ✗ (if wrong)

5. **Try Translate**
   - Should work if step 4 showed valid

## Manual Test

Test API key dengan curl:

```bash
curl -X POST https://translate-proxy.yumtive.workers.dev/translate \
  -H "Content-Type: application/json" \
  -H "Authorization: DeepL-Auth-Key YOUR_API_KEY_HERE:fx" \
  -d '{"text":["test"],"target_lang":"DE"}' \
  -v
```

**Expected Success Response:**
```json
{
  "translations": [
    {
      "detected_source_language": "EN",
      "text": "Test"
    }
  ]
}
```

**Expected Error Response (401):**
```json
{
  "message": "Invalid authentication credentials"
}
```

## Common Issues

### Issue 1: API Key Format Wrong
❌ Wrong: `abc123` (too short)
❌ Wrong: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (missing :fx)
✅ Correct: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx`

### Issue 2: Proxy URL Wrong
❌ Wrong: `https://translate-proxy.yumtive.workers.dev/api/translate`
✅ Correct: `https://translate-proxy.yumtive.workers.dev/translate`

### Issue 3: Copy-Paste Error
- Extra spaces before/after key
- Line breaks in key
- Special characters

**Fix:** Trim key before save:
```typescript
const cleanKey = apiKey.trim();
```

## Verification Checklist

- [ ] API key format correct (contains `:fx`)
- [ ] No extra spaces/line breaks
- [ ] Proxy URL correct (`/translate` not `/api/translate`)
- [ ] Auth header: `DeepL-Auth-Key` (not `Bearer`)
- [ ] Request body: `text: ["..."]` (array)
- [ ] Response expected: `{ translations: [...] }`

---

**Status:** ✅ Fix Applied - Please test again

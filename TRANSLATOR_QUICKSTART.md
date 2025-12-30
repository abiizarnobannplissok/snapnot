# 🚀 Quick Start - DeepL Translator

## ⚠️ IMPORTANT: CORS Issue

DeepL API tidak allow direct browser requests. Anda perlu:

### Option A: Browser Extension (Paling Cepat!)
1. Install extension: [CORS Unblock](https://chrome.google.com/webstore/detail/cors-unblock/) (Chrome) atau [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/) (Firefox)
2. Enable extension
3. Start app dan gunakan translator

### Option B: Deploy Proxy (Production)
1. Deploy `api-proxy-simple.js` ke Vercel/Netlify (gratis!)
2. Update `/services/deepLService.ts`: 
   ```typescript
   const PROXY_URL = 'https://your-app.vercel.app/api/translate';
   const USE_PROXY = true;
   ```
3. Start app

---

## Setup dalam 2 Menit!

### Step 1: Install Dependencies ✅
```bash
npm install
```

### Step 2: Start App
```bash
npm run dev
```

### Step 3: Get API Key

1. Buka: https://www.deepl.com/pro-api
2. Sign up (gratis!)
3. Copy API key Anda

### Step 4: Use Translator

1. Buka browser: `http://localhost:3000`
2. Klik tab **"Translator"**
3. Paste API key Anda
4. Klik **"Save Key"** atau **"Test Connection"**
5. Start translating! 🎉

## Troubleshooting Cepat

### Error: "Connection failed"

**Fix:**
- Check internet connection Anda
- Cloudflare Workers proxy harus accessible
- Try refresh browser

### Error: "Invalid API key"

1. Check format API key (harus ada `:fx` untuk free tier)
2. Test di DeepL website dulu
3. Check quota belum habis

## Keyboard Shortcuts

- **Ctrl/⌘ + Enter**: Translate
- **Ctrl/⌘ + K**: Clear all
- **Ctrl/⌘ + S**: Swap languages

## Next Steps

- 📖 Baca `TRANSLATOR_README.md` untuk dokumentasi lengkap
- 🔧 Baca `TRANSLATOR_SETUP.md` untuk deployment guide
- 💡 Explore fitur-fitur lainnya di UI

---

**That's it! Selamat menggunakan translator! 🌐**

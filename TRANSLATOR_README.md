# 🌐 DeepL Translator Feature

Fitur AI Text Translator terintegrasi dengan SnapNotes, menggunakan DeepL API untuk terjemahan berkualitas tinggi.

> **Note**: Translator menggunakan Cloudflare Workers proxy (https://translate-proxy.yumtive.workers.dev) untuk handle CORS. Tidak perlu setup backend!

## ✨ Features

### Core Features
- ✅ **Text Translation** - Translate text dari satu bahasa ke bahasa lain
- ✅ **30+ Languages** - Support bahasa Indonesia, English, Japanese, Korean, Chinese, dll
- ✅ **Auto-detect Language** - Deteksi bahasa sumber otomatis
- ✅ **Swap Languages** - Tukar bahasa sumber dan target dengan 1 klik
- ✅ **Character Counter** - Real-time counter dengan validasi (max 5000 chars)
- ✅ **Copy to Clipboard** - Copy hasil translate dengan 1 klik
- ✅ **API Key Management** - Simpan dan validate API key secara lokal
- ✅ **Loading States** - Clear feedback saat proses translate
- ✅ **Error Handling** - User-friendly error messages
- ✅ **Keyboard Shortcuts** - Ctrl/⌘ + Enter untuk translate cepat

### UI/UX Features
- 🎨 **Modern Design** - Clean, minimalist interface
- 📱 **Fully Responsive** - Optimal di desktop, tablet, dan mobile
- ♿ **Accessible** - Keyboard navigation & screen reader support
- 🎭 **Smooth Animations** - Micro-interactions yang menyenangkan
- 🌈 **Design System** - Consistent colors, typography, spacing

### Technical Features
- 🔒 **Secure** - API key disimpan lokal di browser (localStorage)
- 🚀 **Performance** - Optimized rendering & debounced requests
- 🛡️ **CORS Safe** - Menggunakan proxy server untuk handle CORS
- 📝 **TypeScript** - Type-safe development
- ⚡ **Real-time** - Instant feedback & validation

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Application

```bash
npm run dev
```

### 3. Get DeepL API Key

1. Visit: https://www.deepl.com/pro-api
2. Sign up (gratis!)
3. Get your API key
4. Free tier: 500,000 characters/month

### 4. Use Translator

1. Buka browser: `http://localhost:3000` (atau port dev server Anda)
2. Klik tab **"Translator"**
3. Masukkan DeepL API key
4. Klik **"Save Key"** atau **"Test Connection"**
5. Pilih bahasa sumber dan target
6. Masukkan text, klik **"Translate"**
7. Selesai! 🎉

> **No Backend Required!** Translator langsung jalan tanpa perlu setup proxy server.

## 📚 How to Use

### API Key Configuration

1. **Input API Key**
   - Masukkan DeepL API key di field
   - Format: `xxx:fx` (free tier) atau `xxx` (pro tier)
   - Click eye icon untuk show/hide key

2. **Save Key**
   - Klik "Save Key" untuk simpan ke localStorage
   - API key tersimpan di browser Anda (private)

3. **Test Connection**
   - Klik "Test Connection" untuk validasi API key
   - Status akan muncul: Valid ✓ / Invalid ✗ / Not Set ⚠

### Translation

1. **Select Languages**
   - **Source Language**: Pilih bahasa sumber atau "Auto-detect"
   - **Target Language**: Pilih bahasa target
   - Click swap button (⇄) untuk tukar bahasa

2. **Input Text**
   - Ketik atau paste text di area kiri
   - Max 5000 characters
   - Character counter akan update real-time

3. **Translate**
   - Klik tombol **"Translate"**
   - Atau tekan **Ctrl/⌘ + Enter**
   - Hasil akan muncul di area kanan

4. **Copy Result**
   - Klik tombol "Copy" di hasil translate
   - Text akan disalin ke clipboard

### Keyboard Shortcuts

- **Ctrl/⌘ + Enter**: Translate text
- **Ctrl/⌘ + K**: Clear all fields
- **Ctrl/⌘ + S**: Swap languages
- **Tab**: Navigate between elements
- **Esc**: Close dropdowns

## 🎨 Design System

### Colors
- **Primary Action**: `#8FB4FF` (Soft Blue) - Translate button
- **Secondary**: `#D4FF00` (Neon Yellow) - Accents
- **Success**: `#10B981` (Green) - Valid states
- **Error**: `#EF4444` (Red) - Error states
- **Background**: `#F5F5F5` (Light Gray)
- **Text Primary**: `#000000` (Black)
- **Text Secondary**: `#666666` (Gray)

### Typography
- **Font**: Inter, system fonts
- **Title**: 48px Bold
- **Heading**: 24px Semibold
- **Body**: 16px Regular
- **Small**: 12px Regular

### Spacing
- **Card Padding**: 24-32px
- **Gap**: 4, 8, 12, 16, 24px
- **Border Radius**: 12-24px

## 🛠️ Technical Details

### Architecture

```
/snapnot
├── components/
│   ├── Translator.tsx           # Main translator component
│   ├── ApiKeyConfig.tsx         # API key configuration
│   └── LanguageSelector.tsx     # Language dropdown
├── services/
│   └── deepLService.ts          # DeepL API service (via proxy)
├── constants/
│   └── languages.ts             # Language data & flags
├── proxy-server.js              # Express proxy server
└── App.tsx                      # Main app with tabs
```

### Data Flow

```
User Input → Translator Component
           → deepLService
           → Proxy Server (localhost:3001)
           → DeepL API
           → Response back to UI
```

### API Endpoints (Proxy)

**Translation**
```
POST /api/translate
Body: {
  text: string[],
  source_lang?: string,
  target_lang: string,
  api_key: string
}
```

**Validation**
```
POST /api/validate
Body: {
  api_key: string
}
```

## 🌍 Supported Languages

### Source Languages (31)
Auto-detect, Bulgarian, Czech, Danish, German, Greek, English, Spanish, Estonian, Finnish, French, Hungarian, Indonesian, Italian, Japanese, Korean, Lithuanian, Latvian, Norwegian, Dutch, Polish, Portuguese, Romanian, Russian, Slovak, Slovenian, Swedish, Turkish, Ukrainian, Chinese

### Target Languages (31+)
Same as source languages, plus variants:
- English (British) - EN-GB
- English (American) - EN-US
- Portuguese (Brazilian) - PT-BR
- Portuguese (European) - PT-PT

## ⚙️ Configuration

### Environment Variables

Create `.env` file:

```env
# Proxy Server URL
VITE_PROXY_URL=http://localhost:3001

# Proxy Server Port
PORT=3001
```

### Proxy Server

**Default Configuration:**
- Port: 3001
- CORS: All origins (development)
- Endpoints: `/api/translate`, `/api/validate`

**Production Configuration:**
Update `proxy-server.js`:

```javascript
// Restrict CORS to your domain
app.use(cors({
  origin: 'https://yourdomain.com'
}));

// Add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);
```

## 🚢 Deployment

### Option 1: Separate Frontend & Backend

**Frontend (Vercel/Netlify):**
1. Build frontend: `npm run build`
2. Deploy `dist/` folder
3. Set env var: `VITE_PROXY_URL=https://your-proxy-url.com`

**Backend (Heroku/Railway/Render):**
1. Deploy `proxy-server.js`
2. Set port via `PORT` env var
3. Enable CORS for your frontend domain

### Option 2: Serverless Functions

Create `api/translate.js` (Vercel/Netlify):

```javascript
export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { text, source_lang, target_lang, api_key } = req.body;
  
  // Forward to DeepL API
  const response = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${api_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      source_lang,
      target_lang,
    }),
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
```

### Option 3: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app files
COPY . .

# Build frontend
RUN npm run build

# Expose ports
EXPOSE 3000 3001

# Start both services
CMD ["sh", "-c", "npm run preview & npm run proxy"]
```

## 🔧 Troubleshooting

### CORS Error

**Problem:** `Access-Control-Allow-Origin` error

**Solution:**
1. Make sure proxy server is running: `npm run proxy`
2. Check proxy URL in `.env`: `VITE_PROXY_URL=http://localhost:3001`
3. Verify proxy server terminal shows no errors
4. Clear browser cache

### API Key Invalid

**Problem:** "Invalid API key" error

**Solution:**
1. Check API key format (should contain `:fx` for free tier)
2. Verify key in DeepL dashboard
3. Check quota usage
4. Try "Test Connection" button

### Translation Fails

**Problem:** Translation request fails

**Solution:**
1. Check character limit (max 5000)
2. Verify source ≠ target language
3. Check network connection
4. Review proxy server logs
5. Verify DeepL API status: https://status.deepl.com

### Proxy Won't Start

**Problem:** Port 3001 already in use

**Solution:**
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different port
PORT=3002 npm run proxy
```

### Cannot Connect to Proxy

**Problem:** "Cannot connect to proxy server" error

**Solution:**
1. Verify proxy is running: `curl http://localhost:3001/health`
2. Check firewall settings
3. Try different port
4. Check `VITE_PROXY_URL` matches proxy server

## 📊 Usage Statistics

### Free Tier Limits
- **Characters**: 500,000 per month
- **Requests**: Unlimited
- **Languages**: All 31 languages
- **API Key**: Free forever

### Pro Tier
- **Characters**: Based on plan
- **Priority**: Faster processing
- **Support**: Email support
- **SLA**: 99.9% uptime

## 🔒 Security & Privacy

### API Key Storage
- Stored in browser `localStorage`
- Never sent to any server (except DeepL via proxy)
- Private per user/browser
- Can be cleared anytime

### Data Privacy
- Text tidak disimpan di server
- Translation request langsung ke DeepL
- Proxy server tidak menyimpan data
- HTTPS recommended untuk production

### Best Practices
1. ✅ Use HTTPS in production
2. ✅ Restrict CORS to your domain
3. ✅ Add rate limiting to proxy
4. ✅ Monitor API usage
5. ✅ Don't expose API keys in code
6. ✅ Use environment variables

## 🎯 Performance Tips

1. **Debounce Input** - Avoid translating on every keystroke
2. **Cache Results** - Cache recent translations
3. **Lazy Load** - Load translator only when tab active
4. **Optimize Bundle** - Code split translator components
5. **CDN** - Use CDN for static assets

## 🤝 Support & Contact

### Documentation
- DeepL API Docs: https://www.deepl.com/docs-api
- DeepL Support: https://support.deepl.com

### Common Issues
Check `TRANSLATOR_SETUP.md` for detailed troubleshooting.

### Feature Requests
Open an issue or contact developer.

---

**Happy Translating! 🌐✨**

Made with ❤️ using DeepL API

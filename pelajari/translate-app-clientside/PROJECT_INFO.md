# 📊 Project Information

## 🎯 Tentang Aplikasi Ini

**Translate Dokumen - Client-Side Version** adalah aplikasi web untuk menerjemahkan dokumen (PDF, DOCX, DOC) yang berjalan **100% di browser** tanpa memerlukan backend server.

### Versi
- **Version:** 1.0.0
- **Type:** Client-Side Only (Pure Frontend)
- **Created:** 2024

---

## 🏗️ Arsitektur

### Sebelumnya (Fullstack):
```
User → Frontend → Backend (FastAPI) → DeepL API
                    ↓
                 MongoDB
```

### Sekarang (Client-Side):
```
User → Frontend → DeepL API (langsung!)
         ↓
    localStorage (API Key)
```

### Keuntungan Client-Side:
✅ **No Server Required** - Deploy langsung, tidak perlu setup server  
✅ **Zero Maintenance** - Tidak perlu update/patch server  
✅ **Gratis Hosting** - Netlify, Vercel, GitHub Pages gratis  
✅ **Infinite Scale** - CDN handle semua traffic  
✅ **Privacy** - File tidak melewati server kita  

### Trade-offs:
⚠️ **API Key Visible** - User bisa lihat API key di Network tab (OK untuk personal use)  
⚠️ **No Usage Tracking** - Tidak bisa monitor siapa pakai berapa banyak  
⚠️ **CORS Dependent** - Tergantung DeepL API support CORS  

---

## 🛠️ Tech Stack

### Core
- **React** 19.0.0 - UI Framework
- **JavaScript** (ES6+) - Programming Language
- **Axios** 1.8.4 - HTTP Client untuk DeepL API

### UI/UX
- **Radix UI** - Headless UI Components
- **shadcn/ui** - Pre-built component library
- **TailwindCSS** 3.4.17 - Utility-first CSS
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### Build Tools
- **Create React App** 5.0.1 - Build system
- **CRACO** 7.1.0 - CRA Configuration Override
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

### Development
- **ESLint** - Code linting
- **Prettier** (recommended) - Code formatting

---

## 📁 Struktur Folder

```
translate-app-clientside/
├── public/                 # Static files
│   └── index.html         # HTML template
├── src/
│   ├── components/        # UI components (dari shadcn/ui)
│   │   └── ui/           # Radix UI wrappers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities
│   ├── App.js            # Main app component ⭐
│   ├── App.css           # App styles
│   ├── index.js          # Entry point
│   └── index.css         # Global styles
├── .gitignore            # Git ignore rules
├── .env.example          # Environment template
├── package.json          # Dependencies
├── tailwind.config.js    # Tailwind configuration
├── craco.config.js       # CRACO configuration
├── README.md             # Main documentation
├── DEPLOYMENT.md         # Deployment guide
├── QUICK_START.md        # Quick start guide
└── PROJECT_INFO.md       # This file
```

---

## 🔑 Fitur Utama

### 1. Direct DeepL Integration
- Upload dokumen langsung ke DeepL API
- Poll status setiap 2 detik
- Download hasil otomatis

### 2. API Key Management
- Disimpan di `localStorage` browser
- Toggle visibility (show/hide)
- Persist across sessions
- Easy reset/change

### 3. Multi-Language Support
- 17+ bahasa tersedia
- Auto-detect bahasa sumber
- Indonesian language names
- Formality support (beberapa bahasa)

### 4. File Handling
- Drag & drop upload
- File validation (type & size)
- Progress indicator
- Error handling

### 5. Modern UI
- Responsive design (mobile-friendly)
- Real-time feedback
- Loading states
- Error messages yang jelas
- Toast notifications

---

## 🔐 Security & Privacy

### API Key Storage
```javascript
// Stored in browser localStorage
localStorage.setItem('deeplApiKey', key);

// Not sent to any server except DeepL
headers: {
  'Authorization': `DeepL-Auth-Key ${apiKey}`
}
```

### File Privacy
- File tidak disimpan di server manapun
- Langsung dikirim ke DeepL API
- Hasil langsung didownload ke browser
- Tidak ada tracking file

### HTTPS Requirement
- Production harus pakai HTTPS
- Netlify/Vercel otomatis provide SSL
- CORS requires secure origin

---

## 🌐 DeepL API Integration

### Endpoints Used

1. **Get Languages**
```javascript
GET https://api-free.deepl.com/v2/languages?type=target
Authorization: DeepL-Auth-Key {key}
```

2. **Upload Document**
```javascript
POST https://api-free.deepl.com/v2/document
Authorization: DeepL-Auth-Key {key}
Body: FormData (file + target_lang + source_lang)
Response: { document_id, document_key }
```

3. **Check Status**
```javascript
POST https://api-free.deepl.com/v2/document/{document_id}
Authorization: DeepL-Auth-Key {key}
Body: document_key
Response: { status: 'queued'|'translating'|'done'|'error' }
```

4. **Download Result**
```javascript
POST https://api-free.deepl.com/v2/document/{document_id}/result
Authorization: DeepL-Auth-Key {key}
Body: document_key
Response: Binary file (blob)
```

### API Limits (Free Tier)
- 500,000 characters/month
- Max file size: Tergantung format
- Rate limit: Reasonable use

---

## 💻 Development

### Setup
```bash
# Clone/Download project
cd translate-app-clientside

# Install dependencies
yarn install

# Start dev server
yarn start
```

### Build
```bash
# Production build
yarn build

# Output di folder build/
```

### Test
```bash
# Run tests (jika ada)
yarn test
```

---

## 🚀 Deployment

### Recommended: Netlify
```bash
yarn build
netlify deploy --prod --dir=build
```

### Alternative: Vercel
```bash
vercel --prod
```

### Manual: Any Static Host
- Upload folder `build/` ke hosting
- Pastikan support SPA routing

**Lihat [DEPLOYMENT.md](DEPLOYMENT.md) untuk detail lengkap**

---

## 📊 Performance

### Bundle Size (estimated)
- Main bundle: ~500KB (gzipped)
- Vendor: ~300KB (React + libraries)
- Total: ~800KB first load

### Optimization
- Code splitting by route
- Lazy loading components
- Tree shaking (automatic)
- Production minification

### Loading Time
- First Load: ~2-3s (3G)
- Cached: <1s
- Interactive: <3s

---

## 🔄 Flow Diagram

```
┌─────────────┐
│ User Opens  │
│   Website   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Load React  │
│     App     │
└──────┬──────┘
       │
       ▼
┌─────────────┐      No API Key?
│ Check API   ├──────────┐
│     Key     │          │
└──────┬──────┘          │
       │ Has Key         │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│   Fetch     │   │ Show Warning│
│  Languages  │   │ + Input Key │
└──────┬──────┘   └─────────────┘
       │
       ▼
┌─────────────┐
│ User Upload │
│    File     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Select Lang │
│   & Start   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ POST DeepL  │
│   Upload    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Poll Status │◄──┐
│  (2s loop)  │   │
└──────┬──────┘   │
       │          │
       ▼          │
    Done?─────No──┘
       │
      Yes
       ▼
┌─────────────┐
│  Download   │
│   Result    │
└─────────────┘
```

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **API Key Exposure**
   - Visible di browser Network tab
   - OK untuk personal use
   - NOT recommended untuk public deployment

2. **No Progress Callback**
   - DeepL API tidak provide real-time progress
   - Progress bar based on polling attempts

3. **File Size Limit**
   - Tergantung DeepL API limits
   - Browser memory constraints

4. **CORS Dependency**
   - DeepL must support CORS
   - Currently supported ✅

### Future Enhancements
- [ ] PWA support (offline mode)
- [ ] Batch translation
- [ ] Translation history
- [ ] Custom glossary
- [ ] OCR for image-based PDFs

---

## 📝 Changelog

### Version 1.0.0 (2024)
- ✅ Initial release
- ✅ Client-side only architecture
- ✅ Direct DeepL API integration
- ✅ Modern UI with TailwindCSS
- ✅ API Key management
- ✅ 17+ language support
- ✅ Drag & drop upload
- ✅ Real-time status updates

---

## 🤝 Contributing

Contributions welcome! Areas to improve:
- UI/UX enhancements
- Additional features
- Bug fixes
- Documentation
- Testing

---

## 📄 License

MIT License - Free to use for personal and commercial projects

---

## 📞 Support

- **Documentation:** README.md, DEPLOYMENT.md, QUICK_START.md
- **Issues:** GitHub Issues
- **DeepL Support:** https://support.deepl.com

---

## 🙏 Credits

- **DeepL API** - Translation engine
- **Radix UI** - Accessible components
- **shadcn/ui** - Component library
- **Tailwind Labs** - TailwindCSS
- **Vercel** - React & Next.js team

---

**Made with ❤️ for personal use**

Last Updated: 2024

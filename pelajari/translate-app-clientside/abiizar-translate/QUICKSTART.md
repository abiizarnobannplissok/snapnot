# ⚡ Abiizar Translate - Quick Start Guide

Get up and running in 2 minutes!

## 🚀 Test Locally (Right Now!)

Your local server is already running at:
```
http://localhost:8080
```

**Open your browser and visit:** http://localhost:8080

## 📝 First Steps

### 1. Get a DeepL API Key (FREE)

1. Go to: https://www.deepl.com/pro-api
2. Click "Sign up for free"
3. Verify your email
4. Copy your API key (looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx`)

**Free tier includes:**
- ✅ 500,000 characters/month
- ✅ No credit card required
- ✅ Perfect for personal use

### 2. Configure the App

1. Open the app in your browser: http://localhost:8080
2. Click the **⚙️ Settings** icon (top right)
3. Paste your DeepL API key
4. Click **"Save API Key"**

### 3. Start Translating!

**Example Test:**

1. **Source Language:** Indonesian 🇮🇩
2. **Target Language:** English 🇺🇸
3. **Text to translate:**
   ```
   Selamat datang di Abiizar Translate!
   Aplikasi terjemahan modern dengan antarmuka yang elegan.
   ```
4. Click **"Translate"** or press `Ctrl+Enter`

**Expected Result:**
```
Welcome to Abiizar Translate!
Modern translation application with an elegant interface.
```

## 🎯 Key Features to Try

### Language Selection
- Click on language buttons to choose from 30+ languages
- Use the **🔄 Swap** button to reverse languages
- Search through the language list

### Translation
- Type or paste text (max 5,000 characters)
- Watch the character counter update in real-time
- Press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac) for quick translation

### Copy & Share
- Click **Copy** button to copy translation to clipboard
- Use the **Clear** button to reset

### Mobile Testing
- Open http://localhost:8080 on your phone (same network)
- Or use browser DevTools (F12) → Toggle device toolbar

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Enter` | Translate text |
| `Ctrl/Cmd + K` | Open settings |
| `Esc` | Close modals |

## 🌐 Deploy to Production

### Option 1: GitHub Pages (Recommended)

```bash
# 1. Create a GitHub repository
# 2. Push code
git init
git add .
git commit -m "Initial commit: Abiizar Translate"
git remote add origin https://github.com/YOUR_USERNAME/abiizar-translate.git
git push -u origin main

# 3. Enable GitHub Pages
# Go to repository Settings → Pages → Select main branch → Save
# Your app will be live at: https://YOUR_USERNAME.github.io/abiizar-translate
```

### Option 2: Netlify (Fastest)

```bash
# 1. Sign up at netlify.com
# 2. Drag and drop the 'abiizar-translate' folder
# 3. Your app is live instantly!
```

### Option 3: Vercel

```bash
npm install -g vercel
vercel --prod
# Follow the prompts
```

## 🔒 Important Notes

### For Personal Use
- ✅ Store your API key in the app
- ✅ Use on devices you trust
- ✅ Share with friends/family

### For Public Deployment
- ⚠️ **Don't hardcode your API key in the code**
- ⚠️ Consider using a proxy server (Cloudflare Workers)
- ⚠️ Anyone can see your API key in browser's Network tab

### Recommended Setup for Public Use
If you want to deploy publicly:

1. Use the existing Cloudflare Worker setup from the parent project
2. Update the `DEEPL_API_URL` in `app.js` to point to your worker
3. Deploy the frontend normally

See: `../CLOUDFLARE_WORKERS_SETUP.md` for details

## 📱 Test on Mobile

### Via Network (Same WiFi)

1. Find your computer's IP address:
   ```bash
   # Linux/Mac
   hostname -I | awk '{print $1}'
   
   # Windows
   ipconfig
   ```

2. On your phone's browser, visit:
   ```
   http://YOUR_IP_ADDRESS:8080
   ```

### Via ngrok (Internet Access)

```bash
# Install ngrok
# Download from: https://ngrok.com/download

# Expose local server
ngrok http 8080

# Use the provided HTTPS URL (e.g., https://abc123.ngrok.io)
```

## 🎨 Customization Ideas

### Change Theme Colors

Edit `index.html` - change Tailwind classes:

```html
<!-- Yellow theme (current) -->
<div class="bg-gradient-to-br from-yellow-50 via-white to-yellow-100">

<!-- Blue theme -->
<div class="bg-gradient-to-br from-blue-50 via-white to-blue-100">

<!-- Purple theme -->
<div class="bg-gradient-to-br from-purple-50 via-white to-purple-100">
```

### Add Your Branding

1. Replace the app name in `index.html`:
   ```html
   <h1 class="text-xl font-bold text-gray-800">Your Brand Name</h1>
   ```

2. Change the favicon emoji:
   ```html
   <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>">
   ```

## 🐛 Quick Troubleshooting

### "Translation failed" error
- ✅ Check API key is saved correctly
- ✅ Verify internet connection
- ✅ Check DeepL API status: https://status.deepl.com

### API key not saving
- ✅ Check browser's localStorage is enabled
- ✅ Try in incognito mode
- ✅ Clear browser cache

### CORS errors
- ✅ For development: use local server (already running!)
- ✅ For production: deploy to HTTPS hosting
- ✅ DeepL API supports CORS for direct calls

## 📊 Monitor API Usage

Check your DeepL usage:
- Dashboard: https://www.deepl.com/account/usage
- Free tier: 500,000 characters/month
- Resets monthly

## 🎯 Next Steps

1. ✅ Test the application thoroughly
2. ✅ Customize colors and branding if desired
3. ✅ Deploy to production (GitHub Pages/Netlify/Vercel)
4. ✅ Share with others!

## 📞 Need Help?

- 📖 Full documentation: `README.md`
- 🔧 DeepL API docs: https://www.deepl.com/docs-api
- 💬 Issues: Create a GitHub issue

---

**Ready to translate the world! 🌍**

Enjoy using Abiizar Translate!

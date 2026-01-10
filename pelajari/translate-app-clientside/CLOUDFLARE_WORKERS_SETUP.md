# ☁️ Cloudflare Workers Setup Guide

## 🎯 Arsitektur

```
Browser (aaPanel) → Cloudflare Worker (Proxy) → DeepL API
```

**Keuntungan:**
- ✅ **GRATIS** - 100,000 requests/day gratis!
- ✅ **Global CDN** - Super cepat dari mana saja
- ✅ **No CORS Issue** - Worker sebagai proxy
- ✅ **API Key Aman** - Dikirim via header, tidak hardcoded
- ✅ **Easy Deploy** - 2 menit setup!

---

## 📋 Prerequisites

1. **Akun Cloudflare** (gratis!)
   - Daftar di: https://dash.cloudflare.com/sign-up

2. **Node.js & npm**
   - Sudah installed (check: `node --version`)

---

## 🚀 Step-by-Step Deployment

### Step 1: Install Wrangler CLI

```bash
# Install globally
npm install -g wrangler

# Atau install di folder worker
cd worker
npm install
```

### Step 2: Login ke Cloudflare

```bash
wrangler login
```

Browser akan terbuka, klik "Allow" untuk authorize.

### Step 3: Deploy Worker

```bash
cd worker
wrangler deploy
```

**Output:**
```
Published translate-dokumen-proxy (1.23s)
  https://translate-dokumen-proxy.YOUR-SUBDOMAIN.workers.dev
```

**Copy URL ini!** Contoh: `https://translate-dokumen-proxy.abc123.workers.dev`

### Step 4: Update Frontend Configuration

Buat file `.env` di root folder frontend:

```bash
cd ..
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_WORKER_URL=https://translate-dokumen-proxy.YOUR-SUBDOMAIN.workers.dev
```

**Ganti dengan URL Worker Anda!**

### Step 5: Build Frontend

```bash
npm run build
```

### Step 6: Deploy Frontend ke aaPanel

1. Upload folder `build/` ke aaPanel
2. Extract di `public_html` atau folder website Anda
3. Done! ✨

---

## 🧪 Test Local (Opsional)

Sebelum deploy, test dulu di local:

### Terminal 1: Run Worker Locally

```bash
cd worker
wrangler dev
```

Worker jalan di: `http://localhost:8787`

### Terminal 2: Run Frontend

```bash
# Pastikan .env pointing ke localhost
echo "REACT_APP_WORKER_URL=http://localhost:8787" > .env

npm start
```

Frontend jalan di: `http://localhost:3001`

Test upload & translate file!

---

## 📝 Configuration Files

### `worker/wrangler.toml`

```toml
name = "translate-dokumen-proxy"
main = "index.js"
compatibility_date = "2024-01-01"
```

**Customization:**
- Ganti `name` untuk custom subdomain
- Add `routes` untuk custom domain

### `worker/index.js`

Worker script sudah siap pakai! Support:
- ✅ GET `/languages` - Ambil daftar bahasa
- ✅ POST `/document/upload` - Upload dokumen
- ✅ POST `/document/{id}/status` - Cek status
- ✅ POST `/document/{id}/download` - Download hasil

---

## 🔐 Security

### API Key Flow

```
1. User input API key di browser
2. Tersimpan di localStorage
3. Dikirim via header X-DeepL-API-Key ke Worker
4. Worker forward ke DeepL dengan Authorization header
5. Response kembali ke browser
```

**API Key TIDAK tersimpan di Worker!** Hanya diteruskan.

### CORS Headers

Worker sudah setup CORS dengan:
```javascript
'Access-Control-Allow-Origin': '*'
```

Untuk production, bisa dibatasi:
```javascript
'Access-Control-Allow-Origin': 'https://yourdomain.com'
```

Edit di `worker/index.js` line 8.

---

## 💰 Pricing & Limits

### Cloudflare Workers (Free Tier)

| Feature | Free | Paid |
|---------|------|------|
| **Requests** | 100,000/day | Unlimited |
| **CPU Time** | 10ms/request | 50ms/request |
| **Memory** | 128MB | 128MB |
| **Workers** | Unlimited | Unlimited |

**Cukup untuk ribuan terjemahan per hari!**

### DeepL API (Free Tier)

- 500,000 characters/month
- Perfect untuk personal use

---

## 🛠️ Troubleshooting

### Error: "Not authenticated"

```bash
wrangler login
```

### Error: "Worker exceeded CPU limit"

Upload file terlalu besar. DeepL API ada limit per file.

### Error: "CORS policy"

Pastikan Worker sudah deploy dan URL di `.env` benar.

### Worker URL tidak bisa diakses

Check deploy status:
```bash
wrangler deployments list
```

Atau check di dashboard: https://dash.cloudflare.com/workers

### Frontend masih pakai DeepL direct

Pastikan:
1. `.env` file ada dan benar
2. Restart development server (`npm start`)
3. Clear cache browser (Ctrl+Shift+R)

---

## 🔄 Update Worker

Edit `worker/index.js`, lalu:

```bash
cd worker
wrangler deploy
```

Tidak perlu rebuild frontend!

---

## 📊 Monitoring

### View Logs (Real-time)

```bash
cd worker
wrangler tail
```

### View Analytics

Dashboard: https://dash.cloudflare.com/workers

Lihat:
- Total requests
- Success/error rate
- Response time
- CPU usage

---

## 🌐 Custom Domain (Opsional)

Mau pakai domain sendiri? Misalnya: `api.domain.com`

### Step 1: Add Domain ke Cloudflare

1. Add domain di Cloudflare DNS
2. Create DNS record (A atau CNAME)

### Step 2: Update wrangler.toml

```toml
[env.production]
routes = [
  { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

### Step 3: Deploy

```bash
wrangler deploy --env production
```

### Step 4: Update Frontend .env

```
REACT_APP_WORKER_URL=https://api.yourdomain.com
```

Done! Sekarang pakai custom domain. 🎉

---

## 📚 Advanced Configuration

### Add Rate Limiting

Edit `worker/index.js`, tambahkan di awal `handleRequest`:

```javascript
// Simple rate limiting (per IP)
const ip = request.headers.get('CF-Connecting-IP');
// Implement your rate limiting logic here
```

### Add Caching

Cache language list:

```javascript
// Cache languages response for 1 hour
if (path === '/languages') {
  return await getLanguages(apiKey, {
    cacheTtl: 3600
  });
}
```

### Add Logging

Tambahkan logging untuk debugging:

```javascript
console.log('Request:', {
  path: url.pathname,
  method: request.method,
  timestamp: new Date().toISOString()
});
```

View logs dengan `wrangler tail`.

---

## 🎓 Learning Resources

- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler/
- **Workers Docs:** https://developers.cloudflare.com/workers/
- **DeepL API Docs:** https://www.deepl.com/docs-api

---

## ✅ Checklist Deployment

- [ ] Wrangler installed (`npm install -g wrangler`)
- [ ] Login to Cloudflare (`wrangler login`)
- [ ] Deploy worker (`cd worker && wrangler deploy`)
- [ ] Copy Worker URL
- [ ] Update `.env` with Worker URL
- [ ] Build frontend (`npm run build`)
- [ ] Upload `build/` ke aaPanel
- [ ] Test di browser!
- [ ] Input DeepL API Key
- [ ] Upload & translate file
- [ ] Success! 🎉

---

## 🆘 Need Help?

**Quick Fixes:**

1. **Worker tidak bisa diakses:**
   ```bash
   wrangler deployments list
   wrangler deploy --compatibility-date=2024-01-01
   ```

2. **Frontend error "Failed to fetch":**
   - Check `.env` file exists
   - Check REACT_APP_WORKER_URL benar
   - Restart: `npm start`

3. **DeepL API error:**
   - Check API Key valid
   - Check quota tidak habis
   - Check file size < 50MB

**Still stuck?** 
- Check browser console (F12)
- Check worker logs: `wrangler tail`
- Check DeepL API status

---

## 💡 Tips & Best Practices

1. **Environment Variables**
   - Development: `http://localhost:8787`
   - Production: Worker URL

2. **Git**
   - `.env` sudah di `.gitignore`
   - Jangan commit API keys!

3. **Testing**
   - Test di local dulu (`wrangler dev`)
   - Deploy ke production kalau sudah OK

4. **Monitoring**
   - Set up alerts di Cloudflare dashboard
   - Monitor quota DeepL API

5. **Backup**
   - Keep `worker/index.js` backed up
   - Document your customizations

---

**Selamat! Website Anda sekarang production-ready dengan Cloudflare Workers! 🚀**

Total biaya: **$0/bulan** (sampai 100K requests/day)

Happy translating! 🌍✨

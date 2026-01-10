# 🚀 Panduan Deployment

## Deploy ke Netlify (Paling Mudah!) ⭐

### Cara 1: Drag & Drop (Termudah!)

1. **Build aplikasi:**
   ```bash
   yarn build
   ```

2. **Buka Netlify Drop:**
   - Kunjungi: https://app.netlify.com/drop
   - Drag folder `build/` ke halaman tersebut
   - Tunggu upload selesai
   - Done! Website sudah live ✨

### Cara 2: Netlify CLI (Lebih Profesional)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Build dan Deploy:**
   ```bash
   yarn build
   netlify deploy --prod --dir=build
   ```

4. **Selesai!** URL akan muncul di terminal

### Cara 3: Connect Git Repository (Auto Deploy)

1. **Push ke GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/repo.git
   git push -u origin main
   ```

2. **Connect ke Netlify:**
   - Login ke [Netlify](https://app.netlify.com)
   - Klik "Add new site" > "Import an existing project"
   - Pilih GitHub repository
   - Build settings:
     - Build command: `yarn build`
     - Publish directory: `build`
   - Deploy!

3. **Keuntungan:**
   - Setiap push otomatis deploy
   - Preview untuk setiap Pull Request
   - Rollback mudah

---

## Deploy ke Vercel

### Cara 1: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Cara 2: Vercel Dashboard

1. Login ke [Vercel](https://vercel.com)
2. Import repository GitHub
3. Build settings:
   - Framework Preset: Create React App
   - Build Command: `yarn build`
   - Output Directory: `build`
4. Deploy!

---

## Deploy ke GitHub Pages

1. **Install gh-pages:**
   ```bash
   yarn add -D gh-pages
   ```

2. **Update package.json:**
   ```json
   {
     "homepage": "https://username.github.io/repo-name",
     "scripts": {
       "predeploy": "yarn build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. **Deploy:**
   ```bash
   yarn deploy
   ```

4. **Aktifkan GitHub Pages:**
   - Repository Settings > Pages
   - Source: Branch `gh-pages`
   - Save

---

## Deploy ke Cloudflare Pages

### Cara 1: Dashboard

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Pages > Create a project
3. Connect Git repository
4. Build settings:
   - Build command: `yarn build`
   - Build output directory: `build`
5. Deploy!

### Cara 2: Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Build
yarn build

# Deploy
wrangler pages deploy build
```

---

## Deploy Manual (cPanel, Hostinger, dll)

1. **Build:**
   ```bash
   yarn build
   ```

2. **Upload:**
   - Zip folder `build/`
   - Upload ke hosting via cPanel/FTP
   - Extract di folder `public_html`

3. **Configure:**
   - Pastikan `.htaccess` ada untuk SPA routing:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

## Custom Domain

### Netlify
1. Site settings > Domain management
2. Add custom domain
3. Update DNS sesuai instruksi
4. SSL otomatis aktif

### Vercel
1. Project settings > Domains
2. Add domain
3. Configure DNS
4. SSL otomatis

### Cloudflare Pages
1. Custom domains > Set up a custom domain
2. Follow instruksi
3. SSL via Cloudflare

---

## Environment Variables (Opsional)

Jika ingin set default API Key (tidak disarankan untuk publik):

### Netlify
Site settings > Environment variables
```
REACT_APP_DEEPL_API_KEY=your_key
```

### Vercel
Project settings > Environment Variables
```
REACT_APP_DEEPL_API_KEY=your_key
```

**⚠️ WARNING:** Jangan set API Key di environment untuk website publik! API Key akan terexpose di bundle JS.

---

## Checklist Pre-Deploy ✅

- [ ] Test build lokal: `yarn build && yarn start`
- [ ] Hapus console.log yang tidak perlu
- [ ] Hapus API Key hardcoded (jika ada)
- [ ] Update README.md dengan URL production
- [ ] Test di browser berbeda
- [ ] Test responsive di mobile
- [ ] Pastikan .env tidak ter-commit

---

## Performance Optimization

### 1. Code Splitting (Sudah di CRA)
Otomatis split by route jika pakai React Router

### 2. Image Optimization
Compress images di `public/`:
```bash
npm install -g imagemin-cli
imagemin public/images/* --out-dir=public/images
```

### 3. Lighthouse Score
Test performance:
- Chrome DevTools > Lighthouse
- Aim for 90+ score

### 4. CDN
Netlify, Vercel, Cloudflare sudah include CDN global.

---

## Monitoring & Analytics

### Google Analytics
Tambahkan di `public/index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Netlify Analytics
- Built-in analytics (berbayar)
- Site settings > Analytics

---

## Troubleshooting

### Build gagal
```bash
# Clear cache
rm -rf node_modules
rm yarn.lock
yarn install
yarn build
```

### 404 on refresh
Tambah `_redirects` di `public/`:
```
/*    /index.html   200
```

### CORS Error
Pastikan deploy dengan HTTPS, bukan HTTP.

---

## Backup & Rollback

### Netlify
Deploys > Pilih deploy lama > "Publish deploy"

### Vercel
Deployments > Pilih deployment > Promote to Production

### GitHub Pages
```bash
git revert <commit-hash>
git push
yarn deploy
```

---

**Happy Deploying! 🎉**

Jika ada masalah, cek logs di platform masing-masing atau buka issue di GitHub.

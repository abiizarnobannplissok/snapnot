# 📱 PWA Setup - SnapNotes

## ✅ Fitur PWA yang Sudah Diimplementasikan

SnapNotes sekarang adalah **Progressive Web App (PWA)** yang dapat diinstall di berbagai device dan berfungsi offline!

### 🎯 Fitur Utama

1. **Installable** - Dapat diinstall di desktop dan mobile
2. **Offline Support** - Service worker untuk caching dan offline functionality
3. **App-like Experience** - Tampilan fullscreen tanpa browser UI
4. **Fast Loading** - Assets di-cache untuk loading lebih cepat
5. **Auto-update Detection** - Deteksi versi baru otomatis

---

## 📦 File yang Ditambahkan

### 1. `/public/manifest.json`
Web App Manifest dengan konfigurasi PWA:
- **Name**: SnapNotes - Notes File Sharing and Translate
- **Short Name**: SnapNotes
- **Theme Color**: #D4FF00 (Neon Yellow)
- **Background Color**: #F5F5F5
- **Icons**: Multiple sizes dari 36x36 hingga 310x310
- **Shortcuts**: Quick actions untuk New Note dan File Share

### 2. `/public/sw.js`
Service Worker untuk:
- Cache app shell dan assets
- Offline functionality
- Network-first strategy untuk API calls
- Cache management dan cleanup

### 3. `/components/InstallPWA.tsx`
Install prompt component yang:
- Mendeteksi kemampuan install PWA
- Menampilkan prompt install yang user-friendly
- Menyimpan preferensi user (jika dismiss)
- Auto-hide jika sudah installed

---

## 🚀 Cara Install PWA

### Di Desktop (Chrome/Edge)
1. Buka website SnapNotes
2. Klik icon **Install** di address bar (biasanya icon +)
3. Atau klik menu (⋮) → **Install SnapNotes**
4. Klik **Install** di dialog konfirmasi
5. App akan muncul di desktop dan dapat dibuka seperti aplikasi native

### Di Android
1. Buka website SnapNotes di Chrome
2. Tap menu (⋮) → **Add to Home screen** atau **Install app**
3. Tap **Install**
4. Icon SnapNotes akan muncul di home screen

### Di iOS (Safari)
1. Buka website SnapNotes di Safari
2. Tap tombol **Share** (ikon kotak dengan panah ke atas)
3. Scroll dan tap **Add to Home Screen**
4. Tap **Add**
5. Icon SnapNotes akan muncul di home screen

---

## 🔧 Konfigurasi PWA

### Manifest Settings
```json
{
  "name": "SnapNotes - Notes File Sharing and Translate",
  "short_name": "SnapNotes",
  "theme_color": "#D4FF00",
  "background_color": "#F5F5F5",
  "display": "standalone",
  "orientation": "portrait-primary"
}
```

### Service Worker Cache Strategy
- **App Shell**: Cache-first
- **API Calls**: Network-first
- **Assets**: Cache-first dengan network fallback

### Icons Digunakan
- **192x192**: `/favicon/android-icon-192x192.png` (maskable)
- **180x180**: `/favicon/apple-icon-180x180.png` (iOS)
- **310x310**: `/favicon/ms-icon-310x310.png` (large)
- Multiple sizes: 36, 48, 72, 96, 144

---

## 🧪 Testing PWA

### Chrome DevTools
1. Buka DevTools (F12)
2. Tab **Application**
3. Section **Manifest** - Check manifest loaded correctly
4. Section **Service Workers** - Check SW registered and active
5. **Lighthouse** - Run PWA audit untuk score dan recommendations

### Manual Testing
- [ ] Install dari browser
- [ ] Open as standalone app
- [ ] Test offline functionality (disconnect network)
- [ ] Test app shortcuts
- [ ] Test update detection

---

## 📊 PWA Checklist

✅ Web app manifest dengan name, icons, theme  
✅ Service worker registered dan active  
✅ HTTPS (required for PWA, localhost exempt)  
✅ Responsive design untuk semua device  
✅ Fast loading (< 3s on 3G)  
✅ Works offline atau dengan poor connection  
✅ Install prompt implementation  
✅ App shortcuts untuk quick actions  
✅ Theme color untuk status bar  
✅ Proper meta tags untuk mobile  

---

## 🔄 Update PWA

Ketika deploy versi baru:

1. **Service Worker** akan otomatis detect update
2. Download assets baru di background
3. Log "New version available" di console
4. User bisa refresh untuk apply update
5. Atau implement custom update notification

### Force Update
Untuk force update service worker:
```javascript
// Di console browser
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.update());
});
```

---

## 🐛 Troubleshooting

### PWA tidak muncul opsi install
- Pastikan HTTPS (atau localhost)
- Check manifest.json loaded di DevTools
- Check tidak ada error di console
- Check memenuhi PWA installability criteria

### Service Worker tidak register
- Check path `/sw.js` accessible
- Check tidak ada error syntax di sw.js
- Try hard refresh (Ctrl+Shift+R)
- Unregister dan register ulang di DevTools

### Cache tidak update
- Increment `CACHE_NAME` version di sw.js
- Force service worker update
- Clear cache di DevTools → Application → Storage

### Install prompt tidak muncul
- User mungkin sudah dismiss sebelumnya
- Check localStorage `pwa-install-dismissed`
- Clear localStorage untuk test ulang
- Pastikan event `beforeinstallprompt` fired

---

## 📚 Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Workbox (Advanced PWA)](https://developers.google.com/web/tools/workbox)

---

## 🎉 Next Steps

Fitur PWA yang bisa ditambahkan:
- [ ] Background sync untuk notes
- [ ] Push notifications
- [ ] Offline editing dengan queue
- [ ] Advanced caching strategies
- [ ] Share target API
- [ ] File handler API

---

**Made with ❤️ for SnapNotes PWA**

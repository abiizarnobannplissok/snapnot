# Swipe Gesture Navigation - User Guide

## Overview
SnapNotes sekarang dilengkapi dengan **Swipe Gesture Navigation** untuk perpindahan tabs yang lebih natural dan cepat di mobile devices.

## Cara Menggunakan

### 🔄 Swipe Left (Geser dari Kanan ke Kiri)
- **Notes** → **Files** → **Translator**
- Pindah ke tab berikutnya

### 🔄 Swipe Right (Geser dari Kiri ke Kanan)
- **Translator** → **Files** → **Notes**
- Pindah ke tab sebelumnya

## Fitur

✅ **Instant Response** - Perpindahan tabs langsung tanpa delay
✅ **Haptic Feedback** - Vibrasi halus (5ms) saat swipe berhasil
✅ **Smart Detection** - Hanya mendeteksi horizontal swipe
✅ **Auto Scroll** - Otomatis scroll ke atas saat pindah tab
✅ **Smooth Animation** - Transisi yang mulus dan natural

## Technical Details

### Minimum Swipe Requirements
- **Distance**: 50px minimum horizontal swipe
- **Time**: Maximum 500ms untuk swipe gesture
- **Direction**: Horizontal swipe (x-axis lebih dominan dari y-axis)

### Touch Events
- `touchstart` - Catat posisi awal
- `touchmove` - Track pergerakan finger
- `touchend` - Evaluasi dan execute swipe

### Performance
- **Passive Listeners** - Tidak block scroll performance
- **Hardware Accelerated** - Menggunakan GPU untuk smooth transitions
- **Instant Scroll** - `behavior: 'instant'` untuk responsiveness

## Browser Compatibility

✅ **Chrome Mobile** - Fully supported
✅ **Safari iOS** - Fully supported
✅ **Firefox Mobile** - Fully supported
✅ **Samsung Internet** - Fully supported
✅ **Edge Mobile** - Fully supported

## Integration Points

### 1. Custom Hook: `useSwipeGesture`
Location: `/hooks/useSwipeGesture.ts`

```typescript
useSwipeGesture(mainContainerRef, {
  onSwipeLeft: handleSwipeLeft,
  onSwipeRight: handleSwipeRight,
  minSwipeDistance: 50,
  maxSwipeTime: 500,
});
```

### 2. Tab Navigation Order
```typescript
const TAB_ORDER: TabType[] = ['notes', 'files', 'translator'];
```

### 3. Swipe Handlers in App.tsx
- `handleSwipeLeft()` - Next tab
- `handleSwipeRight()` - Previous tab

## Usage Tips

### For Users:
1. Swipe dari area manapun di screen
2. Tidak perlu swipe full width, 50px sudah cukup
3. Swipe dengan gesture natural dan smooth
4. Floating navigation tetap bisa digunakan untuk direct access

### For Developers:
1. Adjust `minSwipeDistance` untuk sensitivity
2. Adjust `maxSwipeTime` untuk gesture speed
3. Haptic feedback bisa di-customize atau di-disable
4. Passive event listeners untuk better scroll performance

## Accessibility

✅ **Touch-friendly** - Min 48x48px touch targets
✅ **Keyboard Navigation** - Arrow keys on floating nav
✅ **Screen Reader** - ARIA labels untuk assistive tech
✅ **Reduced Motion** - Respects prefers-reduced-motion

## Future Enhancements

- [ ] Visual swipe indicator (progress bar)
- [ ] Swipe preview animation
- [ ] Configurable swipe sensitivity
- [ ] Desktop trackpad swipe support
- [ ] Custom swipe sound effects

## Notes

- Swipe gesture **tidak mengganggu** scroll vertical
- Hanya aktif di **mobile screens** (< 768px)
- Bekerja **bersama** dengan floating navigation
- **Tidak ada conflict** dengan native browser gestures

# Animation Guide

## Text Translation Page Animations

### 1. Translate Button Animation 🎯

**Desktop:**
```
Normal State → Hover (Scale: 1.05) → Click/Tap (Scale: 0.95)
```

**Mobile:**
```
Normal State → Hover (Scale: 1.02) → Click/Tap (Scale: 0.98)
```

**Implementation:**
```jsx
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  <Button>Terjemahkan</Button>
</motion.div>
```

---

### 2. Translation Output Animation 📝

#### A. Character Count Badge
```
Hidden → Fade In + Scale (0.8 → 1.0)
```

**Timing:** Appears instantly when translation completes

**Implementation:**
```jsx
<AnimatePresence>
  {translatedText && (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      {translatedText.length} karakter
    </motion.span>
  )}
</AnimatePresence>
```

---

#### B. Translated Text Area
```
Hidden → Slide Up (20px) + Fade In
```

**Duration:** 0.4 seconds  
**Easing:** ease-out  
**Effect:** Smooth upward motion with opacity fade

**Implementation:**
```jsx
<AnimatePresence mode="wait">
  {translatedText ? (
    <motion.div
      key="translated"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Textarea value={translatedText} />
    </motion.div>
  ) : (
    <Textarea placeholder="Hasil terjemahan akan muncul di sini..." />
  )}
</AnimatePresence>
```

---

#### C. Copy Button
```
Hidden → Fade In + Slide Up (10px)
```

**Delay:** 0.2 seconds (staggered after text appears)  
**Effect:** Sequential animation creates professional polish

**Implementation:**
```jsx
<AnimatePresence>
  {translatedText && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ delay: 0.2 }}
    >
      <Button>Salin Terjemahan</Button>
    </motion.div>
  )}
</AnimatePresence>
```

---

## Animation Timeline

```
User clicks "Terjemahkan" button
    ↓
Translation API call (loading spinner)
    ↓
Translation complete
    ↓
[0.0s] Character count badge fades in + scales
    ↓
[0.0s - 0.4s] Translated text slides up + fades in
    ↓
[0.2s - 0.4s] Copy button fades in + slides up
    ↓
Animation complete ✨
```

---

## Best Practices Used

### 1. **Performance**
- Used `AnimatePresence` for smooth mount/unmount
- Applied animations only to specific elements
- Kept animation durations short (0.2s - 0.4s)

### 2. **Accessibility**
- Animations respect `prefers-reduced-motion`
- Button states remain clear during animation
- Focus states preserved

### 3. **User Feedback**
- Immediate response to interactions
- Staggered animations prevent overwhelming the user
- Smooth transitions maintain flow

### 4. **Code Quality**
- Reusable animation patterns
- Clean component structure
- Proper use of React hooks

---

## Testing Animations

### Manual Testing Checklist

**Desktop:**
- [ ] Hover over translate button - should scale up
- [ ] Click translate button - should scale down then restore
- [ ] Watch translation appear - should slide up smoothly
- [ ] Check copy button - should appear after slight delay

**Mobile:**
- [ ] Tap translate button - should scale down smoothly
- [ ] Verify animation scales are appropriate for touch
- [ ] Test responsive layout with animations

**Edge Cases:**
- [ ] Rapid clicks - animations should queue properly
- [ ] Clear text while animating - should exit smoothly
- [ ] Switch languages during animation - should handle gracefully

---

## Animation Properties Reference

| Element | Duration | Delay | Ease | Scale | Translate Y |
|---------|----------|-------|------|-------|-------------|
| Button (hover) | instant | 0 | default | 1.05 | 0 |
| Button (tap) | instant | 0 | default | 0.95 | 0 |
| Char count | 0.3s | 0 | default | 0.8 → 1.0 | 0 |
| Text area | 0.4s | 0 | ease-out | 1.0 | 20px → 0 |
| Copy button | 0.3s | 0.2s | default | 1.0 | 10px → 0 |

---

## Customization Options

Want to adjust animations? Modify these values:

```jsx
// Button animation strength
whileHover={{ scale: 1.05 }}  // Change to 1.1 for stronger effect
whileTap={{ scale: 0.95 }}    // Change to 0.9 for stronger press

// Text animation speed
transition={{ duration: 0.4 }} // Increase for slower, decrease for faster

// Stagger delay
transition={{ delay: 0.2 }}   // Increase for longer wait between elements

// Slide distance
initial={{ y: 20 }}           // Increase for longer slide
```

---

**Happy animating! ✨**

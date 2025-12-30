# Smooth Animation Specifications

## Floating Navigation Hide/Show Animation

### Design Philosophy
Animasi dirancang untuk **terlihat jelas** (visible) dan **smooth** (tidak terlalu cepat atau langsung hilang). User harus bisa melihat floating navigation slide down dengan natural saat modal dibuka.

---

## Hide Animation (When Modal Opens)

### Visual Effect
```
Initial State          Mid Animation         Final State
┌────────────┐         ┌────────────┐         
│  [📝📂🌐]  │    →    │            │    →    (Below screen)
│  Scale 1.0 │         │ Scale 0.95 │         Scale 0.9
│  Y: 0      │         │ Y: 60px    │         Y: 120px
│  Opacity 1 │         │ Opacity 0.5│         Opacity 0
└────────────┘         └────────────┘         
```

### Technical Specs

**Transform:**
```css
transform: translateX(-50%) translateY(120px) scale(0.9) translateZ(0);
```

**Timing:**
- **Duration**: 450ms (0.45s)
- **Easing**: `cubic-bezier(0.4, 0, 0.6, 1)`
- **Function**: Smooth ease-out

**Opacity:**
```css
opacity: 0;
transition: opacity 0.4s ease-out 0.05s;
```
- **Duration**: 400ms (0.4s)
- **Delay**: 50ms (untuk memastikan slide terlihat dulu)
- **Easing**: ease-out

**Movement Breakdown:**
| Time    | Y Position | Scale | Opacity | Visual |
|---------|-----------|-------|---------|--------|
| 0ms     | 0px       | 1.0   | 1.0     | ████████ Full visible |
| 50ms    | 15px      | 0.98  | 1.0     | ████████ Starting slide |
| 100ms   | 35px      | 0.95  | 0.9     | ███████░ Clear motion |
| 200ms   | 70px      | 0.93  | 0.6     | ████░░░░ Half way |
| 300ms   | 95px      | 0.91  | 0.3     | ██░░░░░░ Almost gone |
| 450ms   | 120px     | 0.9   | 0       | ░░░░░░░░ Fully hidden |

---

## Show Animation (When Modal Closes)

### Visual Effect
```
Initial State         Mid Animation         Final State
(Below screen)        ┌────────────┐         ┌────────────┐
Scale 0.9        →    │ Scale 1.05 │    →    │  [📝📂🌐]  │
Y: 120px              │ Y: -10px   │         │  Scale 1.0 │
Opacity 0             │ Opacity 0.8│         │  Y: 0      │
                      └────────────┘         │  Opacity 1 │
                      (Bounce)               └────────────┘
```

### Technical Specs

**Transform:**
```css
transform: translateX(-50%) translateY(0) scale(1) translateZ(0);
```

**Timing:**
- **Duration**: 500ms (0.5s)
- **Easing**: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- **Function**: Bounce effect (elastic)

**Opacity:**
```css
opacity: 1;
transition: opacity 0.4s ease-in;
```
- **Duration**: 400ms (0.4s)
- **Delay**: 0ms (immediate)
- **Easing**: ease-in

**Movement Breakdown:**
| Time    | Y Position | Scale | Opacity | Visual |
|---------|-----------|-------|---------|--------|
| 0ms     | 120px     | 0.9   | 0       | ░░░░░░░░ Hidden |
| 50ms    | 90px      | 0.92  | 0.2     | ██░░░░░░ Emerging |
| 100ms   | 60px      | 0.95  | 0.5     | ████░░░░ Rising |
| 200ms   | 20px      | 1.02  | 0.8     | ███████░ Almost there |
| 300ms   | -10px     | 1.05  | 0.95    | ████████ Overshoot |
| 400ms   | 5px       | 1.02  | 1.0     | ████████ Bounce back |
| 500ms   | 0px       | 1.0   | 1.0     | ████████ Final position |

---

## Easing Curve Details

### Hide: `cubic-bezier(0.4, 0, 0.6, 1)`
```
│     
│ ╱─────
│╱      
└────────
Start → End
```
- **Characteristic**: Smooth deceleration
- **Feel**: Natural, not rushed
- **Purpose**: Visible, comfortable exit

### Show: `cubic-bezier(0.34, 1.56, 0.64, 1)`
```
│      ╱╲
│     ╱  ╲
│ ───╱    ╲
└──────────
Start → End (with overshoot)
```
- **Characteristic**: Elastic bounce
- **Feel**: Playful, welcoming
- **Purpose**: Energetic entrance

---

## GPU Acceleration

### Why `translateZ(0)`?
```css
transform: translateX(-50%) translateY(120px) scale(0.9) translateZ(0);
```

Forces browser to use GPU (Graphics Processing Unit) instead of CPU:
- ✅ **60 FPS** smooth animation
- ✅ **Lower CPU** usage
- ✅ **Battery efficient** on mobile
- ✅ **No jank** during animation

### Hardware Layers
Browser creates separate layer for animated element:
```
┌─────────────────┐
│  Main Page      │  ← CPU layer
├─────────────────┤
│  Floating Nav   │  ← GPU layer (separate)
└─────────────────┘
```

---

## Timing Comparison

### Before (Too Fast)
| Animation | Duration | Feel |
|-----------|----------|------|
| Hide      | 300ms    | ⚡ Too quick, barely visible |
| Show      | 350ms    | ⚡ Abrupt appearance |

### After (Smooth)
| Animation | Duration | Feel |
|-----------|----------|------|
| Hide      | 450ms    | ✨ Smooth, clearly visible |
| Show      | 500ms    | ✨ Welcoming bounce |

**Improvement**: +50% duration = Much more visible and smooth

---

## Mobile Performance

### Touch Response Time
```
User Action          Animation Start       Animation Complete
     │                      │                      │
     ├─────────────────────►├─────────────────────►│
     0ms                   0ms                   450ms
                         Instant              Smooth fade
```

### Battery Impact
- **Low**: Uses GPU hardware acceleration
- **Optimized**: Only animates when needed (modal open/close)
- **Efficient**: Transforms & opacity are GPU-friendly properties

---

## Accessibility

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  .floating-tab-nav {
    transition: none !important;
  }
}
```

For users with motion sensitivity:
- ✅ Instant hide/show (no animation)
- ✅ No dizziness or discomfort
- ✅ Still functional

---

## Browser Compatibility

| Browser | Transform | Scale | translateZ | Cubic-bezier |
|---------|-----------|-------|------------|--------------|
| Chrome Mobile | ✅ | ✅ | ✅ | ✅ |
| Safari iOS | ✅ | ✅ | ✅ | ✅ |
| Firefox Mobile | ✅ | ✅ | ✅ | ✅ |
| Samsung Internet | ✅ | ✅ | ✅ | ✅ |
| Edge Mobile | ✅ | ✅ | ✅ | ✅ |

**Result**: 100% compatible dengan modern mobile browsers

---

## Testing Checklist

### Visual Quality
- [ ] Animation terlihat smooth (tidak patah-patah)
- [ ] Slide down terlihat jelas (tidak instant)
- [ ] Scale effect terasa natural (tidak terlalu kecil/besar)
- [ ] Opacity fade smooth (tidak blink)
- [ ] Bounce entrance terasa welcoming (tidak over-the-top)

### Performance
- [ ] No frame drops (maintain 60 FPS)
- [ ] No layout shifts
- [ ] No excessive repaints
- [ ] Works on low-end devices
- [ ] Battery drain minimal

### Edge Cases
- [ ] Rapid open/close modal (fast clicking)
- [ ] Mid-animation interruption
- [ ] Landscape orientation
- [ ] Different screen sizes (320px - 767px)
- [ ] During page scroll

---

## Summary

**Hide Animation:**
- 450ms smooth slide down + scale
- Clearly visible to user
- Natural, comfortable exit

**Show Animation:**
- 500ms bouncy slide up
- Welcoming, playful entrance
- Energetic reveal

**Result:**
- ✨ Smooth, polished feel
- 👁️ Clearly visible transitions
- 🚀 GPU-accelerated performance
- ♿ Accessible (reduced motion support)
- 📱 Mobile-optimized

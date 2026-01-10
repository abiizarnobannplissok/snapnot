# SnapNot Translator Redesign - Apple-Inspired Modern UI

**Date:** 2026-01-10  
**Status:** Approved for Implementation  
**Design Philosophy:** Apple-inspired minimalism with vibrant red accent

---

## 🎯 Overview

Complete redesign of SnapNot's translation feature with:
- Modern Apple-style UI with bright red theme
- Dual-mode translation: Text & Document
- Pre-configured shared API keys for instant use
- Cloudflare Worker integration for document translation
- Custom typography with GC EPICPRO font

---

## 🎨 Design System

### Color Palette

**Primary Colors:**
- **Bright Red**: `#FF3B30` - Primary CTA, active states
- **Deep Red**: `#D70015` - Hover states
- **Soft Red**: `#FF6B6B` - Accents, badges
- **Rose Pink**: `#FFE5E5` - Backgrounds, highlights

**Supporting Colors:**
- **Pure White**: `#FFFFFF` - Main background
- **Warm Gray**: `#F5F5F7` - Card backgrounds
- **Text Dark**: `#1D1D1F` - Primary text
- **Text Gray**: `#86868B` - Secondary text
- **Border**: `#D2D2D7` - Subtle dividers

**Accent:**
- **Success Green**: `#34C759` - Success states
- **Warning Orange**: `#FF9500` - Alerts

### Typography

**Font Stack:**
```css
/* Headings with custom font */
H1: GC EPICPRO, 32px, 700, -0.5px letter-spacing
H2: System font, 24px, 600
H3: System font, 18px, 600

/* Body with system font */
Body: -apple-system, BlinkMacSystemFont, 16px, 400, 1.5 line-height
Secondary: System font, 14px, 400, #86868B
Small: System font, 12px, 500, #86868B
```

### Spacing (8px Grid)

```
XXS: 4px   | XS: 8px   | SM: 12px  | MD: 16px
LG: 24px   | XL: 32px  | XXL: 48px
```

### Shadows

```css
/* Level 1 - Cards */
box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);

/* Level 2 - Dropdowns */
box-shadow: 0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06);

/* Level 3 - Modals */
box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.08);

/* Focus Glow (Red) */
box-shadow: 0 0 0 4px rgba(255,59,48,0.1);
```

### Border Radius

```
Small (buttons, inputs): 8px
Medium (cards): 12px
Large (containers): 16px
Pills (segmented control): 12px outer, 10px inner
Circle (swap button): 50%
```

---

## 📐 Layout Structure

### Header Section

```
┌─────────────────────────────────────────┐
│         🌐 (Icon gradient red)          │
│     SnapNot Translator                  │  ← H1 GC EPICPRO
│   Translate with DeepL AI Power        │  ← Subtitle
│                                         │
│    ┌──────────────────────────┐        │
│    │  📝 Text  │  📄 Document │        │  ← Segmented Control
│    └──────────────────────────┘        │
└─────────────────────────────────────────┘
```

**Segmented Control Specs:**
- Container: `#F5F5F7` background, `44px` height, `12px` border-radius
- Active: `#FF3B30` background, white text
- Inactive: Transparent, gray text
- Animation: 0.3s cubic-bezier slide + fade
- Touch target: Minimum 44x44px (Apple standard)

---

## 💬 Text Translation Interface (Tab 1)

### Language Selector Row

```
[Indonesian ▼]  ⟷  [English (US) ▼]
```

**Dropdown Specifications:**
- Height: `48px`, Rounded: `12px`
- Border: `1px solid #D2D2D7`
- Hover/Focus: Red border `#FF3B30` + subtle glow
- Dropdown: White card, max-height `320px`, scrollable

**Swap Button:**
- Size: `44x44px` circular
- Background: `#F5F5F7`
- Hover: Background `#FF3B30`, icon rotate 180deg
- Disabled: `#E5E5E5`, 50% opacity

### Text Areas (Side by Side)

```
┌──────────────────────┬──────────────────────┐
│  Source Text         │  Translated Text     │
│  [Textarea]          │  [Textarea readonly] │
│  1234 / 5000         │  [Copy Button]       │
└──────────────────────┴──────────────────────┘
```

**Textarea Design:**
- Border: `1px solid #D2D2D7`
- Rounded: `12px`, Padding: `16px`
- Font: `16px`, line-height `1.6`
- Focus: Red border + glow
- Auto-resize: min 200px, max 400px
- Character counter: Bottom-right, red at >4800

**Action Buttons:**
- Primary: Red `#FF3B30`, full width on mobile
- Secondary: Outline style

---

## 📄 Document Translation Interface (Tab 2)

### File Upload Zone

```
┌─────────────────────────────────────────┐
│           📄 (64px icon)                │
│   Drag & drop your document here       │
│        or click to browse               │
│   Supported: PDF, DOCX, DOC (max 2GB)  │
└─────────────────────────────────────────┘
```

**Upload Zone Specs:**
- Height: `240px`
- Border: `2px dashed #D2D2D7`
- Background: `#FAFAFA`
- Hover: Red dashed border, `#FFE5E5` background
- Drag Over: Solid red border, scale 1.02
- File Selected: Green border `#34C759`

### Translation Progress

```
┌─────────────────────────────────────────┐
│  ⏳ Translating your document...        │
│  ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░ 45%              │
│  • Uploading document... ✓              │
│  • Processing translation... ⏳         │
│  • Preparing download...                │
└─────────────────────────────────────────┘
```

**Progress Bar:**
- Height: `8px`, Rounded: `4px`
- Fill: Gradient `#FF3B30` → `#FF6B6B`
- Animated shimmer effect
- Status steps with checkmark ✓ and loading ⏳

**3-Stage Flow:**
1. Upload → Get document_id + document_key
2. Poll Status (every 2s, max 60 attempts)
3. Download → Save file with `_{target_lang}` suffix

---

## 🔑 API Key Management

### Layout

```
┌─────────────────────────────────────────┐
│  🔑 DeepL API Configuration             │
│  Your API Key:                          │
│  [Input field]                  [Save]  │
│                                         │
│  ─── OR USE SHARED API KEYS ───        │
│                                         │
│  📋 Daftar API Key DeepL                │
│  Klik "Salin" untuk copy ke clipboard  │
│                                         │
│  ┌────────────────────────────────────┐│
│  │ Abii                      [📋 Salin]││
│  │ f381117b-94e6-...5b63ed:fx         ││
│  └────────────────────────────────────┘│
│  ... (Valda, Azzahra)                   │
└─────────────────────────────────────────┘
```

**3 Pre-filled API Keys:**
1. **Abii**: `f381117b-94e6-4574-ad84-bad48a5b63ed:fx`
2. **Valda**: `2bc8a00a-3238-42d3-a569-490a3dcb31ae:fx`
3. **Azzahra**: `bf66784d-823d-4503-87de-be73bf3e6657:fx`

**Card Design:**
- Background: `#FAFAFA`
- Border: `1px solid #E5E5E5`
- Rounded: `12px`, Padding: `16px`
- Hover: Subtle shadow + red tint border

**Copy Button:**
- Red outline `#FF3B30`
- Height: `36px`
- Hover: Filled red background, white text
- Clicked: Show "✓ Tersalin!" for 2 seconds
- Toast: "API key tersalin!" (green)

---

## 🎬 Micro-Animations

### Segmented Control
```css
transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
/* Active indicator slides smoothly */
```

### Buttons
```css
hover: scale(1.02), shadow increase
active: scale(0.98)
transition: 0.15s ease-out
/* Red buttons: subtle glow on hover */
```

### Input Focus
```css
border-color: 0.2s ease
glow-shadow: 0 0 0 4px rgba(255,59,48,0.1)
```

### Copy Button
```css
📋 → ✓ (icon morph 0.2s)
outline → filled (0.3s)
"Salin" → "Tersalin!" → revert after 2s
```

### File Upload
```css
drag-over: scale(1.02), border pulse (0.3s)
file-selected: checkmark fade in + slide up (0.4s)
```

### Progress Bar
```css
width: smooth ease-out
shimmer: gradient move (1.5s infinite)
checkmarks: spring effect
```

---

## 🔧 Technical Architecture

### Component Structure

```
components/
├── translator/
│   ├── SegmentedControl.tsx        (iOS-style toggle)
│   ├── ApiKeyManager.tsx            (Input + 3 shared keys)
│   ├── TextTranslation.tsx          (Side-by-side layout)
│   ├── DocumentTranslation.tsx      (Upload + progress)
│   └── LanguageSelector.tsx         (Reusable dropdown)
├── Translator.tsx                   (Main container)
└── ui/
    └── Toast.tsx                    (Notifications)
```

### Services

```typescript
// services/deepLService.ts
const TEXT_ENDPOINT = 'https://translate-proxy.yumtive.workers.dev'
const DOC_ENDPOINT = 'https://translate-dokumen-proxy.yumtive.workers.dev'

// Text translation (existing)
translateText(text, sourceLang, targetLang, apiKey)

// Document translation (new)
uploadDocument(file, targetLang, apiKey) → {document_id, document_key}
checkDocumentStatus(documentId, documentKey, apiKey) → {status}
downloadDocument(documentId, documentKey, apiKey) → blob
```

### Cloudflare Worker Endpoints

**Text Translation:**
- `POST /translate` - Translate text

**Document Translation:**
- `POST /document` - Upload document
- `POST /document/{id}` - Check status
- `POST /document/{id}/result` - Download result

### Error Handling

```typescript
403: "API Key tidak valid"
456: "Quota habis (500k char/month)"
429: "Terlalu banyak request, coba lagi"
500: "Server error, coba beberapa saat lagi"
Network: "Koneksi bermasalah, cek internet Anda"
```

**Toast Notifications:**
- Position: `bottom: 80px` (above floating nav)
- Background: `rgba(255,255,255,0.95)` + `blur(20px)`
- Duration: 3s auto-dismiss
- Animation: Slide up from bottom

---

## 📱 Responsive Design

### Breakpoints

```
Mobile:    < 768px   (Stack vertical, full width)
Tablet:    768-1024px (2 columns for text areas)
Desktop:   > 1024px   (Max width 1200px, centered)
```

### Mobile Adaptations

- Segmented control: Full width
- Language selectors: Stack vertical (3 rows)
- Text areas: Stack vertical
- API key cards: Full width, horizontal scroll for keys
- Buttons: Full width, stacked
- Bottom padding: +80px for floating nav

### Desktop Optimizations

- Side-by-side text areas (50/50)
- Language selectors in 1 row
- Horizontal button layout
- Max container width: 1200px

---

## ✅ Success Criteria

1. **Visual Polish**
   - [ ] Red theme consistently applied
   - [ ] GC EPICPRO font loads correctly
   - [ ] All animations smooth (60fps)
   - [ ] Responsive on all screen sizes

2. **Functionality**
   - [ ] Text translation works end-to-end
   - [ ] Document translation 3-stage flow works
   - [ ] API key copy buttons functional
   - [ ] Language swap button works
   - [ ] Character counter accurate

3. **User Experience**
   - [ ] Segmented control smooth transitions
   - [ ] Toast notifications clear and helpful
   - [ ] Progress bar shows accurate status
   - [ ] Error messages actionable

4. **Code Quality**
   - [ ] TypeScript strict mode passes
   - [ ] No console errors
   - [ ] Components properly typed
   - [ ] Services tested

---

## 🚀 Implementation Plan

**Phase 1: Foundation (Tasks 1-3)**
- Setup design system (colors, fonts)
- Document this design
- Create base structure

**Phase 2: Core Components (Tasks 4-7)**
- Build SegmentedControl
- Build ApiKeyManager
- Build TextTranslation
- Build DocumentTranslation

**Phase 3: Integration (Tasks 8-9)**
- Setup Cloudflare Worker service
- Integrate all components into main Translator

**Phase 4: Polish & Test (Tasks 10-14)**
- Add micro-animations
- End-to-end testing
- Responsive verification
- TypeScript validation

---

**End of Design Document**

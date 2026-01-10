# TextTranslation Component Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a side-by-side text translation interface with language selectors, swap button, character counting, and real-time DeepL API translation.

**Architecture:** React functional component with TypeScript using existing translatorColors design system. Integrates with deepLService for translation API calls, manages local state for source/target text and languages. Responsive layout with mobile stacking.

**Tech Stack:** React 18, TypeScript, lucide-react icons, Tailwind CSS utility classes, existing DeepL service layer

---

## Task 1: Create Component File Structure

**Files:**
- Create: `/root/snapnot/components/translator/TextTranslation.tsx`

**Step 1: Create empty component file with TypeScript boilerplate**

```typescript
import React, { useState, useCallback } from 'react';
import { ArrowLeftRight, Loader2 } from 'lucide-react';
import { SOURCE_LANGUAGES, TARGET_LANGUAGES, Language } from '@/constants/languages';
import { translateText, TranslationRequest } from '@/services/deepLService';
import { translatorColors } from '@/constants/translatorColors';

interface TextTranslationProps {
  apiKey: string;
  onError?: (error: string) => void;
  className?: string;
}

export const TextTranslation: React.FC<TextTranslationProps> = ({
  apiKey,
  onError,
  className = '',
}) => {
  return (
    <div className={className}>
      <p>TextTranslation component placeholder</p>
    </div>
  );
};

export default TextTranslation;
```

**Step 2: Verify file exists and TypeScript recognizes imports**

Run: `npx tsc --noEmit /root/snapnot/components/translator/TextTranslation.tsx`
Expected: No type errors (or module resolution working)

**Step 3: Commit initial structure**

```bash
git add components/translator/TextTranslation.tsx
git commit -m "feat(translator): create TextTranslation component boilerplate"
```

---

## Task 2: Implement State Management

**Files:**
- Modify: `/root/snapnot/components/translator/TextTranslation.tsx`

**Step 1: Add state variables for text and languages**

Add inside the component function (after props destructuring):

```typescript
// State for text content
const [sourceText, setSourceText] = useState<string>('');
const [translatedText, setTranslatedText] = useState<string>('');

// State for languages (default: auto -> ID)
const [sourceLang, setSourceLang] = useState<string>('auto');
const [targetLang, setTargetLang] = useState<string>('ID');

// Loading and error states
const [isTranslating, setIsTranslating] = useState<boolean>(false);
const [error, setError] = useState<string>('');
```

**Step 2: Add character count helper**

Add after state declarations:

```typescript
const charCount = sourceText.length;
const isOverLimit = charCount > 5000;
const isNearLimit = charCount >= 4500;
```

**Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit components/translator/TextTranslation.tsx`
Expected: No type errors

**Step 4: Commit state management**

```bash
git add components/translator/TextTranslation.tsx
git commit -m "feat(translator): add state management for TextTranslation"
```

---

## Task 3: Implement Language Swap Logic

**Files:**
- Modify: `/root/snapnot/components/translator/TextTranslation.tsx`

**Step 1: Write swap handler function**

Add after state variables:

```typescript
const handleSwapLanguages = useCallback(() => {
  // Can't swap if source is auto-detect
  if (sourceLang === 'auto') return;
  
  // Swap languages
  const tempLang = sourceLang;
  setSourceLang(targetLang);
  setTargetLang(tempLang);
  
  // Swap text content
  const tempText = sourceText;
  setSourceText(translatedText);
  setTranslatedText(tempText);
}, [sourceLang, targetLang, sourceText, translatedText]);

const canSwap = sourceLang !== 'auto' && sourceText.trim() !== '';
```

**Step 2: Test swap logic with console logs (temporary)**

Add temporary test log:

```typescript
// Temporary - will remove
console.log('Swap enabled:', canSwap, 'Source:', sourceLang, 'Target:', targetLang);
```

**Step 3: Verify logic compiles**

Run: `npx tsc --noEmit components/translator/TextTranslation.tsx`
Expected: No type errors

**Step 4: Commit swap logic**

```bash
git add components/translator/TextTranslation.tsx
git commit -m "feat(translator): add language swap functionality"
```

---

## Task 4: Implement Translation API Call

**Files:**
- Modify: `/root/snapnot/components/translator/TextTranslation.tsx`

**Step 1: Write translation handler function**

Add after swap handler:

```typescript
const handleTranslate = useCallback(async () => {
  // Validation
  if (!sourceText.trim()) {
    setError('Please enter text to translate');
    onError?.('Please enter text to translate');
    return;
  }
  
  if (isOverLimit) {
    setError('Text exceeds 5000 character limit');
    onError?.('Text exceeds 5000 character limit');
    return;
  }
  
  // Reset state
  setError('');
  setIsTranslating(true);
  setTranslatedText('');
  
  try {
    const result = await translateText({
      text: sourceText,
      sourceLang: sourceLang === 'auto' ? undefined : sourceLang,
      targetLang,
      apiKey,
    });
    
    setTranslatedText(result.translatedText);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Translation failed';
    setError(errorMessage);
    onError?.(errorMessage);
  } finally {
    setIsTranslating(false);
  }
}, [sourceText, sourceLang, targetLang, apiKey, isOverLimit, onError]);
```

**Step 2: Verify async logic compiles**

Run: `npx tsc --noEmit components/translator/TextTranslation.tsx`
Expected: No type errors

**Step 3: Commit translation logic**

```bash
git add components/translator/TextTranslation.tsx
git commit -m "feat(translator): add translation API integration"
```

---

## Task 5: Build Language Selector Dropdowns

**Files:**
- Modify: `/root/snapnot/components/translator/TextTranslation.tsx`

**Step 1: Create language selector component**

Add helper function before main component JSX:

```typescript
const LanguageSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  languages: Language[];
  label: string;
}> = ({ value, onChange, languages, label }) => (
  <div className="flex-1">
    <label className="block text-sm font-medium mb-2" style={{ color: translatorColors.text.gray }}>
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 px-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
      style={{
        borderColor: translatorColors.neutral.border,
        backgroundColor: translatorColors.neutral.white,
        color: translatorColors.text.dark,
      }}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  </div>
);
```

**Step 2: Use selectors in main render**

Update the return statement:

```typescript
return (
  <div className={`space-y-4 ${className}`}>
    {/* Language Selectors Row */}
    <div className="flex items-end gap-4">
      <LanguageSelect
        value={sourceLang}
        onChange={setSourceLang}
        languages={SOURCE_LANGUAGES}
        label="Source Language"
      />
      
      <button
        onClick={handleSwapLanguages}
        disabled={!canSwap}
        className="mb-2 p-2 rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: canSwap ? translatorColors.neutral.warmGray : translatorColors.neutral.borderLight,
        }}
        aria-label="Swap languages"
      >
        <ArrowLeftRight size={20} style={{ color: translatorColors.text.dark }} />
      </button>
      
      <LanguageSelect
        value={targetLang}
        onChange={setTargetLang}
        languages={TARGET_LANGUAGES}
        label="Target Language"
      />
    </div>
  </div>
);
```

**Step 3: Verify component renders in browser**

Manual test: Check that dropdowns show flags and language names

**Step 4: Commit language selectors**

```bash
git add components/translator/TextTranslation.tsx
git commit -m "feat(translator): add language selector dropdowns"
```

---

## Task 6: Build Text Area Components

**Files:**
- Modify: `/root/snapnot/components/translator/TextTranslation.tsx`

**Step 1: Add text areas to render**

Add after language selectors in return statement:

```typescript
{/* Text Areas Row */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Source Textarea */}
  <div className="relative">
    <textarea
      value={sourceText}
      onChange={(e) => setSourceText(e.target.value)}
      placeholder="Enter text to translate..."
      className="w-full h-[300px] md:h-[300px] p-4 rounded-xl border resize-y transition-all focus:outline-none focus:ring-2"
      style={{
        borderColor: translatorColors.neutral.border,
        backgroundColor: translatorColors.neutral.white,
        color: translatorColors.text.dark,
        fontSize: '16px',
        lineHeight: '1.6',
      }}
      maxLength={5000}
    />
    
    {/* Character Counter */}
    <div
      className="absolute bottom-3 right-3 text-sm font-medium"
      style={{
        color: isOverLimit 
          ? translatorColors.accent.errorRed 
          : isNearLimit 
            ? translatorColors.accent.warningOrange 
            : translatorColors.text.gray,
      }}
    >
      {charCount} / 5000
    </div>
  </div>
  
  {/* Target Textarea (Read-only) */}
  <div className="relative">
    <textarea
      value={translatedText}
      readOnly
      placeholder="Translation will appear here..."
      className="w-full h-[300px] md:h-[300px] p-4 rounded-xl border resize-none"
      style={{
        borderColor: translatorColors.neutral.border,
        backgroundColor: translatorColors.neutral.lightGray,
        color: translatorColors.text.dark,
        fontSize: '16px',
        lineHeight: '1.6',
      }}
    />
  </div>
</div>
```

**Step 2: Verify responsive behavior**

Manual test: Resize browser window to check mobile stacking

**Step 3: Commit text areas**

```bash
git add components/translator/TextTranslation.tsx
git commit -m "feat(translator): add source and target text areas"
```

---

## Task 7: Build Action Bar (Translate Button)

**Files:**
- Modify: `/root/snapnot/components/translator/TextTranslation.tsx`

**Step 1: Add action bar with translate button**

Add after text areas in return statement:

```typescript
{/* Action Bar */}
<div className="flex items-center justify-between">
  {/* Character counter (mobile duplicate) */}
  <div
    className="text-sm font-medium md:hidden"
    style={{
      color: isOverLimit 
        ? translatorColors.accent.errorRed 
        : isNearLimit 
          ? translatorColors.accent.warningOrange 
          : translatorColors.text.gray,
    }}
  >
    {charCount} / 5000
  </div>
  
  <div className="flex-1 md:flex-none md:ml-auto">
    <button
      onClick={handleTranslate}
      disabled={isTranslating || !sourceText.trim() || isOverLimit}
      className="w-full md:w-auto px-6 h-11 rounded-lg font-semibold text-white transition-all hover:scale-102 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      style={{
        backgroundColor: translatorColors.primary.brightRed,
      }}
    >
      {isTranslating ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          Translating...
        </>
      ) : (
        'Translate'
      )}
    </button>
  </div>
</div>

{/* Error Display */}
{error && (
  <div
    className="p-3 rounded-lg text-sm"
    style={{
      backgroundColor: translatorColors.primary.rosePink,
      color: translatorColors.accent.errorRed,
    }}
  >
    {error}
  </div>
)}
```

**Step 2: Test button states**

Manual test:
- Button disabled when text empty
- Button disabled when translating
- Loading spinner appears during translation

**Step 3: Commit action bar**

```bash
git add components/translator/TextTranslation.tsx
git commit -m "feat(translator): add translate button and error display"
```

---

## Task 8: Add Keyboard Shortcuts

**Files:**
- Modify: `/root/snapnot/components/translator/TextTranslation.tsx`

**Step 1: Add keyboard event handler**

Add after translation handler:

```typescript
// Keyboard shortcut: Enter in source textarea to translate
const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    handleTranslate();
  }
}, [handleTranslate]);
```

**Step 2: Attach handler to source textarea**

Update source textarea element:

```typescript
<textarea
  value={sourceText}
  onChange={(e) => setSourceText(e.target.value)}
  onKeyDown={handleKeyDown}
  // ... rest of props
```

**Step 3: Test keyboard shortcut**

Manual test: Ctrl+Enter or Cmd+Enter triggers translation

**Step 4: Commit keyboard shortcuts**

```bash
git add components/translator/TextTranslation.tsx
git commit -m "feat(translator): add Ctrl+Enter keyboard shortcut"
```

---

## Task 9: Add ARIA Labels for Accessibility

**Files:**
- Modify: `/root/snapnot/components/translator/TextTranslation.tsx`

**Step 1: Add ARIA attributes to inputs**

Update source textarea:

```typescript
<textarea
  value={sourceText}
  onChange={(e) => setSourceText(e.target.value)}
  onKeyDown={handleKeyDown}
  placeholder="Enter text to translate..."
  aria-label="Source text input"
  aria-describedby="char-counter"
  // ... rest of props
/>
```

Update target textarea:

```typescript
<textarea
  value={translatedText}
  readOnly
  placeholder="Translation will appear here..."
  aria-label="Translated text output"
  aria-live="polite"
  // ... rest of props
/>
```

Update character counter:

```typescript
<div
  id="char-counter"
  className="absolute bottom-3 right-3 text-sm font-medium"
  aria-live="polite"
  // ... rest of props
>
  {charCount} / 5000
</div>
```

**Step 2: Verify screen reader compatibility**

Manual test: Use browser accessibility inspector

**Step 3: Commit accessibility improvements**

```bash
git add components/translator/TextTranslation.tsx
git commit -m "feat(translator): add ARIA labels for accessibility"
```

---

## Task 10: Add Mobile Responsive Styles

**Files:**
- Modify: `/root/snapnot/components/translator/TextTranslation.tsx`

**Step 1: Update textarea heights for mobile**

Update source and target textareas with responsive heights:

```typescript
className="w-full h-[200px] md:h-[300px] p-4 rounded-xl border resize-y transition-all focus:outline-none focus:ring-2"
```

**Step 2: Test responsive breakpoints**

Manual test:
- Mobile (\u003c768px): Stacked vertical, 200px height
- Desktop (≥768px): Side-by-side, 300px height

**Step 3: Commit responsive styles**

```bash
git add components/translator/TextTranslation.tsx
git commit -m "feat(translator): add responsive mobile styles"
```

---

## Task 11: Run LSP Diagnostics

**Files:**
- Check: `/root/snapnot/components/translator/TextTranslation.tsx`

**Step 1: Run TypeScript language server diagnostics**

Run: `npx tsc --noEmit --project /root/snapnot/tsconfig.json`
Expected: No errors in TextTranslation.tsx

**Step 2: Fix any type errors found**

If errors exist, fix them iteratively

**Step 3: Run final diagnostic check**

Run: `npx tsc --noEmit --project /root/snapnot/tsconfig.json`
Expected: Exit code 0 (no errors)

**Step 4: Commit any fixes**

```bash
git add components/translator/TextTranslation.tsx
git commit -m "fix(translator): resolve TypeScript diagnostics"
```

---

## Task 12: Integration Test with ApiKeyManager

**Files:**
- Test: `/root/snapnot/components/translator/TextTranslation.tsx`
- Reference: `/root/snapnot/components/translator/ApiKeyManager.tsx`

**Step 1: Create test integration file (temporary)**

Create test file to verify integration:

```typescript
// test-integration.tsx (temporary)
import React, { useState } from 'react';
import { ApiKeyManager } from './ApiKeyManager';
import { TextTranslation } from './TextTranslation';

export const TestIntegration = () => {
  const [apiKey, setApiKey] = useState<string>('');
  
  return (
    <div className="p-8 space-y-8">
      <ApiKeyManager onApiKeyChange={setApiKey} />
      {apiKey && (
        <TextTranslation
          apiKey={apiKey}
          onError={(error) => console.error('Translation error:', error)}
        />
      )}
    </div>
  );
};
```

**Step 2: Verify props interface matches**

Check that ApiKeyManager provides correct apiKey format

**Step 3: Manual browser test**

Start dev server and test:
1. Enter API key in ApiKeyManager
2. Verify TextTranslation receives it
3. Test translation end-to-end

**Step 4: Remove test file if created**

```bash
rm test-integration.tsx
```

---

## Task 13: Final Self-Review Checklist

**Files:**
- Review: `/root/snapnot/components/translator/TextTranslation.tsx`

**Step 1: Verify all design spec requirements**

Checklist:
- [ ] Side-by-side layout on desktop
- [ ] Stacked layout on mobile
- [ ] Language dropdowns with flags
- [ ] Swap button (disabled on auto-detect)
- [ ] Character counter (red at ≥4500)
- [ ] Text areas (300px desktop, 200px mobile)
- [ ] Translate button (loading state)
- [ ] Error handling and display
- [ ] All colors from translatorColors
- [ ] Keyboard shortcut (Ctrl+Enter)
- [ ] ARIA labels present
- [ ] TypeScript strict mode passes

**Step 2: Code quality review**

Check:
- [ ] No console.logs left
- [ ] All callbacks properly memoized
- [ ] No unused imports
- [ ] Consistent naming conventions
- [ ] Comments where needed

**Step 3: Document any deviations**

Note: None expected if following plan

---

## Task 14: Final Commit and Summary

**Files:**
- All: `/root/snapnot/components/translator/TextTranslation.tsx`

**Step 1: Run final build check**

```bash
cd /root/snapnot
npm run build
```

Expected: Build succeeds with no errors

**Step 2: Create final commit (if any remaining changes)**

```bash
git add components/translator/TextTranslation.tsx
git commit -m "feat(translator): complete TextTranslation component implementation"
```

**Step 3: Get commit hash**

```bash
git log -1 --format="%H"
```

**Step 4: Generate summary report**

Output summary including:
- File path: `/root/snapnot/components/translator/TextTranslation.tsx`
- Features implemented:
  - Language selection (source + target)
  - Swap languages functionality
  - Text input with 5000 char limit
  - Character counter with warning colors
  - DeepL API translation
  - Loading and error states
  - Responsive design (mobile/desktop)
  - Keyboard shortcuts (Ctrl+Enter)
  - Accessibility (ARIA labels)
- Integration: Accepts `apiKey` prop from ApiKeyManager
- TypeScript: Fully typed, strict mode compliant
- Commit hash: \u003cinsert hash\u003e

---

## Notes

- **Import paths:** Using `@/` alias for absolute imports (check tsconfig.json)
- **Styling approach:** Inline styles with translatorColors constants (no Tailwind classes for colors)
- **Testing:** Manual browser testing required (no unit tests in this plan)
- **API validation:** Relies on deepLService error handling
- **Focus management:** Browser default (no custom focus logic)

---

**End of Implementation Plan**

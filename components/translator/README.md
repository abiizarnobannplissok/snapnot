# SegmentedControl Component

iOS-style segmented control for SnapNot Translator.

## Usage

```tsx
import { SegmentedControl } from './components/translator/SegmentedControl';
import { FileText, FileUp } from 'lucide-react';

function App() {
  const [mode, setMode] = useState('text');

  return (
    <SegmentedControl
      options={[
        { value: 'text', label: 'Text', icon: <FileText size={16} /> },
        { value: 'document', label: 'Document', icon: <FileUp size={16} /> }
      ]}
      value={mode}
      onChange={setMode}
    />
  );
}
```

## Features

- Smooth sliding animation (300ms cubic-bezier)
- Keyboard navigation (Arrow keys, Home, End, Enter, Space)
- Full accessibility (ARIA labels, roles, tab management)
- Responsive (full width mobile, auto desktop)
- Icon support (optional)
- Apple design system colors

## Demo

See `SegmentedControl.demo.tsx` for examples with 2, 3, and 4 options.

## Design Specs

- Container: `#F5F5F7` background, `44px` height, `12px` border-radius
- Active: `#FF3B30` background, white text
- Inactive: transparent, `#86868B` text
- Animation: smooth slide with 0.3s timing
- Press feedback: 0.97 scale

## Keyboard Shortcuts

- `Arrow Left/Right`: Navigate options
- `Home/End`: Jump to first/last option
- `Enter/Space`: Select focused option
- `Tab`: Focus next/previous control

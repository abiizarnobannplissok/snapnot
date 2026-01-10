import React, { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';
import { FileText, FileUp } from 'lucide-react';

export const SegmentedControlDemo = () => {
  const [mode, setMode] = useState('text');
  const [tabMode, setTabMode] = useState('translate');

  return (
    <div className="p-8 space-y-8 bg-white min-h-screen">
      <div>
        <h2 className="text-lg font-semibold mb-4">2 Options (with icons)</h2>
        <SegmentedControl
          options={[
            { value: 'text', label: 'Text', icon: <FileText size={16} /> },
            { value: 'document', label: 'Document', icon: <FileUp size={16} /> }
          ]}
          value={mode}
          onChange={setMode}
        />
        <p className="mt-2 text-sm text-gray-600">Selected: {mode}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">3 Options (without icons)</h2>
        <SegmentedControl
          options={[
            { value: 'translate', label: 'Translate' },
            { value: 'history', label: 'History' },
            { value: 'settings', label: 'Settings' }
          ]}
          value={tabMode}
          onChange={setTabMode}
        />
        <p className="mt-2 text-sm text-gray-600">Selected: {tabMode}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Keyboard Navigation Test</h2>
        <p className="text-sm text-gray-600 mb-2">
          Focus the control and use: Arrow Left/Right, Home, End, Enter, Space
        </p>
        <SegmentedControl
          options={[
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two' },
            { value: 'three', label: 'Three' },
            { value: 'four', label: 'Four' }
          ]}
          value={tabMode}
          onChange={setTabMode}
        />
      </div>
    </div>
  );
};

export default SegmentedControlDemo;

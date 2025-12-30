import React, { useCallback } from 'react';
import { StickyNote, Upload, Languages } from 'lucide-react';
import './FloatingTabNav.css';

type TabType = 'notes' | 'files' | 'translator';

interface FloatingTabNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isHidden?: boolean;
}

interface Tab {
  id: TabType;
  icon: React.ElementType;
  label: string;
  ariaLabel: string;
}

const TABS: Tab[] = [
  {
    id: 'notes',
    icon: StickyNote,
    label: 'Notes',
    ariaLabel: 'View notes'
  },
  {
    id: 'files',
    icon: Upload,
    label: 'Upload',
    ariaLabel: 'Upload files'
  },
  {
    id: 'translator',
    icon: Languages,
    label: 'Translate',
    ariaLabel: 'Translate text'
  }
];

export const FloatingTabNav: React.FC<FloatingTabNavProps> = ({ 
  activeTab, 
  onTabChange,
  isHidden = false
}) => {
  const handleTabClick = useCallback((tabId: TabType) => {
    // Instant haptic feedback (if supported and allowed)
    try {
      if (navigator.vibrate && document.hasFocus()) {
        navigator.vibrate(5); // Shorter vibration for snappier feel
      }
    } catch (e) {
      // Vibrate blocked by browser policy, ignore silently
    }
    
    // Immediate tab change - no delay
    onTabChange(tabId);
    
    // Instant scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [onTabChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, tabId: TabType, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabClick(tabId);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      const prevTab = TABS[index - 1];
      document.getElementById(`tab-${prevTab.id}`)?.focus();
    } else if (e.key === 'ArrowRight' && index < TABS.length - 1) {
      e.preventDefault();
      const nextTab = TABS[index + 1];
      document.getElementById(`tab-${nextTab.id}`)?.focus();
    }
  }, [handleTabClick]);

  return (
    <nav 
      className={`floating-tab-nav ${isHidden ? 'hidden' : ''}`}
      role="navigation"
      aria-label="Main navigation tabs"
      aria-hidden={isHidden}
    >
      {TABS.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            className={`tab-button ${isActive ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id, index)}
            role="tab"
            aria-selected={isActive}
            aria-label={tab.ariaLabel}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
          >
            <Icon 
              size={24} 
              strokeWidth={2}
              className="tab-icon"
              aria-hidden="true"
            />
          </button>
        );
      })}
    </nav>
  );
};

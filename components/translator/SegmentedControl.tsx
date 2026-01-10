import React, { useRef, useEffect, useState, useCallback } from 'react';
import { translatorColors } from '../../constants/translatorColors';

export interface SegmentedControlProps {
  /** Array of options to display */
  options: Array<{ 
    value: string; 
    label: string; 
    icon?: React.ReactNode 
  }>;
  /** Currently selected value */
  value: string;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Optional additional CSS classes */
  className?: string;
  ariaLabel?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className = '',
  ariaLabel = 'Mode selection',
}) => {
  if (options.length === 0) {
    console.warn('SegmentedControl: options array is empty');
    return null;
  }

  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = options.findIndex(opt => opt.value === value);
    const validIndex = activeIndex >= 0 ? activeIndex : 0;
    const activeButton = buttonRefs.current[validIndex];
    
    if (activeButton && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      
      setIndicatorStyle({
        width: `${buttonRect.width}px`,
        transform: `translateX(${buttonRect.left - containerRect.left}px)`,
      });
    }
  }, [value, options]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, currentIndex: number) => {
    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = options.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onChange(options[currentIndex].value);
        return;
      default:
        return;
    }

    buttonRefs.current[nextIndex]?.focus();
    onChange(options[nextIndex].value);
  }, [options, onChange]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex p-[2px] rounded-xl ${className}`}
      style={{ 
        backgroundColor: translatorColors.neutral.warmGray,
        height: '44px',
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto',
        display: 'flex',
      }}
      role="tablist"
      aria-label={ariaLabel}
    >
      <div
        className="absolute top-[2px] bottom-[2px] rounded-[10px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          backgroundColor: translatorColors.primary.brightRed,
          ...indicatorStyle,
        }}
        aria-hidden="true"
      />

      {options.map((option, index) => {
        const isActive = option.value === value;
        
        return (
          <button
            key={option.value}
            ref={el => buttonRefs.current[index] = el}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${option.value}`}
            tabIndex={isActive ? 0 : -1}
            className={`
              relative z-10 flex-1 flex items-center justify-center gap-2 
              rounded-[10px] font-medium text-sm transition-all
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
              active:scale-[0.97]
              ${isActive 
                ? '' 
                : 'text-[#86868B] hover:text-[#6B6B70]'
              }
            `}
            style={{
              color: isActive ? translatorColors.neutral.white : translatorColors.text.gray,
              transitionProperty: 'color, transform',
              transitionDuration: '0.2s',
              transitionTimingFunction: 'ease',
            }}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {option.icon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {option.icon}
              </span>
            )}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;

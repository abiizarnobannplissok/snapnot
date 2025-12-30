import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Clock, ArrowUpDown, SortAsc } from 'lucide-react';
import { SortOption } from '../types';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

interface SortOptionItem {
  value: SortOption;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const sortOptions: SortOptionItem[] = [
  { 
    value: 'newest', 
    label: 'Terbaru', 
    icon: <Clock className="w-3.5 h-3.5" />,
    description: 'Catatan terbaru di atas'
  },
  { 
    value: 'oldest', 
    label: 'Terlama', 
    icon: <ArrowUpDown className="w-3.5 h-3.5" />,
    description: 'Catatan terlama di atas'
  },
  { 
    value: 'az', 
    label: 'A-Z', 
    icon: <SortAsc className="w-3.5 h-3.5" />,
    description: 'Urut berdasarkan judul'
  },
];

export const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = sortOptions.find(opt => opt.value === value) || sortOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option: SortOption) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          h-10 px-3 pr-2.5 rounded-xl bg-white border-2 transition-all
          shadow-soft hover:shadow-hover hover:scale-[1.02] active:scale-[0.98]
          flex items-center gap-2 min-w-[120px]
          ${isOpen ? 'border-black shadow-hover' : 'border-transparent'}
        `}
      >
        <div className="flex items-center gap-1.5 flex-1">
          <div className="text-gray-600">{selectedOption.icon}</div>
          <span className="font-semibold text-xs text-black">{selectedOption.label}</span>
        </div>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={`
            absolute top-[44px] right-0 w-[220px] bg-white rounded-xl 
            shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100
            overflow-hidden z-50 animate-fade-in
          `}
        >
          {sortOptions.map((option, index) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                w-full px-4 py-3 flex items-start gap-2.5 transition-all
                hover:bg-gray-50 active:bg-gray-100
                ${value === option.value ? 'bg-primary/10 hover:bg-primary/20' : ''}
                ${index !== sortOptions.length - 1 ? 'border-b border-gray-100' : ''}
              `}
            >
              <div className={`
                w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                ${value === option.value 
                  ? 'bg-primary text-black shadow-sm' 
                  : 'bg-gray-100 text-gray-600'
                }
              `}>
                {option.icon}
              </div>
              <div className="flex-1 text-left">
                <div className={`font-bold text-xs mb-0.5 ${value === option.value ? 'text-black' : 'text-gray-900'}`}>
                  {option.label}
                </div>
                <div className="text-[10px] text-gray-500 leading-tight">
                  {option.description}
                </div>
              </div>
              {value === option.value && (
                <div className="flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-sm" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Backdrop overlay untuk mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

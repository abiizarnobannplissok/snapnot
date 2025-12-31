import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Language } from '../constants/languages';

interface LanguageSelectorProps {
  languages: Language[];
  selectedLanguage: string;
  onLanguageChange: (code: string) => void;
  label: string;
  placeholder?: string;
  ariaLabel?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages,
  selectedLanguage,
  onLanguageChange,
  label,
  placeholder = 'Select language',
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedLang = languages.find(lang => lang.code === selectedLanguage);

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code: string) => {
    onLanguageChange(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="flex flex-col gap-2 flex-1" ref={dropdownRef}>
      <label className="text-sm font-medium text-[#666666]">{label}</label>
      
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full h-11 px-4 rounded-xl border border-[#E5E5E5] hover:border-[#95E1D3] focus:border-[#95E1D3] focus:outline-none transition-colors bg-white flex items-center justify-between gap-3"
        aria-label={ariaLabel || label}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{selectedLang?.flag}</span>
          <span className="text-base font-medium text-black">{selectedLang?.name}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-[#666666] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-[62px] w-full max-w-[calc(100%-2rem)] md:max-w-[360px] bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-[#E5E5E5] p-2 animate-slide-down">
          {/* Search Input */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari bahasa..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#E5E5E5] focus:border-[#95E1D3] focus:outline-none text-sm"
              aria-label="Search languages"
            />
          </div>

          {/* Language List */}
          <div className="max-h-[280px] overflow-y-auto custom-scrollbar" role="listbox">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`
                    w-full h-10 px-3 rounded-lg flex items-center gap-3 transition-colors
                    ${lang.code === selectedLanguage
                      ? 'bg-[#95E1D3] text-black'
                      : 'hover:bg-[#F5F5F5] text-black'
                    }
                  `}
                  role="option"
                  aria-selected={lang.code === selectedLanguage}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-sm font-medium flex-1 text-left">{lang.name}</span>
                  <span className={`text-xs ${lang.code === selectedLanguage ? 'text-black' : 'text-[#999999]'}`}>
                    {lang.code === 'auto' ? '' : lang.code}
                  </span>
                </button>
              ))
            ) : (
              <div className="py-8 text-center text-[#666666] text-sm">
                Tidak ada bahasa ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

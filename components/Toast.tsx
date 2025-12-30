import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-slide-down">
      <div className={`
        flex items-center gap-3 px-6 py-3 rounded-[20px] shadow-2xl
        ${type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}
      `}>
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 text-primary" />
        ) : (
          <AlertCircle className="w-5 h-5 text-white" />
        )}
        <span className="font-medium text-sm">{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-70">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Add styles for the animation inside style tag in index.html, 
// but since we are using Tailwind, we'll rely on global css or utility classes in a real setup.
// Here we will just use a standard transform transition via className or assume standard tailwind config.
// The `animate-slide-down` would ideally be in tailwind.config. 
// For this single file output, I'll rely on default behavior or basic positioning.

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 animate-scale-in">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-5 ml-12">{message}</p>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-lg border-2 border-gray-200 text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-95 transition-all"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

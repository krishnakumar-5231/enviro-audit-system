import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ type = 'success', message, onClose }) {
  if (!message) return null;

  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
  };

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center p-4 rounded-xl border shadow-lg max-w-md animate-in slide-in-from-bottom duration-200 ${styles[type]}`}
    >
      {icons[type]}
      <div className="ml-3 mr-4 text-xs sm:text-sm font-medium">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

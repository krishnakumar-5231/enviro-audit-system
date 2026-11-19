import React from 'react';

export default function LoadingSpinner({ text = 'Loading data...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="py-12 flex flex-col items-center justify-center space-y-3">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-teal-200 border-t-teal-600 animate-spin`}
      />
      {text && <p className="text-xs font-medium text-slate-500 animate-pulse">{text}</p>}
    </div>
  );
}

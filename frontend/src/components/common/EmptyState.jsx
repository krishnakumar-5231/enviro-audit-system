import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is currently no data to display for this section.',
  actionText,
  onAction
}) {
  return (
    <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

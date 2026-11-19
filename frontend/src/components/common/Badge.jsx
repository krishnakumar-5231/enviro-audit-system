import React from 'react';

const colorStyles = {
  // Audit & General Statuses
  Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  Submitted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Under Review': 'bg-purple-50 text-purple-700 border-purple-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Closed: 'bg-slate-100 text-slate-700 border-slate-300',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  Draft: 'bg-slate-50 text-slate-600 border-slate-200',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Inactive: 'bg-slate-100 text-slate-500 border-slate-200',

  // Severities
  Critical: 'bg-red-100 text-red-800 border-red-300 font-semibold',
  High: 'bg-orange-100 text-orange-800 border-orange-300',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Low: 'bg-blue-100 text-blue-800 border-blue-300',
  Urgent: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold',

  // Inspection item responses
  Compliant: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Non-Compliant': 'bg-rose-100 text-rose-800 border-rose-300',
  'Partially Compliant': 'bg-amber-100 text-amber-800 border-amber-300',
  'Not Applicable': 'bg-slate-100 text-slate-600 border-slate-300',
  Pending: 'bg-slate-50 text-slate-500 border-slate-200',

  // CAPA Statuses
  Open: 'bg-blue-50 text-blue-700 border-blue-200',
  Assigned: 'bg-sky-50 text-sky-700 border-sky-200',
  'Pending Verification': 'bg-purple-50 text-purple-700 border-purple-200',
  Verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Overdue: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse',
  Resolved: 'bg-teal-50 text-teal-700 border-teal-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200'
};

export default function Badge({ status, label, className = '', size = 'sm' }) {
  const displayLabel = label || status || 'Unknown';
  const style = colorStyles[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  const sizeStyle = size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-full border ${sizeStyle} ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {displayLabel}
    </span>
  );
}

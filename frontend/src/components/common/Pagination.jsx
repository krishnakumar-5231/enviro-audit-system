import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange
}) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200 sm:px-6">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-600">
            Showing <span className="font-semibold text-slate-900">{startItem}</span> to{' '}
            <span className="font-semibold text-slate-900">{endItem}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2.5 py-1.5 rounded-l-xl border border-slate-300 bg-white text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            <span className="relative inline-flex items-center px-4 py-1.5 border border-slate-300 bg-slate-50 text-xs font-semibold text-teal-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2.5 py-1.5 rounded-r-xl border border-slate-300 bg-white text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </nav>
        </div>
      </div>
      <div className="flex justify-between w-full sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-xs text-slate-600 self-center">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

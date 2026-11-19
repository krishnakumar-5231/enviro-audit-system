import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action? This operation cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  isLoading = false
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-xl shadow-sm transition-colors disabled:opacity-50 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </>
      }
    >
      <div className="flex items-start space-x-4">
        <div
          className={`p-3 rounded-xl border flex-shrink-0 ${
            isDanger
              ? 'bg-rose-50 border-rose-100 text-rose-600'
              : 'bg-amber-50 border-amber-100 text-amber-600'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
}

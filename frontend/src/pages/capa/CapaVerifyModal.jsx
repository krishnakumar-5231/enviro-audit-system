import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { capaAPI } from '../../services/api';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function CapaVerifyModal({ isOpen, onClose, capa, onVerified }) {
  const [approved, setApproved] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!remarks.trim()) {
      setError('Please provide verification or feedback remarks.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await capaAPI.verifyCapa(capa._id, { approved, remarks });
      onVerified();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing CAPA verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compliance Verification Review"
      subtitle={`Reviewing action ${capa?.capaCode}: ${capa?.actionTitle}`}
      maxWidth="max-w-lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition-colors disabled:opacity-50 ${
              approved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {loading ? 'Submitting Decision...' : approved ? 'Approve & Verify' : 'Reject Action'}
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Verification Decision
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setApproved(true)}
              className={`p-3 rounded-2xl border text-left flex items-center space-x-2 transition-all ${
                approved
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold block">Approve & Verify</span>
                <span className="text-[10px] text-slate-500">Corrective actions proven effective</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setApproved(false)}
              className={`p-3 rounded-2xl border text-left flex items-center space-x-2 transition-all ${
                !approved
                  ? 'border-rose-500 bg-rose-50/50 text-rose-900 ring-2 ring-rose-500/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold block">Reject & Return</span>
                <span className="text-[10px] text-slate-500">Further remediation needed</span>
              </div>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Compliance Verification Remarks *
          </label>
          <textarea
            rows={4}
            required
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder={
              approved
                ? 'Document verification test results, structural sign-off, or physical validation observation...'
                : 'State reasons for rejection and specific deficiency to be rectified before re-submitting...'
            }
            className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>
      </form>
    </Modal>
  );
}

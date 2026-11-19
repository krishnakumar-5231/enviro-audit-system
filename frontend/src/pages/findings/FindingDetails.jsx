import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Factory,
  ClipboardList,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { findingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import CapaModal from '../capa/CapaModal';

export default function FindingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [finding, setFinding] = useState(null);
  const [loading, setLoading] = useState(true);

  const [capaModalOpen, setCapaModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchFinding = async () => {
    setLoading(true);
    try {
      const res = await findingAPI.getFinding(id);
      setFinding(res.data.data);
    } catch (err) {
      console.error('Error fetching finding details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinding();
  }, [id]);

  const handleCloseFinding = async () => {
    setActionLoading(true);
    setErrorMsg('');
    try {
      await findingAPI.closeFinding(id, { resolutionRemarks });
      setCloseModalOpen(false);
      fetchFinding();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error closing finding.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading non-conformance finding..." />;
  }

  if (!finding) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Finding record not found.</p>
        <button
          onClick={() => navigate('/findings')}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
        >
          Back to Findings
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/findings')}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{finding.title}</h2>
              <Badge status={finding.severity} />
              <Badge status={finding.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Code: {finding.findingCode} • Category: {finding.category}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!finding.assignedCapa && (
            <button
              onClick={() => setCapaModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Remediation CAPA</span>
            </button>
          )}

          {finding.status !== 'Closed' &&
            hasRole('Administrator', 'Compliance Officer', 'Environmental Auditor') && (
              <button
                onClick={() => setCloseModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center space-x-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Close Finding</span>
              </button>
            )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Finding Details Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Factual Finding Description
          </h3>
          <p className="text-xs sm:text-sm text-slate-800 mt-2 leading-relaxed whitespace-pre-wrap">
            {finding.description}
          </p>
        </div>

        {finding.requirementReference && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Statutory Requirement / Reference
            </span>
            <span className="text-xs font-mono font-semibold text-teal-800 mt-0.5 block">
              {finding.requirementReference}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Facility</span>
            <p className="text-xs font-bold text-slate-800">{finding.site?.name}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Associated Audit</span>
            <p className="text-xs font-bold text-slate-800">{finding.audit?.title} ({finding.audit?.auditCode})</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recorded By</span>
            <p className="text-xs font-bold text-slate-800">{finding.createdBy?.name || 'Auditor'}</p>
          </div>
        </div>

        {finding.resolutionRemarks && (
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 mt-2">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Closure Resolution Remarks
            </span>
            <span className="text-xs text-emerald-900 mt-0.5 block">
              {finding.resolutionRemarks}
            </span>
            {finding.closedDate && (
              <span className="text-[10px] text-emerald-600 block mt-1">
                Closed on {new Date(finding.closedDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Linked CAPA Action Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
          <span>Corrective and Preventive Action (CAPA)</span>
          {finding.assignedCapa && (
            <Link
              to={`/capa/${finding.assignedCapa._id}`}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
            >
              <span>Open CAPA Workspace</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </h3>

        {finding.assignedCapa ? (
          <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 font-mono">
                {finding.assignedCapa.capaCode}
              </span>
              <Badge status={finding.assignedCapa.status} />
            </div>
            <p className="text-xs font-semibold text-slate-800">{finding.assignedCapa.actionTitle}</p>
            <p className="text-[11px] text-slate-600">
              Assignee: {finding.assignedCapa.responsiblePerson?.name || 'Site Lead'} • Due Date:{' '}
              {new Date(finding.assignedCapa.dueDate).toLocaleDateString()} • Progress: {finding.assignedCapa.progressPercentage || 0}%
            </p>
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <p className="text-xs text-slate-500 mb-2">No CAPA action has been assigned to this non-conformance.</p>
            <button
              onClick={() => setCapaModalOpen(true)}
              className="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-semibold"
            >
              Assign Corrective Action
            </button>
          </div>
        )}
      </div>

      {/* Quick CAPA Modal */}
      <CapaModal
        isOpen={capaModalOpen}
        onClose={() => setCapaModalOpen(false)}
        defaultFindingId={finding._id}
        defaultAuditId={finding.audit?._id || finding.audit}
        defaultSiteId={finding.site?._id || finding.site}
        defaultActionTitle={`Remediation for: ${finding.title}`}
        defaultProblemStatement={finding.description}
        onSaved={fetchFinding}
      />

      {/* Close Finding Modal */}
      <ConfirmationModal
        isOpen={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        onConfirm={handleCloseFinding}
        title="Verify & Close Finding"
        message="Please verify that corrective containment measures have been performed. Confirm closure of this environmental finding?"
        confirmText="Confirm Closure"
        isLoading={actionLoading}
      />
    </div>
  );
}

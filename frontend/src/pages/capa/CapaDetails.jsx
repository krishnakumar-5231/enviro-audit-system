import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  Factory,
  ClipboardList,
  AlertTriangle,
  User,
  Calendar,
  Clock,
  Upload,
  Send,
  CheckCircle2,
  XCircle,
  FileText,
  MessageSquare,
  Lock,
  Edit,
  Save
} from 'lucide-react';
import { capaAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import CapaTimeline from '../../components/workflow/CapaTimeline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import CapaVerifyModal from './CapaVerifyModal';
import Toast from '../../components/common/Toast';

export default function CapaDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const [capa, setCapa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Progress update state
  const [progress, setProgress] = useState(0);
  const [rootCause, setRootCause] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [preventiveAction, setPreventiveAction] = useState('');

  // Comment state
  const [commentText, setCommentText] = useState('');

  // Verification modal
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);

  const fetchCapa = async () => {
    setLoading(true);
    try {
      const res = await capaAPI.getCapa(id);
      const data = res.data.data;
      setCapa(data);
      setProgress(data.progressPercentage || 0);
      setRootCause(data.rootCause || '');
      setCorrectiveAction(data.correctiveAction || '');
      setPreventiveAction(data.preventiveAction || '');
    } catch (err) {
      console.error('Error fetching CAPA:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapa();
  }, [id]);

  const handleUpdateProgress = async () => {
    setActionLoading(true);
    try {
      await capaAPI.updateCapa(id, {
        progressPercentage: progress,
        rootCause,
        correctiveAction,
        preventiveAction
      });
      setToast({ message: 'CAPA progress updated successfully!', type: 'success' });
      fetchCapa();
    } catch (err) {
      setToast({ message: 'Error updating CAPA progress.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitForVerification = async () => {
    setActionLoading(true);
    try {
      await capaAPI.submitCapa(id);
      setToast({ message: 'CAPA submitted for compliance verification!', type: 'success' });
      fetchCapa();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error submitting for verification.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseCapa = async () => {
    setActionLoading(true);
    try {
      await capaAPI.closeCapa(id);
      setCloseModalOpen(false);
      setToast({ message: 'CAPA and linked finding officially closed!', type: 'success' });
      fetchCapa();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error closing CAPA.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await capaAPI.addComment(id, { text: commentText.trim() });
      setCommentText('');
      fetchCapa();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await capaAPI.uploadEvidence(id, formData);
      setToast({ message: `Evidence "${file.name}" uploaded successfully!`, type: 'success' });
      fetchCapa();
    } catch (err) {
      setToast({ message: 'Error uploading file.', type: 'error' });
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading CAPA workflow workspace..." />;
  }

  if (!capa) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">CAPA record not found.</p>
        <button
          onClick={() => navigate('/capa')}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
        >
          Back to CAPA
        </button>
      </div>
    );
  }

  const isClosed = capa.status === 'Closed';

  return (
    <div className="space-y-6 pb-20">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/capa')}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{capa.actionTitle}</h2>
              <Badge status={capa.status} />
              <Badge status={capa.priority} label={`${capa.priority} Priority`} />
              {capa.isOverdue && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 animate-pulse">
                  Overdue
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Code: {capa.capaCode} • Facility: {capa.site?.name} • Assignee: {capa.responsiblePerson?.name}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {['Assigned', 'In Progress'].includes(capa.status) && (
            <button
              onClick={handleSubmitForVerification}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Submit for Verification</span>
            </button>
          )}

          {capa.status === 'Pending Verification' &&
            hasRole('Administrator', 'Compliance Officer', 'Environmental Auditor') && (
              <button
                onClick={() => setVerifyModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm flex items-center space-x-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Review & Verify Action</span>
              </button>
            )}

          {capa.status === 'Verified' &&
            hasRole('Administrator', 'Compliance Officer') && (
              <button
                onClick={() => setCloseModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center space-x-1.5 transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>Officially Close CAPA</span>
              </button>
            )}
        </div>
      </div>

      {/* Visual Workflow Timeline */}
      <CapaTimeline capa={capa} />

      {/* Metadata Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Facility & Department</p>
          <p className="text-xs font-bold text-slate-900 mt-1">{capa.site?.name}</p>
          <p className="text-[11px] text-slate-500">{capa.assignedDepartment || 'Site EHS'}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Lead Assignee</p>
          <p className="text-xs font-bold text-slate-900 mt-1">{capa.responsiblePerson?.name || 'Unassigned'}</p>
          <p className="text-[11px] text-slate-500">{capa.responsiblePerson?.email}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">SLA Due Date</p>
          <p className={`text-xs font-bold mt-1 ${capa.isOverdue ? 'text-rose-600' : 'text-slate-900'}`}>
            {new Date(capa.dueDate).toLocaleDateString()}
          </p>
          <p className="text-[11px] text-slate-500">
            {capa.isOverdue ? 'SLA Target Exceeded' : 'On-Schedule Target'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Associated Finding</p>
          {capa.finding ? (
            <Link
              to={`/findings/${capa.finding._id || capa.finding}`}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 mt-1 block truncate"
            >
              {capa.finding.title || capa.finding.findingCode || 'View Non-Conformance'}
            </Link>
          ) : (
            <p className="text-xs text-slate-500 mt-1">Direct CAPA Action</p>
          )}
          <p className="text-[11px] text-slate-400">Click to inspect root finding</p>
        </div>
      </div>

      {/* Problem Statement Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Deficiency & Problem Statement
        </h3>
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
          {capa.problemStatement}
        </p>
      </div>

      {/* Corrective, Preventive & Root Cause Analysis Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">
            Remediation Workpack & Progress Tracking
          </h3>
          {!isClosed && (
            <button
              onClick={handleUpdateProgress}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Action Progress</span>
            </button>
          )}
        </div>

        {/* Progress Slider */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Current Implementation Progress
            </span>
            <span className="text-sm font-black text-teal-700">{progress}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            disabled={isClosed}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-teal-600 cursor-pointer disabled:opacity-50"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0% Initiation</span>
            <span>50% In Progress</span>
            <span>100% Ready for Verification</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Root Cause Analysis</label>
          <textarea
            rows={2}
            disabled={isClosed}
            value={rootCause}
            onChange={(e) => setRootCause(e.target.value)}
            placeholder="Underlying root cause determined during failure investigation..."
            className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 disabled:opacity-75"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Immediate Corrective Action</label>
            <textarea
              rows={3}
              disabled={isClosed}
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              placeholder="Immediate repairs, physical containment, or defect correction deployed..."
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 disabled:opacity-75"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Long-term Preventive Action</label>
            <textarea
              rows={3}
              disabled={isClosed}
              value={preventiveAction}
              onChange={(e) => setPreventiveAction(e.target.value)}
              placeholder="Systemic adjustments to prevent recurrence (SOP revisions, sensor installations, training)..."
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 disabled:opacity-75"
            />
          </div>
        </div>
      </div>

      {/* Verification Results Block (If verified or rejected) */}
      {(capa.verificationRemarks || capa.rejectionRemarks) && (
        <div
          className={`p-5 rounded-3xl border ${
            capa.status === 'Verified' || capa.status === 'Closed'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-center space-x-2 mb-2">
            {capa.status === 'Verified' || capa.status === 'Closed' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600" />
            )}
            <h4 className="text-xs font-bold uppercase tracking-wider">
              {capa.status === 'Verified' || capa.status === 'Closed'
                ? 'Compliance Verification Sign-off'
                : 'Verification Deficiencies Identified'}
            </h4>
          </div>
          <p className="text-xs leading-relaxed">
            {capa.verificationRemarks || capa.rejectionRemarks}
          </p>
          {capa.verifiedBy && (
            <p className="text-[11px] text-slate-500 mt-2">
              Reviewed by {capa.verifiedBy.name} on {new Date(capa.verifiedDate).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Evidence Attachments & Comments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supporting Evidence */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Remediation Evidence ({capa.evidenceFiles?.length || 0})
            </h3>
            {!isClosed && (
              <label className="cursor-pointer inline-flex items-center px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 text-xs font-semibold transition-colors">
                <Upload className="w-3.5 h-3.5 mr-1" />
                <span>Upload Evidence</span>
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {capa.evidenceFiles?.length > 0 ? (
              capa.evidenceFiles.map((ev, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0 pr-3">
                    <FileText className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span className="text-xs font-medium text-slate-800 truncate">
                      {ev.originalName}
                    </span>
                  </div>
                  <a
                    href={ev.filePath}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex-shrink-0"
                  >
                    View
                  </a>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                No corrective action evidence files attached yet.
              </p>
            )}
          </div>
        </div>

        {/* Discussion Comments */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-teal-600" />
              <span>Remediation Activity Discussion</span>
            </h3>

            <div className="max-h-56 overflow-y-auto space-y-2.5 pr-2">
              {capa.comments?.length > 0 ? (
                capa.comments.map((cm, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-bold text-slate-700">{cm.user?.name || 'Collaborator'}</span>
                      <span>{new Date(cm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-800">{cm.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No discussions recorded yet.
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleAddComment} className="flex items-center space-x-2 pt-3 border-t border-slate-100">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add observation or update note..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Post
            </button>
          </form>
        </div>
      </div>

      {/* Verify Action Modal */}
      <CapaVerifyModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        capa={capa}
        onVerified={fetchCapa}
      />

      {/* Close Action Modal */}
      <ConfirmationModal
        isOpen={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        onConfirm={handleCloseCapa}
        title="Officially Close Corrective Action"
        message="This action has been verified by compliance. Proceeding will officially mark this CAPA and its parent non-conformance finding as Closed."
        confirmText="Confirm & Close"
        isLoading={actionLoading}
      />
    </div>
  );
}

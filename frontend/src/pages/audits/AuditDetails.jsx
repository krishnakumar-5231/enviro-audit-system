import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ClipboardList,
  ArrowLeft,
  Factory,
  User,
  Calendar,
  Play,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Award,
  Plus,
  ArrowUpRight,
  Send,
  CheckSquare
} from 'lucide-react';
import { auditAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import WorkflowStepper from '../../components/workflow/WorkflowStepper';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import FindingModal from '../findings/FindingModal';
import CapaModal from '../capa/CapaModal';
import ReportGenerateModal from '../reports/ReportGenerateModal';

export default function AuditDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Action Modals
  const [findingModalOpen, setFindingModalOpen] = useState(false);
  const [capaModalOpen, setCapaModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completionRemarks, setCompletionRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const res = await auditAPI.getAudit(id);
      setData(res.data.data);
    } catch (err) {
      console.error('Error fetching audit details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading audit workspace..." />;
  }

  if (!data || !data.audit) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Audit record not found.</p>
        <button
          onClick={() => navigate('/audits')}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
        >
          Back to Audits
        </button>
      </div>
    );
  }

  const { audit, inspection, findings = [], capas = [] } = data;

  const handleStartAudit = async () => {
    setActionLoading(true);
    try {
      await auditAPI.startAudit(audit._id);
      fetchAuditData();
    } catch (err) {
      console.error('Start audit error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteAudit = async () => {
    setActionLoading(true);
    try {
      await auditAPI.completeAudit(audit._id, { completionRemarks });
      setCompleteModalOpen(false);
      fetchAuditData();
    } catch (err) {
      console.error('Complete audit error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/audits')}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{audit.title}</h2>
              <Badge status={audit.status} />
              <Badge status={audit.priority} label={`${audit.priority} Priority`} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Code: {audit.auditCode} • Facility: {audit.site?.name} ({audit.site?.siteCode})
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {audit.status === 'Scheduled' && hasRole('Administrator', 'Environmental Auditor') && (
            <button
              onClick={handleStartAudit}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>Start Audit Execution</span>
            </button>
          )}

          {audit.status === 'In Progress' && (
            <button
              onClick={() => {
                if (inspection) {
                  navigate(`/inspections/${inspection._id}/execute`);
                } else {
                  navigate(`/inspections?auditId=${audit._id}`);
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Conduct Digital Inspection</span>
            </button>
          )}

          {(audit.status === 'Submitted' || audit.status === 'Under Review') &&
            hasRole('Administrator', 'Compliance Officer') && (
              <button
                onClick={() => setCompleteModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center space-x-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Complete Audit</span>
              </button>
            )}

          <button
            onClick={() => setReportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs shadow-sm flex items-center space-x-1.5 transition-colors"
          >
            <FileText className="w-4 h-4 text-teal-400" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Visual Workflow Stepper */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Audit Lifecycle Progression
        </h4>
        <WorkflowStepper currentStatus={audit.status} />
      </div>

      {/* Audit Metadata Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Site Facility</p>
          <p className="text-sm font-bold text-slate-900 mt-1">{audit.site?.name}</p>
          <p className="text-xs text-slate-500">{audit.site?.location}, {audit.site?.city}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Lead Auditor</p>
          <p className="text-sm font-bold text-slate-900 mt-1">{audit.leadAuditor?.name || 'Unassigned'}</p>
          <p className="text-xs text-slate-500">{audit.leadAuditor?.department || 'EHS Assurance'}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Schedule Timeline</p>
          <p className="text-sm font-bold text-slate-900 mt-1">
            {new Date(audit.scheduledDate).toLocaleDateString()}
          </p>
          <p className="text-xs text-slate-500">
            {audit.endDate ? `Completed on ${new Date(audit.endDate).toLocaleDateString()}` : 'Audit Active'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Compliance Index</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-teal-700">
              {audit.complianceScore > 0 ? `${audit.complianceScore}%` : 'Pending'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Checklist verified score</p>
        </div>
      </div>

      {/* Scope and Objectives */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Audit Scope & Focus</h4>
          <p className="text-xs text-slate-700 mt-1 leading-relaxed">{audit.scope}</p>
        </div>
        <div className="pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Regulatory Objectives</h4>
          <p className="text-xs text-slate-700 mt-1 leading-relaxed">{audit.objectives}</p>
        </div>
      </div>

      {/* Linked Digital Inspection Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Digital Inspection Checklist</h3>
            <p className="text-xs text-slate-500">Dynamic checklist evaluation, non-compliance recording, and evidence</p>
          </div>
          {inspection && (
            <Link
              to={`/inspections/${inspection._id}/execute`}
              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold border border-teal-200 transition-colors flex items-center space-x-1"
            >
              <span>{inspection.status === 'Submitted' ? 'Review Inspection' : 'Execute Checklist'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {inspection ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Items</span>
              <p className="text-lg font-bold text-slate-900">{inspection.statistics?.totalItems || 0}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-600">Compliant</span>
              <p className="text-lg font-bold text-emerald-700">{inspection.statistics?.compliantCount || 0}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-rose-600">Non-Compliant</span>
              <p className="text-lg font-bold text-rose-700">{inspection.statistics?.nonCompliantCount || 0}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-600">Partial</span>
              <p className="text-lg font-bold text-amber-700">{inspection.statistics?.partiallyCompliantCount || 0}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-700">Calculated Score</span>
              <p className="text-lg font-bold text-teal-800">{inspection.statistics?.compliancePercentage || 0}%</p>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <p className="text-xs text-slate-500 mb-2">No digital inspection started for this audit yet.</p>
            {hasRole('Administrator', 'Environmental Auditor') && (
              <button
                onClick={() => navigate(`/inspections?auditId=${audit._id}`)}
                className="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-semibold"
              >
                Start Checklist Inspection
              </button>
            )}
          </div>
        )}
      </div>

      {/* Linked Findings & CAPA Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Findings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Findings & Non-Conformances ({findings.length})</h3>
              <p className="text-xs text-slate-500">Environmental risks logged during this audit</p>
            </div>
            {hasRole('Administrator', 'Environmental Auditor') && (
              <button
                onClick={() => setFindingModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold border border-teal-200 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Raise Finding</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {findings.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No findings recorded for this audit.</p>
            ) : (
              findings.map((f) => (
                <div
                  key={f._id}
                  onClick={() => navigate(`/findings/${f._id}`)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 rounded-xl px-2 cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-bold text-slate-900 truncate">{f.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {f.findingCode} • {f.category}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge status={f.severity} />
                    <Badge status={f.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CAPA Actions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">CAPA Remediation Matrix ({capas.length})</h3>
              <p className="text-xs text-slate-500">Corrective actions assigned to address non-conformances</p>
            </div>
            {hasRole('Administrator', 'Environmental Auditor', 'Site Manager', 'Compliance Officer') && (
              <button
                onClick={() => setCapaModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold border border-teal-200 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create CAPA</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {capas.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No corrective actions logged yet.</p>
            ) : (
              capas.map((c) => (
                <div
                  key={c._id}
                  onClick={() => navigate(`/capa/${c._id}`)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 rounded-xl px-2 cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-bold text-slate-900 truncate">{c.actionTitle}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {c.capaCode} • Assignee: {c.responsiblePerson?.name || 'Unassigned'} • Due: {new Date(c.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge status={c.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      <ConfirmationModal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        onConfirm={handleCompleteAudit}
        title="Complete Environmental Audit"
        message="Are you sure you want to verify and complete this audit? This will lock audit records and update overall site compliance ratings."
        confirmText="Confirm & Complete"
        isLoading={actionLoading}
      />

      {/* Create Finding Modal */}
      <FindingModal
        isOpen={findingModalOpen}
        onClose={() => setFindingModalOpen(false)}
        defaultAuditId={audit._id}
        defaultSiteId={audit.site?._id}
        onSaved={fetchAuditData}
      />

      {/* Create CAPA Modal */}
      <CapaModal
        isOpen={capaModalOpen}
        onClose={() => setCapaModalOpen(false)}
        defaultAuditId={audit._id}
        defaultSiteId={audit.site?._id}
        onSaved={fetchAuditData}
      />

      {/* Generate Report Modal */}
      <ReportGenerateModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        defaultSiteId={audit.site?._id}
        defaultAuditId={audit._id}
        onReportCreated={() => {
          fetchAuditData();
          navigate('/reports');
        }}
      />
    </div>
  );
}

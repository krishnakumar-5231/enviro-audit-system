import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  Plus,
  Filter,
  Calendar,
  User,
  Factory,
  ArrowRight,
  Play,
  Edit,
  Trash2
} from 'lucide-react';
import { auditAPI, siteAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import AuditModal from './AuditModal';

export default function AuditList() {
  const [audits, setAudits] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [auditTypeFilter, setAuditTypeFilter] = useState('');
  const [sites, setSites] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [auditToDelete, setAuditToDelete] = useState(null);

  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if query params contain search or site filter
    const queryParams = new URLSearchParams(location.search);
    const siteParam = queryParams.get('site');
    const searchParam = queryParams.get('search');
    if (siteParam) setSiteFilter(siteParam);
    if (searchParam) setSearch(searchParam);

    const loadSites = async () => {
      try {
        const res = await siteAPI.getSites({ limit: 100 });
        setSites(res.data.data);
      } catch (err) {
        console.error('Error loading sites:', err);
      }
    };
    loadSites();
  }, [location.search]);

  const fetchAudits = async (page = 1) => {
    setLoading(true);
    try {
      const res = await auditAPI.getAudits({
        page,
        limit: 10,
        search,
        status: statusFilter,
        site: siteFilter,
        auditType: auditTypeFilter
      });
      setAudits(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching audits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchAudits(1);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter, siteFilter, auditTypeFilter]);

  const handleDelete = async () => {
    if (!auditToDelete) return;
    try {
      await auditAPI.deleteAudit(auditToDelete._id);
      setDeleteModalOpen(false);
      setAuditToDelete(null);
      fetchAudits(pagination.page);
    } catch (err) {
      console.error('Delete audit error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Environmental Audits Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Schedule, monitor execution, and record compliance verification for industrial sites.
          </p>
        </div>

        {hasRole('Administrator', 'Environmental Auditor') && (
          <button
            onClick={() => {
              setSelectedAudit(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Schedule New Audit</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by audit title, audit code (AUD-2026-001), or scope..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-teal-500"
          >
            <option value="">All Facilities</option>
            {sites.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-teal-500"
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={auditTypeFilter}
            onChange={(e) => setAuditTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-teal-500"
          >
            <option value="">All Audit Types</option>
            <option value="Internal Environmental Audit">Internal Environmental Audit</option>
            <option value="Compliance Audit">Compliance Audit</option>
            <option value="Site Inspection">Site Inspection</option>
            <option value="Periodic Audit">Periodic Audit</option>
          </select>
        </div>
      </div>

      {/* Audit List Table */}
      {loading ? (
        <LoadingSpinner text="Fetching environmental audits..." />
      ) : audits.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No audits found"
          description="No audits match the selected filter criteria. Schedule an audit to begin tracking."
          actionText={hasRole('Administrator', 'Environmental Auditor') ? 'Schedule Audit' : null}
          onAction={() => {
            setSelectedAudit(null);
            setModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Audit Title / Code</th>
                  <th className="px-6 py-3.5">Facility / Site</th>
                  <th className="px-6 py-3.5">Lead Auditor</th>
                  <th className="px-6 py-3.5">Scheduled Date</th>
                  <th className="px-6 py-3.5">Compliance Score</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {audits.map((audit) => (
                  <tr
                    key={audit._id}
                    onClick={() => navigate(`/audits/${audit._id}`)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                          <ClipboardList className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate group-hover:text-teal-600 transition-colors">
                            {audit.title}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {audit.auditCode} • {audit.auditType}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800 block">
                        {audit.site?.name || 'N/A'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {audit.site?.siteCode} • {audit.site?.city}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800 block">
                        {audit.leadAuditor?.name || 'Unassigned'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {audit.leadAuditor?.department || 'Auditing'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {new Date(audit.scheduledDate).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      {audit.complianceScore > 0 ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            audit.complianceScore >= 85
                              ? 'text-emerald-700 bg-emerald-50'
                              : audit.complianceScore >= 70
                              ? 'text-amber-700 bg-amber-50'
                              : 'text-rose-700 bg-rose-50'
                          }`}
                        >
                          {audit.complianceScore}%
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <Badge status={audit.status} />
                    </td>

                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1">
                        {hasRole('Administrator', 'Environmental Auditor') && (
                          <button
                            onClick={() => {
                              setSelectedAudit(audit);
                              setModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Edit Audit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {hasRole('Administrator') && (
                          <button
                            onClick={() => {
                              setAuditToDelete(audit);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Delete Audit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/audits/${audit._id}`)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Open Audit Workspace"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={(p) => fetchAudits(p)}
          />
        </div>
      )}

      {/* Create / Edit Modal */}
      <AuditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        auditToEdit={selectedAudit}
        onSaved={() => fetchAudits(pagination.page)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Audit Record"
        message={`Are you sure you want to delete audit "${auditToDelete?.title}" (${auditToDelete?.auditCode})? Associated non-conformance logs will be archived.`}
        isDanger={true}
      />
    </div>
  );
}

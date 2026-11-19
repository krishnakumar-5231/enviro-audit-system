import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  Plus,
  Filter,
  ArrowRight,
  ShieldCheck,
  Factory,
  ClipboardList
} from 'lucide-react';
import { findingAPI, siteAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FindingModal from './FindingModal';
import CapaModal from '../capa/CapaModal';

export default function FindingsList() {
  const [findings, setFindings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);

  // Quick CAPA generation modal from finding
  const [capaModalOpen, setCapaModalOpen] = useState(false);
  const [findingForCapa, setFindingForCapa] = useState(null);

  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const fetchFindings = async (page = 1) => {
    setLoading(true);
    try {
      const res = await findingAPI.getFindings({
        page,
        limit: 10,
        search,
        severity: severityFilter,
        status: statusFilter,
        category: categoryFilter
      });
      setFindings(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching findings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFindings(1);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, severityFilter, statusFilter, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Findings & Non-Conformances
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track environmental defects, severity levels, statutory breaches, and assigned remediation CAPAs.
          </p>
        </div>

        {hasRole('Administrator', 'Environmental Auditor') && (
          <button
            onClick={() => {
              setSelectedFinding(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Record New Finding</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search findings by code (FND-2026-001), title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-teal-500"
          >
            <option value="">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-teal-500"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="CAPA Assigned">CAPA Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Findings Table */}
      {loading ? (
        <LoadingSpinner text="Fetching findings and non-conformances..." />
      ) : findings.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No non-conformances found"
          description="No findings match your search parameters. You can record a finding directly or conduct an inspection."
          actionText={hasRole('Administrator', 'Environmental Auditor') ? 'Record Finding' : null}
          onAction={() => {
            setSelectedFinding(null);
            setModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Finding / Code</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Facility / Audit</th>
                  <th className="px-6 py-3.5">Severity</th>
                  <th className="px-6 py-3.5">CAPA Remediation</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {findings.map((f) => (
                  <tr
                    key={f._id}
                    onClick={() => navigate(`/findings/${f._id}`)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate group-hover:text-teal-600 transition-colors">
                            {f.title}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {f.findingCode} • Ref: {f.requirementReference || 'EHS Standard'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-800">
                      {f.category}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800 block truncate">
                        {f.site?.name || 'Facility'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {f.audit?.auditCode}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <Badge status={f.severity} />
                    </td>

                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      {f.assignedCapa ? (
                        <Link
                          to={`/capa/${f.assignedCapa._id}`}
                          className="inline-flex items-center space-x-1 text-teal-700 hover:text-teal-900 font-semibold"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                          <span>{f.assignedCapa.capaCode || 'View Action'}</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            setFindingForCapa(f);
                            setCapaModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-[11px] border border-amber-200 transition-colors"
                        >
                          + Create CAPA
                        </button>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <Badge status={f.status} />
                    </td>

                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/findings/${f._id}`)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
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
            onPageChange={(p) => fetchFindings(p)}
          />
        </div>
      )}

      {/* Finding Modal */}
      <FindingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        findingToEdit={selectedFinding}
        onSaved={() => fetchFindings(pagination.page)}
      />

      {/* Quick CAPA Modal */}
      {findingForCapa && (
        <CapaModal
          isOpen={capaModalOpen}
          onClose={() => {
            setCapaModalOpen(false);
            setFindingForCapa(null);
          }}
          defaultFindingId={findingForCapa._id}
          defaultAuditId={findingForCapa.audit?._id || findingForCapa.audit}
          defaultSiteId={findingForCapa.site?._id || findingForCapa.site}
          defaultActionTitle={`Remediation for: ${findingForCapa.title}`}
          defaultProblemStatement={findingForCapa.description}
          onSaved={() => fetchFindings(pagination.page)}
        />
      )}
    </div>
  );
}

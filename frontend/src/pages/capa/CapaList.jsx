import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Plus,
  Filter,
  ArrowRight,
  Clock,
  AlertTriangle,
  User,
  Factory
} from 'lucide-react';
import { capaAPI, siteAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CapaModal from './CapaModal';

export default function CapaList() {
  const [capas, setCapas] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [sites, setSites] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCapa, setSelectedCapa] = useState(null);

  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const siteParam = queryParams.get('site');
    if (siteParam) setSiteFilter(siteParam);

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

  const fetchCapas = async (page = 1) => {
    setLoading(true);
    try {
      const res = await capaAPI.getCapas({
        page,
        limit: 10,
        search,
        status: statusFilter,
        priority: priorityFilter,
        site: siteFilter,
        overdue: overdueOnly ? 'true' : ''
      });
      setCapas(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching CAPA actions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCapas(1);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter, priorityFilter, siteFilter, overdueOnly]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            CAPA Management & Remediation
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track Corrective and Preventive Actions from assignment, through execution, to verification and official closure.
          </p>
        </div>

        {hasRole('Administrator', 'Environmental Auditor', 'Site Manager', 'Compliance Officer') && (
          <button
            onClick={() => {
              setSelectedCapa(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Create CAPA Action</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search CAPA actions by code (CAPA-2026-001) or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-teal-500"
          >
            <option value="">All Statuses</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Verified">Verified</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-teal-500"
          >
            <option value="">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <label className="flex items-center space-x-2 px-3 py-2 bg-rose-50/60 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 cursor-pointer">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500"
            />
            <span>Overdue Only</span>
          </label>
        </div>
      </div>

      {/* CAPA Table */}
      {loading ? (
        <LoadingSpinner text="Fetching corrective actions..." />
      ) : capas.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No CAPA actions found"
          description="Corrective actions are created to address environmental non-conformances. Add an action plan to begin remediation."
          actionText="Create CAPA"
          onAction={() => {
            setSelectedCapa(null);
            setModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Action Plan / Code</th>
                  <th className="px-6 py-3.5">Facility / Site</th>
                  <th className="px-6 py-3.5">Responsible Person</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5">Progress</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {capas.map((capa) => (
                  <tr
                    key={capa._id}
                    onClick={() => navigate(`/capa/${capa._id}`)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate group-hover:text-teal-600 transition-colors">
                            {capa.actionTitle}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {capa.capaCode} • {capa.assignedDepartment}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800 block">
                        {capa.site?.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {capa.site?.siteCode}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800 block">
                        {capa.responsiblePerson?.name || 'Unassigned'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5">
                        <span className={capa.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                          {new Date(capa.dueDate).toLocaleDateString()}
                        </span>
                        {capa.isOverdue && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase animate-pulse">
                            Overdue
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                          <span>Progress</span>
                          <span>{capa.progressPercentage || 0}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              capa.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-teal-600'
                            }`}
                            style={{ width: `${capa.progressPercentage || 0}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge status={capa.status} />
                    </td>

                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/capa/${capa._id}`)}
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
            onPageChange={(p) => fetchCapas(p)}
          />
        </div>
      )}

      {/* Create Modal */}
      <CapaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        capaToEdit={selectedCapa}
        onSaved={() => fetchCapas(pagination.page)}
      />
    </div>
  );
}

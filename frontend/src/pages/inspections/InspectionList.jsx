import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckSquare,
  Search,
  ArrowRight,
  ClipboardList,
  Factory,
  User,
  Calendar
} from 'lucide-react';
import { inspectionAPI } from '../../services/api';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function InspectionList() {
  const [inspections, setInspections] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const navigate = useNavigate();

  const fetchInspections = async (page = 1) => {
    setLoading(true);
    try {
      const res = await inspectionAPI.getInspections({
        page,
        limit: 10,
        search,
        status: statusFilter
      });
      setInspections(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchInspections(1);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Digital Inspection Management
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Perform paperless environmental checklist inspections, capture field observations, and calculate compliance scores.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by inspection code (INSP-2026-001) or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-teal-500"
        >
          <option value="">All Statuses</option>
          <option value="In Progress">In Progress</option>
          <option value="Submitted">Submitted</option>
          <option value="Approved">Approved</option>
        </select>
      </div>

      {/* Inspections Table */}
      {loading ? (
        <LoadingSpinner text="Fetching digital inspections..." />
      ) : inspections.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No digital inspections found"
          description="Inspections are created when executing scheduled audits. Select an audit to begin an inspection."
          actionText="View Audits"
          onAction={() => navigate('/audits')}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Inspection / Code</th>
                  <th className="px-6 py-3.5">Linked Audit</th>
                  <th className="px-6 py-3.5">Facility / Site</th>
                  <th className="px-6 py-3.5">Inspector</th>
                  <th className="px-6 py-3.5">Scorecard %</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspections.map((insp) => (
                  <tr
                    key={insp._id}
                    onClick={() => navigate(`/inspections/${insp._id}/execute`)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                          <CheckSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block group-hover:text-teal-600 transition-colors">
                            {insp.inspectionCode}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {insp.inspectionCategory || 'Environmental Checklist'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800 block">
                        {insp.audit?.title || 'Audit Reference'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {insp.audit?.auditCode}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800 block">
                        {insp.site?.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {insp.site?.siteCode}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800 block">
                        {insp.inspector?.name || 'Inspector'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        {insp.statistics?.compliancePercentage || 0}% Score
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <Badge status={insp.status} />
                    </td>

                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/inspections/${insp._id}/execute`)}
                        className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 font-semibold text-xs transition-colors"
                      >
                        {insp.status === 'Submitted' ? 'Review' : 'Execute'}
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
            onPageChange={(p) => fetchInspections(p)}
          />
        </div>
      )}
    </div>
  );
}

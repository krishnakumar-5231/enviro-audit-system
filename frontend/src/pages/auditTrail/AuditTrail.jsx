import React, { useState, useEffect } from 'react';
import { History, Search, Filter } from 'lucide-react';
import { auditLogAPI } from '../../services/api';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await auditLogAPI.getAuditLogs({
        page,
        limit: 15,
        search,
        action: actionFilter,
        entityType: entityFilter
      });
      if (res.data.success) {
        setLogs(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, actionFilter, entityFilter]);

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELETE':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'SUBMIT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'VERIFY':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">System Audit Trail</h2>
        <p className="text-xs text-slate-500 mt-1">
          Immutable, timestamped record of actions, modifications, and compliance lifecycle events.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search logs by user, entity or desc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
          >
            <option value="">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="SUBMIT">SUBMIT</option>
            <option value="VERIFY">VERIFY</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
          >
            <option value="">All Entities</option>
            <option value="Audit">Audit</option>
            <option value="Inspection">Inspection</option>
            <option value="Finding">Finding</option>
            <option value="CAPA">CAPA</option>
            <option value="Site">Site</option>
            <option value="User">User</option>
            <option value="Checklist">Checklist</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><LoadingSpinner /></div>
        ) : logs.length === 0 ? (
          <EmptyState
            title="No audit logs found"
            description="System activity matching current criteria will show here."
            icon={History}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Entity</th>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp || log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap font-medium text-slate-900">
                      {log.entityType} {log.entityCode && <span className="text-slate-400">({log.entityCode})</span>}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">{log.userName || log.user?.name || 'System'}</span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 max-w-md truncate">
                      {log.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={pagination} onPageChange={(p) => fetchLogs(p)} />
      </div>
    </div>
  );
}

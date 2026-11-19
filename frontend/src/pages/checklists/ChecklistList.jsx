import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListTodo,
  Search,
  Plus,
  ArrowRight,
  Eye,
  Trash2,
  Edit
} from 'lucide-react';
import { checklistAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export default function ChecklistList() {
  const [checklists, setChecklists] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState(null);

  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const fetchChecklists = async (page = 1) => {
    setLoading(true);
    try {
      const res = await checklistAPI.getChecklists({ page, limit: 10, search });
      setChecklists(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching checklists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchChecklists(1);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleDelete = async () => {
    if (!checklistToDelete) return;
    try {
      await checklistAPI.deleteChecklist(checklistToDelete._id);
      setDeleteModalOpen(false);
      setChecklistToDelete(null);
      fetchChecklists(pagination.page);
    } catch (err) {
      console.error('Delete checklist error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Audit Checklist Templates
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configurable question templates and scoring frameworks stored in database.
          </p>
        </div>

        {hasRole('Administrator', 'Environmental Auditor') && (
          <button
            onClick={() => navigate('/checklists/builder')}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Create Checklist Template</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search checklists by title, code or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Checklist Table */}
      {loading ? (
        <LoadingSpinner text="Fetching checklist banks..." />
      ) : checklists.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No checklist templates found"
          description="Build custom environmental checklists with categories and questions."
          actionText="Create Checklist"
          onAction={() => navigate('/checklists/builder')}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Checklist / Code</th>
                  <th className="px-6 py-3.5">Industry Type</th>
                  <th className="px-6 py-3.5">Categories</th>
                  <th className="px-6 py-3.5">Total Questions</th>
                  <th className="px-6 py-3.5">Version</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {checklists.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`/checklists/${c._id}`)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                          <ListTodo className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block group-hover:text-teal-600 transition-colors">
                            {c.title}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {c.checklistCode}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-800">
                      {c.industryType}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {c.categories?.length || 0} Categories
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                        {c.questions?.length || 0} Questions
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-slate-500">
                      v{c.version}
                    </td>

                    <td className="px-6 py-4">
                      <Badge status={c.status} />
                    </td>

                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1">
                        {hasRole('Administrator') && (
                          <button
                            onClick={() => {
                              setChecklistToDelete(c);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/checklists/${c._id}`)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
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
            onPageChange={(p) => fetchChecklists(p)}
          />
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Checklist Template"
        message={`Are you sure you want to delete "${checklistToDelete?.title}"?`}
        isDanger={true}
      />
    </div>
  );
}

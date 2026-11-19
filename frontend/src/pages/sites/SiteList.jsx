import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Factory,
  Search,
  Plus,
  Filter,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  Edit,
  Trash2
} from 'lucide-react';
import { siteAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import SiteModal from './SiteModal';

export default function SiteList() {
  const [sites, setSites] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState(null);

  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const fetchSites = async (page = 1) => {
    setLoading(true);
    try {
      const res = await siteAPI.getSites({
        page,
        limit: 10,
        search,
        industryType: industryFilter,
        status: statusFilter
      });
      setSites(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching sites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSites(1);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, industryFilter, statusFilter]);

  const handleDelete = async () => {
    if (!siteToDelete) return;
    try {
      await siteAPI.deleteSite(siteToDelete._id);
      setDeleteModalOpen(false);
      setSiteToDelete(null);
      fetchSites(pagination.page);
    } catch (err) {
      console.error('Delete site error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Industrial Sites Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Centrally manage facilities, boundary controls, site contacts, and compliance scores.
          </p>
        </div>

        {hasRole('Administrator') && (
          <button
            onClick={() => {
              setSelectedSite(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Industrial Site</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by facility name, site code, city or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-teal-500"
          >
            <option value="">All Industries</option>
            <option value="Petrochemical Refining">Petrochemical Refining</option>
            <option value="Metallurgical & Heavy Manufacturing">Metallurgical & Steel</option>
            <option value="Pharmaceuticals & Fine Chemicals">Pharmaceuticals</option>
            <option value="Agricultural Chemicals & Fertilizers">Agro-Chemicals</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-teal-500"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Under Renovation">Under Renovation</option>
          </select>
        </div>
      </div>

      {/* Site Cards / Table Grid */}
      {loading ? (
        <LoadingSpinner text="Loading industrial sites..." />
      ) : sites.length === 0 ? (
        <EmptyState
          icon={Factory}
          title="No sites found"
          description="No industrial sites match your search criteria. Add a new facility to begin monitoring."
          actionText={hasRole('Administrator') ? 'Add New Site' : null}
          onAction={() => {
            setSelectedSite(null);
            setModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Facility / Site Code</th>
                  <th className="px-6 py-3.5">Industry Type</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Compliance %</th>
                  <th className="px-6 py-3.5">Audits / Open CAPA</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sites.map((site) => {
                  const compScore = site.stats?.complianceScore || 85;
                  const compBadgeColor =
                    compScore >= 85 ? 'text-emerald-700 bg-emerald-50' : compScore >= 70 ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50';

                  return (
                    <tr
                      key={site._id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/sites/${site._id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                            <Factory className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block group-hover:text-teal-600 transition-colors">
                              {site.name}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {site.siteCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-700">
                        {site.industryType}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {site.city}, {site.state}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${compBadgeColor}`}>
                          {compScore}%
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3 text-[11px]">
                          <span className="text-slate-600 font-medium">
                            {site.stats?.auditCount || 0} Audits
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className={`${site.stats?.openCapaCount > 0 ? 'text-amber-600 font-bold' : 'text-slate-500'}`}>
                            {site.stats?.openCapaCount || 0} CAPA
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge status={site.status} />
                      </td>

                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1">
                          {hasRole('Administrator') && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedSite(site);
                                  setModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Edit Site"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSiteToDelete(site);
                                  setDeleteModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Delete Site"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => navigate(`/sites/${site._id}`)}
                            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                            title="View Site Profile"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={(p) => fetchSites(p)}
          />
        </div>
      )}

      {/* Create / Edit Modal */}
      <SiteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        siteToEdit={selectedSite}
        onSaved={() => fetchSites(pagination.page)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Industrial Site"
        message={`Are you sure you want to permanently delete "${siteToDelete?.name}" (${siteToDelete?.siteCode})? This will affect historical audit records.`}
        isDanger={true}
      />
    </div>
  );
}

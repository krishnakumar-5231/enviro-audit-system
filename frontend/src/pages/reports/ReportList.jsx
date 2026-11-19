import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Plus,
  Download,
  Eye,
  Calendar,
  Factory,
  CheckCircle2
} from 'lucide-react';
import { reportAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReportGenerateModal from './ReportGenerateModal';

export default function ReportList() {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reportTypeFilter, setReportTypeFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);

  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const fetchReports = async (page = 1) => {
    setLoading(true);
    try {
      const res = await reportAPI.getReports({
        page,
        limit: 10,
        search,
        reportType: reportTypeFilter
      });
      setReports(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchReports(1);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, reportTypeFilter]);

  const handleDownload = (e, report) => {
    e.stopPropagation();
    window.open(reportAPI.downloadReportUrl(report._id), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Statutory & Compliance Reports
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate, archive, and download formal environmental audit reports compiled from verified operational records.
          </p>
        </div>

        {hasRole('Administrator', 'Compliance Officer', 'Environmental Auditor') && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Generate New Report</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search reports by title or report code (REP-2026-001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <select
          value={reportTypeFilter}
          onChange={(e) => setReportTypeFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-teal-500"
        >
          <option value="">All Report Types</option>
          <option value="Environmental Audit Report">Environmental Audit Report</option>
          <option value="Inspection Report">Inspection Report</option>
          <option value="Compliance Summary">Compliance Summary</option>
          <option value="CAPA Status Report">CAPA Status Report</option>
          <option value="Site Compliance Report">Site Compliance Report</option>
        </select>
      </div>

      {/* Reports Table */}
      {loading ? (
        <LoadingSpinner text="Fetching generated compliance reports..." />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No compliance reports generated"
          description="Reports synthesize stored audit findings, scores, and CAPAs into official downloadable PDFs."
          actionText="Generate Report"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Report Title / Code</th>
                  <th className="px-6 py-3.5">Report Type</th>
                  <th className="px-6 py-3.5">Target Facility</th>
                  <th className="px-6 py-3.5">Generated On</th>
                  <th className="px-6 py-3.5">Score</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr
                    key={report._id}
                    onClick={() => navigate(`/reports/${report._id}`)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate group-hover:text-teal-600 transition-colors">
                            {report.title}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {report.reportCode} • Compiled by {report.generatedBy?.name || 'Officer'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-800">
                      {report.reportType}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800 block">
                        {report.site?.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {report.site?.siteCode}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {new Date(report.generationDate).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
                        {report.complianceScore || report.metricsSnapshot?.compliancePercentage || 85}%
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => handleDownload(e, report)}
                          className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm flex items-center space-x-1 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={() => navigate(`/reports/${report._id}`)}
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
            onPageChange={(p) => fetchReports(p)}
          />
        </div>
      )}

      {/* Generate Modal */}
      <ReportGenerateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onReportCreated={() => fetchReports(1)}
      />
    </div>
  );
}

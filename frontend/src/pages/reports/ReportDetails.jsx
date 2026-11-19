import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Download,
  Calendar,
  Factory,
  Award,
  ShieldCheck,
  AlertTriangle,
  Printer
} from 'lucide-react';
import { reportAPI } from '../../services/api';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await reportAPI.getReport(id);
        setReport(res.data.data);
      } catch (err) {
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handleDownload = () => {
    window.open(reportAPI.downloadReportUrl(id), '_blank');
  };

  if (loading) {
    return <LoadingSpinner text="Rendering compliance report preview..." />;
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Report not found.</p>
        <button
          onClick={() => navigate('/reports')}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
        >
          Back to Reports
        </button>
      </div>
    );
  }

  const m = report.metricsSnapshot || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Top Controls */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/reports')}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Report Document Viewer</h2>
            <p className="text-xs text-slate-500 font-mono">Code: {report.reportCode}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Styled Printable Report Container */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-lg space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Banner Header */}
        <div className="border-b-2 border-teal-700 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-teal-700">
                Official Environmental Compliance Document
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-1 uppercase tracking-tight">
                {report.title}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Centralized Environmental Audit Management System (CEAMS)
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-slate-400 block">{report.reportCode}</span>
              <span className="text-xs text-slate-600 block mt-1">
                Generated: {new Date(report.generationDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Facility & Metadata Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Facility Name</span>
            <span className="font-bold text-slate-900 mt-0.5 block">{report.site?.name}</span>
            <span className="text-[11px] text-slate-500 font-mono">{report.site?.siteCode}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Industry Sector</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">{report.site?.industryType}</span>
            <span className="text-[11px] text-slate-500">{report.site?.location}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Lead Auditor / Issuer</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">{report.generatedBy?.name}</span>
            <span className="text-[11px] text-slate-500">{report.generatedBy?.department || 'EHS Assurance'}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Audit Type</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">{report.reportType}</span>
            <span className="text-[11px] text-teal-700 font-semibold">Verified Records</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            1. Executive Summary & Audit Scope
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            {report.executiveSummary ||
              'This comprehensive environmental audit report compiles physical checklist evaluations, emissions parameters, hazardous chemical storage records, and non-conformance findings. It serves as an internal statutory compliance index and verification document.'}
          </p>
        </div>

        {/* Metric Scorecard Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            2. Compliance Scorecard & Metric Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-center">
              <span className="text-[10px] uppercase font-bold text-teal-800">Compliance Index</span>
              <p className="text-3xl font-black text-teal-900 mt-1">{report.complianceScore}%</p>
              <span className="text-[10px] font-semibold text-teal-700">{m.overallEvaluation || 'Satisfactory'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500">Total Findings</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{m.totalFindings || 0}</p>
              <span className="text-[10px] text-rose-600 font-semibold">
                {(m.criticalFindings || 0) + (m.highFindings || 0)} Critical/High
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500">CAPA Actions</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{m.totalCapa || 0}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">{m.closedCapa || 0} Closed/Verified</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500">Overdue SLA</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{m.overdueCapa || 0}</p>
              <span className="text-[10px] text-slate-500">Pending Actions</span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            3. Corrective Recommendations & Remediation Plan
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            {report.recommendations ||
              'Complete scheduled containment resurfacing, re-calibrate continuous emission monitors, and maintain weekly inspections of secondary spill barriers prior to quarterly statutory filing.'}
          </p>
        </div>

        {/* Regulatory Disclaimer */}
        <div className="p-4 rounded-2xl bg-slate-100 text-slate-600 text-[11px] leading-relaxed">
          <span className="font-bold text-slate-800 block mb-1">Regulatory & Statutory Disclaimer:</span>
          {report.statutoryDisclaimer}
        </div>

        {/* Signatures & Formal Verification Blocks */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="border-b border-slate-400 h-10 mb-2" />
            <p className="font-bold text-slate-900">Lead Environmental Auditor</p>
            <p className="text-[10px] text-slate-500">Field Verification & Audit Lead</p>
          </div>

          <div>
            <div className="border-b border-slate-400 h-10 mb-2" />
            <p className="font-bold text-slate-900">Industrial Site Operations Manager</p>
            <p className="text-[10px] text-slate-500">Facility Acknowledgment</p>
          </div>

          <div>
            <div className="border-b border-slate-400 h-10 mb-2" />
            <p className="font-bold text-slate-900">Chief Compliance Officer</p>
            <p className="text-[10px] text-slate-500">Statutory Review Sign-off</p>
          </div>
        </div>
      </div>
    </div>
  );
}

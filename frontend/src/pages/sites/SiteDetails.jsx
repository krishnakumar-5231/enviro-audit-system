import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Factory,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ClipboardList,
  AlertTriangle,
  ShieldCheck,
  Award,
  Calendar,
  Clock,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { siteAPI } from '../../services/api';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function SiteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSiteDetails = async () => {
      setLoading(true);
      try {
        const res = await siteAPI.getSite(id);
        setData(res.data.data);
      } catch (err) {
        console.error('Error fetching site details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSiteDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading site environmental profile..." />;
  }

  if (!data || !data.site) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Site record not found.</p>
        <button
          onClick={() => navigate('/sites')}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
        >
          Back to Sites
        </button>
      </div>
    );
  }

  const {
    site,
    complianceScore,
    upcomingAudits = [],
    completedAudits = [],
    openFindings = [],
    openCapas = [],
    overdueCapaCount = 0,
    recentActivities = []
  } = data;

  return (
    <div className="space-y-6">
      {/* Back button & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/sites')}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{site.name}</h2>
              <Badge status={site.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Code: {site.siteCode} • {site.industryType}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/audits?site=${site._id}`)}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Site Audit</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Site Compliance"
          value={`${complianceScore}%`}
          subtitle={complianceScore >= 85 ? 'High Rating' : 'Needs Attention'}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Scheduled Audits"
          value={upcomingAudits.length}
          subtitle="Approaching inspections"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Open Non-Conformances"
          value={openFindings.length}
          subtitle="Active findings"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Overdue Actions"
          value={overdueCapaCount}
          subtitle="Critical SLA breaches"
          icon={ShieldAlert}
          color={overdueCapaCount > 0 ? 'rose' : 'teal'}
        />
      </div>

      {/* Facility Contact & Regulatory Information Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
          Facility Specifications & Contacts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50">
            <MapPin className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Address & Basin</p>
              <p className="text-xs text-slate-800 font-medium">{site.address}</p>
              <p className="text-xs text-slate-500">{site.city}, {site.state}, {site.country}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50">
            <Mail className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-slate-500">EHS Lead / Manager</p>
              <p className="text-xs text-slate-800 font-medium">{site.contactPerson}</p>
              <p className="text-xs text-slate-500">{site.contactEmail}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50">
            <Phone className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Emergency Phone</p>
              <p className="text-xs text-slate-800 font-medium">{site.contactPhone}</p>
              <p className="text-[11px] text-slate-400">24/7 Control Room</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50">
            <FileText className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Permit Authorization</p>
              <p className="text-xs text-slate-800 font-medium font-mono">{site.environmentalClearanceNumber || 'State General Permit'}</p>
              <p className="text-[11px] text-teal-600 font-semibold">Active Clearances</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Upcoming Audits & Open Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audits */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Audits at this Facility</h3>
              <Link to={`/audits?site=${site._id}`} className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1">
                <span>All site audits</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {upcomingAudits.concat(completedAudits).slice(0, 5).length > 0 ? (
                upcomingAudits.concat(completedAudits).slice(0, 5).map((a) => (
                  <div
                    key={a._id}
                    onClick={() => navigate(`/audits/${a._id}`)}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 rounded-xl px-2 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{a.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {a.auditCode} • Auditor: {a.leadAuditor?.name || 'Unassigned'}
                      </p>
                    </div>
                    <Badge status={a.status} />
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No audits logged for this site yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Open CAPA & Findings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Active CAPA & Non-Conformances</h3>
              <Link to={`/capa?site=${site._id}`} className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1">
                <span>All site CAPA</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {openCapas.slice(0, 5).length > 0 ? (
                openCapas.slice(0, 5).map((c) => (
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
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No pending CAPA actions for this facility.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

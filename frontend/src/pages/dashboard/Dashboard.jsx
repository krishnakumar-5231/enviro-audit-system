import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Factory,
  ClipboardList,
  AlertTriangle,
  ShieldCheck,
  Award,
  FileText,
  PlusCircle,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { dashboardAPI } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const COLORS = ['#0f766e', '#0284c7', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'];
const SEVERITY_COLORS = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#3b82f6'
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, anaRes] = await Promise.all([
        dashboardAPI.getSummary(),
        dashboardAPI.getAnalytics()
      ]);
      setSummary(sumRes.data.data);
      setAnalytics(anaRes.data.data);
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setError('Failed to load live dashboard statistics. Please ensure the backend and MongoDB are running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Computing real-time environmental compliance analytics..." size="lg" />;
  }

  if (error) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Dashboard Unavailable</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
        <button
          onClick={loadDashboardData}
          className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Connection
        </button>
      </div>
    );
  }

  const compliance = summary?.overallCompliance || 0;
  const complianceRating =
    compliance >= 85 ? 'High Compliance' : compliance >= 70 ? 'Moderate Compliance' : 'Action Required';

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span>Real-Time EHS Surveillance Active</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Environmental Compliance Overview
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Centralized monitoring across facilities, scheduled environmental audits, non-conformances, and CAPA remediation workflows.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate('/audits')}
              className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 transition-all flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Schedule Audit</span>
            </button>
            <button
              onClick={() => navigate('/inspections')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all flex items-center space-x-1.5"
            >
              <ClipboardList className="w-4 h-4 text-teal-400" />
              <span>Digital Inspections</span>
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all flex items-center space-x-1.5"
            >
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Industrial Sites"
          value={summary?.totalSites || 0}
          subtitle="Monitored Facilities"
          icon={Factory}
          color="blue"
          onClick={() => navigate('/sites')}
        />
        <StatCard
          title="Total Audits"
          value={summary?.totalAudits || 0}
          subtitle={`${summary?.scheduledAudits || 0} Scheduled / ${summary?.completedAudits || 0} Done`}
          icon={ClipboardList}
          color="teal"
          onClick={() => navigate('/audits')}
        />
        <StatCard
          title="Open Findings"
          value={summary?.openFindings || 0}
          subtitle={`${summary?.criticalFindings || 0} Critical / Urgent`}
          icon={AlertTriangle}
          color="amber"
          onClick={() => navigate('/findings')}
        />
        <StatCard
          title="Pending CAPA"
          value={summary?.pendingCapa || 0}
          subtitle={`${summary?.overdueCapa || 0} Overdue Items`}
          icon={ShieldCheck}
          color={summary?.overdueCapa > 0 ? 'rose' : 'purple'}
          onClick={() => navigate('/capa')}
        />
        <StatCard
          title="Compliance Score"
          value={`${compliance}%`}
          subtitle={complianceRating}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Statutory Reports"
          value={summary?.totalReports || 0}
          subtitle="Compiled Audits"
          icon={FileText}
          color="blue"
          onClick={() => navigate('/reports')}
        />
      </div>

      {/* Main Charts Row 1: Site Compliance & Audit Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance by Facility Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Compliance Index by Industrial Facility</h3>
              <p className="text-xs text-slate-500">Calculated from verified checklist audits & non-conformances</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Benchmark: 85% Target
            </span>
          </div>
          <div className="h-64">
            {analytics?.complianceBySite?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.complianceBySite}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="siteCode" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(val, name, item) => [`${val}% Compliance`, item.payload.siteName]}
                  />
                  <Bar dataKey="complianceScore" fill="#0f766e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No site data available to graph
              </div>
            )}
          </div>
        </div>

        {/* Audit Status Distribution Donut */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Audit Status Distribution</h3>
            <p className="text-xs text-slate-500">Current state of scheduled audits</p>
          </div>
          <div className="h-52 my-2">
            {analytics?.auditStatusDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.auditStatusDistribution}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {analytics.auditStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No audits logged
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-center pt-2 border-t border-slate-100">
            {analytics?.auditStatusDistribution?.map((item, idx) => (
              <div key={item.name} className="flex items-center space-x-1.5 text-[11px] text-slate-600">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Charts Row 2: Monthly Trends & Findings by Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Audit & Finding Trends (6 Months)</h3>
              <p className="text-xs text-slate-500">Audits conducted vs non-conformances identified and CAPA closed</p>
            </div>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="h-64">
            {analytics?.trendData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorAudits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorFindings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="audits" name="Audits Conducted" stroke="#0f766e" fillOpacity={1} fill="url(#colorAudits)" strokeWidth={2} />
                  <Area type="monotone" dataKey="findings" name="Findings Raised" stroke="#f59e0b" fillOpacity={1} fill="url(#colorFindings)" strokeWidth={2} />
                  <Area type="monotone" dataKey="closedCapa" name="CAPA Closed" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No monthly data recorded
              </div>
            )}
          </div>
        </div>

        {/* Findings by Severity Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Findings by Severity</h3>
            <p className="text-xs text-slate-500">Non-conformances categorized by environmental risk</p>
          </div>
          <div className="h-56 my-2">
            {analytics?.findingsBySeverity?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.findingsBySeverity}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="severity" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {analytics.findingsBySeverity.map((entry) => (
                      <Cell
                        key={entry.severity}
                        fill={SEVERITY_COLORS[entry.severity] || '#3b82f6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No active findings logged
              </div>
            )}
          </div>
          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-[11px] text-amber-900 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Critical & High findings require immediate CAPA assignment within 48h.</span>
          </div>
        </div>
      </div>

      {/* Recent Audits and Findings Table Quick View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Audits */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Recent Audits</h3>
            <Link to="/audits" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1">
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {analytics?.recentAudits?.length > 0 ? (
              analytics.recentAudits.map((a) => (
                <div
                  key={a._id}
                  onClick={() => navigate(`/audits/${a._id}`)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 rounded-xl px-2 cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-bold text-slate-900 truncate">{a.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {a.site?.name} • {new Date(a.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge status={a.status} />
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No audits found.</p>
            )}
          </div>
        </div>

        {/* Recent Findings */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Recent Environmental Findings</h3>
            <Link to="/findings" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1">
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {analytics?.recentFindings?.length > 0 ? (
              analytics.recentFindings.map((f) => (
                <div
                  key={f._id}
                  onClick={() => navigate(`/findings/${f._id}`)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 rounded-xl px-2 cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-bold text-slate-900 truncate">{f.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {f.findingCode} • {f.category}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge status={f.severity} />
                    <Badge status={f.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No findings found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { reportAPI, siteAPI, auditAPI } from '../../services/api';

export default function ReportGenerateModal({
  isOpen,
  onClose,
  defaultSiteId,
  defaultAuditId,
  onReportCreated
}) {
  const [formData, setFormData] = useState({
    title: '',
    reportType: 'Environmental Audit Report',
    siteId: '',
    auditId: '',
    executiveSummary: '',
    recommendations: '',
    periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    periodEnd: new Date().toISOString().split('T')[0]
  });

  const [sites, setSites] = useState([]);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [sRes, aRes] = await Promise.all([
          siteAPI.getSites({ limit: 100 }),
          auditAPI.getAudits({ limit: 100 })
        ]);
        setSites(sRes.data.data);
        setAudits(aRes.data.data);

        if (defaultSiteId) {
          setFormData((prev) => ({ ...prev, siteId: defaultSiteId }));
        } else if (sRes.data.data.length > 0) {
          setFormData((prev) => ({ ...prev, siteId: sRes.data.data[0]._id }));
        }

        if (defaultAuditId) {
          setFormData((prev) => ({ ...prev, auditId: defaultAuditId }));
        }
      } catch (err) {
        console.error('Error fetching report form options:', err);
      }
    };

    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen, defaultSiteId, defaultAuditId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await reportAPI.generateReport(formData);
      if (onReportCreated) onReportCreated(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error compiling statutory compliance report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compile Compliance / Statutory Report"
      subtitle="Synthesize stored inspections, checklist scores, non-conformances, and generate official PDF document"
      maxWidth="max-w-2xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Compiling PDF...' : 'Generate & Export PDF'}
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700">Report Document Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Leave blank for automatic standardized title or specify custom title..."
            className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Report Classification *</label>
            <select
              name="reportType"
              value={formData.reportType}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="Environmental Audit Report">Environmental Audit Report</option>
              <option value="Inspection Report">Inspection Report</option>
              <option value="Compliance Summary">Compliance Summary</option>
              <option value="CAPA Status Report">CAPA Status Report</option>
              <option value="Site Compliance Report">Site Compliance Report</option>
              <option value="Periodic Compliance Report">Periodic Compliance Report</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Industrial Facility / Site *</label>
            <select
              name="siteId"
              required
              value={formData.siteId}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="">Select target facility...</option>
              {sites.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.siteCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Link to Executed Audit (Recommended for Scorecard & Findings Data)
          </label>
          <select
            name="auditId"
            value={formData.auditId}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
          >
            <option value="">Optional: Link executed audit...</option>
            {audits
              .filter((a) => !formData.siteId || a.site?._id === formData.siteId || a.site === formData.siteId)
              .map((a) => (
                <option key={a._id} value={a._id}>
                  {a.auditCode} - {a.title} ({a.status})
                </option>
              ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Audit Period Start</label>
            <input
              type="date"
              name="periodStart"
              value={formData.periodStart}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Audit Period End</label>
            <input
              type="date"
              name="periodEnd"
              value={formData.periodEnd}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Executive Summary</label>
          <textarea
            name="executiveSummary"
            rows={2}
            value={formData.executiveSummary}
            onChange={handleChange}
            placeholder="High-level overview of inspection observations, compliance adherence, and facility performance..."
            className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Auditor Recommendations</label>
          <textarea
            name="recommendations"
            rows={2}
            value={formData.recommendations}
            onChange={handleChange}
            placeholder="Key recommendations for site management prior to regulatory authority review..."
            className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>
      </form>
    </Modal>
  );
}

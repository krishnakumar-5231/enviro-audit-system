import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { findingAPI, auditAPI, siteAPI } from '../../services/api';

export default function FindingModal({
  isOpen,
  onClose,
  findingToEdit,
  defaultAuditId,
  defaultInspectionId,
  defaultSiteId,
  defaultQuestionId,
  defaultQuestionText,
  defaultCategory,
  defaultSeverity,
  defaultRequirementReference,
  defaultDescription,
  onSaved
}) {
  const [formData, setFormData] = useState({
    audit: '',
    site: '',
    inspection: '',
    checklistQuestionId: '',
    checklistItemQuestion: '',
    title: '',
    description: '',
    category: 'Air Quality & Emissions',
    severity: 'Medium',
    priority: 'Medium',
    requirementReference: ''
  });

  const [audits, setAudits] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAuditsAndSites = async () => {
      try {
        const [aRes, sRes] = await Promise.all([
          auditAPI.getAudits({ limit: 100 }),
          siteAPI.getSites({ limit: 100 })
        ]);
        setAudits(aRes.data.data);
        setSites(sRes.data.data);
      } catch (err) {
        console.error('Error fetching modal options:', err);
      }
    };
    if (isOpen) {
      fetchAuditsAndSites();
    }
  }, [isOpen]);

  useEffect(() => {
    if (findingToEdit) {
      setFormData({
        audit: findingToEdit.audit?._id || findingToEdit.audit || '',
        site: findingToEdit.site?._id || findingToEdit.site || '',
        inspection: findingToEdit.inspection?._id || findingToEdit.inspection || '',
        checklistQuestionId: findingToEdit.checklistQuestionId || '',
        checklistItemQuestion: findingToEdit.checklistItemQuestion || '',
        title: findingToEdit.title || '',
        description: findingToEdit.description || '',
        category: findingToEdit.category || 'General Environmental',
        severity: findingToEdit.severity || 'Medium',
        priority: findingToEdit.priority || 'Medium',
        requirementReference: findingToEdit.requirementReference || ''
      });
    } else {
      setFormData({
        audit: defaultAuditId || '',
        site: defaultSiteId || '',
        inspection: defaultInspectionId || '',
        checklistQuestionId: defaultQuestionId || '',
        checklistItemQuestion: defaultQuestionText || '',
        title: defaultQuestionText ? `Non-conformance: ${defaultQuestionText.substring(0, 50)}...` : '',
        description: defaultDescription || '',
        category: defaultCategory || 'General Environmental',
        severity: defaultSeverity || 'Medium',
        priority: 'High',
        requirementReference: defaultRequirementReference || ''
      });
    }
    setError('');
  }, [isOpen, findingToEdit, defaultAuditId, defaultSiteId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (findingToEdit) {
        await findingAPI.updateFinding(findingToEdit._id, formData);
      } else {
        await findingAPI.createFinding(formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving environmental finding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={findingToEdit ? 'Edit Environmental Finding' : 'Record Non-Conformance Finding'}
      subtitle="Log physical non-compliance, statutory violations, or environmental risks"
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
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : findingToEdit ? 'Update Finding' : 'Create Finding'}
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700">Finding Title *</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Cracked secondary containment berm in chemical drum area B"
            className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Associated Facility / Site *</label>
            <select
              name="site"
              required
              value={formData.site}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="">Select facility...</option>
              {sites.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.siteCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Associated Audit *</label>
            <select
              name="audit"
              required
              value={formData.audit}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="">Select audit...</option>
              {audits.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.auditCode} - {a.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Environmental Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="Air Quality & Emissions">Air Quality & Emissions</option>
              <option value="Effluent & Wastewater Treatment">Effluent & Wastewater Treatment</option>
              <option value="Hazardous Waste Management">Hazardous Waste Management</option>
              <option value="Spill Prevention & Control">Spill Prevention & Control</option>
              <option value="Statutory Permitting & Documentation">Statutory Permitting</option>
              <option value="General Environmental">General Environmental</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Risk Severity *</label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="Critical">Critical (Immediate Hazard)</option>
              <option value="High">High Severity</option>
              <option value="Medium">Medium Severity</option>
              <option value="Low">Low / Minor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Action Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="Urgent">Urgent (24-48 Hours)</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Statutory / Regulatory Reference</label>
          <input
            type="text"
            name="requirementReference"
            value={formData.requirementReference}
            onChange={handleChange}
            placeholder="e.g. 40 CFR 264.175 Secondary Containment Regulations"
            className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Factual Finding Description *</label>
          <textarea
            name="description"
            rows={3}
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the exact location, condition observed, sensor readings, and potential environmental hazard..."
            className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>
      </form>
    </Modal>
  );
}

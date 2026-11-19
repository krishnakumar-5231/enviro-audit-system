import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { auditAPI, siteAPI, userAPI, checklistAPI } from '../../services/api';

export default function AuditModal({ isOpen, onClose, auditToEdit, onSaved }) {
  const [formData, setFormData] = useState({
    title: '',
    site: '',
    auditType: 'Internal Environmental Audit',
    leadAuditor: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scope: '',
    objectives: '',
    priority: 'High',
    checklist: '',
    description: ''
  });

  const [sites, setSites] = useState([]);
  const [auditors, setAuditors] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [sitesRes, usersRes, checkRes] = await Promise.all([
          siteAPI.getSites({ limit: 100, status: 'Active' }),
          userAPI.getUsers({ limit: 100 }),
          checklistAPI.getChecklists({ limit: 100, status: 'Active' })
        ]);
        setSites(sitesRes.data.data);
        setAuditors(usersRes.data.data.filter((u) => u.role === 'Environmental Auditor' || u.role === 'Administrator'));
        setChecklists(checkRes.data.data);

        // Pre-select first site/checklist/auditor if not editing
        if (!auditToEdit && sitesRes.data.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            site: sitesRes.data.data[0]._id,
            checklist: checkRes.data.data[0]?._id || '',
            leadAuditor: usersRes.data.data.find((u) => u.role === 'Environmental Auditor')?._id || ''
          }));
        }
      } catch (err) {
        console.error('Error fetching audit form options:', err);
      }
    };

    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (auditToEdit) {
      setFormData({
        title: auditToEdit.title || '',
        site: auditToEdit.site?._id || auditToEdit.site || '',
        auditType: auditToEdit.auditType || 'Internal Environmental Audit',
        leadAuditor: auditToEdit.leadAuditor?._id || auditToEdit.leadAuditor || '',
        scheduledDate: auditToEdit.scheduledDate ? new Date(auditToEdit.scheduledDate).toISOString().split('T')[0] : '',
        scope: auditToEdit.scope || '',
        objectives: auditToEdit.objectives || '',
        priority: auditToEdit.priority || 'High',
        checklist: auditToEdit.checklist?._id || auditToEdit.checklist || '',
        description: auditToEdit.description || ''
      });
    }
    setError('');
  }, [auditToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (auditToEdit) {
        await auditAPI.updateAudit(auditToEdit._id, formData);
      } else {
        await auditAPI.createAudit(formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving environmental audit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={auditToEdit ? 'Modify Environmental Audit' : 'Schedule New Environmental Audit'}
      subtitle="Define audit parameters, facility scope, and assign lead auditor"
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
            {loading ? 'Saving...' : auditToEdit ? 'Save Changes' : 'Schedule Audit'}
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
          <label className="block text-xs font-semibold text-slate-700">Audit Title *</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Q2 Air Emissions & Wastewater Discharge Compliance Audit"
            className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Target Facility / Site *</label>
            <select
              name="site"
              required
              value={formData.site}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="">Select an industrial site...</option>
              {sites.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.siteCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Audit Type *</label>
            <select
              name="auditType"
              value={formData.auditType}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="Internal Environmental Audit">Internal Environmental Audit</option>
              <option value="Compliance Audit">Compliance Audit</option>
              <option value="Site Inspection">Site Inspection</option>
              <option value="Periodic Audit">Periodic Audit</option>
              <option value="Follow-up Audit">Follow-up Audit</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Lead Auditor *</label>
            <select
              name="leadAuditor"
              required
              value={formData.leadAuditor}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="">Assign auditor...</option>
              {auditors.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Scheduled Date *</label>
            <input
              type="date"
              name="scheduledDate"
              required
              value={formData.scheduledDate}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Priority Level</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="Critical">Critical (Immediate)</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Audit Checklist Template *</label>
          <select
            name="checklist"
            required
            value={formData.checklist}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
          >
            <option value="">Select inspection checklist template...</option>
            {checklists.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title} (v{c.version}) - {c.questions?.length || 0} Questions
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Audit Scope & Focus Areas</label>
          <textarea
            name="scope"
            rows={2}
            value={formData.scope}
            onChange={handleChange}
            placeholder="e.g. Flare monitoring stations, continuous effluent monitors, RCRA hazardous waste containment."
            className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Objectives & Regulatory Standards</label>
          <textarea
            name="objectives"
            rows={2}
            value={formData.objectives}
            onChange={handleChange}
            placeholder="e.g. Validate adherence with Clean Air Act Title V permits and Clean Water Act NPDES discharge parameters."
            className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>
      </form>
    </Modal>
  );
}

import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { capaAPI, userAPI, siteAPI, auditAPI, findingAPI } from '../../services/api';

export default function CapaModal({
  isOpen,
  onClose,
  capaToEdit,
  defaultFindingId,
  defaultAuditId,
  defaultSiteId,
  defaultActionTitle,
  defaultProblemStatement,
  onSaved
}) {
  const [formData, setFormData] = useState({
    finding: '',
    audit: '',
    site: '',
    actionTitle: '',
    problemStatement: '',
    rootCause: '',
    correctiveAction: '',
    preventiveAction: '',
    responsiblePerson: '',
    assignedDepartment: 'Plant EHS & Maintenance',
    priority: 'High',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userAPI.getUsers({ limit: 100 });
        setUsers(res.data.data);
      } catch (err) {
        console.error('Error fetching users for CAPA assignment:', err);
      }
    };
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (capaToEdit) {
      setFormData({
        finding: capaToEdit.finding?._id || capaToEdit.finding || '',
        audit: capaToEdit.audit?._id || capaToEdit.audit || '',
        site: capaToEdit.site?._id || capaToEdit.site || '',
        actionTitle: capaToEdit.actionTitle || '',
        problemStatement: capaToEdit.problemStatement || '',
        rootCause: capaToEdit.rootCause || '',
        correctiveAction: capaToEdit.correctiveAction || '',
        preventiveAction: capaToEdit.preventiveAction || '',
        responsiblePerson: capaToEdit.responsiblePerson?._id || capaToEdit.responsiblePerson || '',
        assignedDepartment: capaToEdit.assignedDepartment || 'Plant EHS & Maintenance',
        priority: capaToEdit.priority || 'High',
        dueDate: capaToEdit.dueDate ? new Date(capaToEdit.dueDate).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({
        finding: defaultFindingId || '',
        audit: defaultAuditId || '',
        site: defaultSiteId || '',
        actionTitle: defaultActionTitle || '',
        problemStatement: defaultProblemStatement || '',
        rootCause: '',
        correctiveAction: '',
        preventiveAction: '',
        responsiblePerson: '',
        assignedDepartment: 'Plant EHS & Maintenance',
        priority: 'High',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    setError('');
  }, [isOpen, capaToEdit, defaultFindingId, defaultActionTitle, defaultProblemStatement]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (capaToEdit) {
        await capaAPI.updateCapa(capaToEdit._id, formData);
      } else {
        await capaAPI.createCapa(formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving CAPA action.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={capaToEdit ? 'Modify CAPA Action Plan' : 'Establish Corrective & Preventive Action (CAPA)'}
      subtitle="Designate root cause analysis, immediate corrective containment, and systemic preventive measures"
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
            {loading ? 'Saving...' : capaToEdit ? 'Update CAPA' : 'Assign CAPA'}
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
          <label className="block text-xs font-semibold text-slate-700">CAPA Action Title *</label>
          <input
            type="text"
            name="actionTitle"
            required
            value={formData.actionTitle}
            onChange={handleChange}
            placeholder="e.g. Structural Resurfacing & Polyurea Sealing of Secondary Containment Berm B"
            className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Problem Statement *</label>
          <textarea
            name="problemStatement"
            rows={2}
            required
            value={formData.problemStatement}
            onChange={handleChange}
            placeholder="Factual statement of non-compliance or environmental deficiency observed..."
            className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Responsible Person *</label>
            <select
              name="responsiblePerson"
              required
              value={formData.responsiblePerson}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="">Assign responsible user...</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Department</label>
            <input
              type="text"
              name="assignedDepartment"
              value={formData.assignedDepartment}
              onChange={handleChange}
              placeholder="e.g. Operations / Maintenance"
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Completion Due Date *</label>
            <input
              type="date"
              name="dueDate"
              required
              value={formData.dueDate}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Priority Level</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="Urgent">Urgent (Immediate SLA)</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Root Cause Analysis</label>
          <textarea
            name="rootCause"
            rows={2}
            value={formData.rootCause}
            onChange={handleChange}
            placeholder="Underlying systemic or operational failure (e.g. vibration, lack of preventive calibration, training deficit)..."
            className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Immediate Corrective Action</label>
            <textarea
              name="correctiveAction"
              rows={2}
              value={formData.correctiveAction}
              onChange={handleChange}
              placeholder="Immediate remediation or physical repairs deployed..."
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Long-Term Preventive Action</label>
            <textarea
              name="preventiveAction"
              rows={2}
              value={formData.preventiveAction}
              onChange={handleChange}
              placeholder="Policy modification, SOP updates, or engineering barriers installed..."
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

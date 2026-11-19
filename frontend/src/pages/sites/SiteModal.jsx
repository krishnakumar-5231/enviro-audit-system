import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { siteAPI } from '../../services/api';

export default function SiteModal({ isOpen, onClose, siteToEdit, onSaved }) {
  const [formData, setFormData] = useState({
    siteCode: '',
    name: '',
    industryType: 'Petrochemical Refining',
    location: '',
    address: '',
    city: '',
    state: '',
    country: 'United States',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    status: 'Active',
    environmentalClearanceNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (siteToEdit) {
      setFormData({
        siteCode: siteToEdit.siteCode || '',
        name: siteToEdit.name || '',
        industryType: siteToEdit.industryType || 'Petrochemical Refining',
        location: siteToEdit.location || '',
        address: siteToEdit.address || '',
        city: siteToEdit.city || '',
        state: siteToEdit.state || '',
        country: siteToEdit.country || 'United States',
        contactPerson: siteToEdit.contactPerson || '',
        contactEmail: siteToEdit.contactEmail || '',
        contactPhone: siteToEdit.contactPhone || '',
        status: siteToEdit.status || 'Active',
        environmentalClearanceNumber: siteToEdit.environmentalClearanceNumber || ''
      });
    } else {
      setFormData({
        siteCode: '',
        name: '',
        industryType: 'Petrochemical Refining',
        location: '',
        address: '',
        city: '',
        state: '',
        country: 'United States',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        status: 'Active',
        environmentalClearanceNumber: ''
      });
    }
    setError('');
  }, [siteToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (siteToEdit) {
        await siteAPI.updateSite(siteToEdit._id, formData);
      } else {
        await siteAPI.createSite(formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving industrial site.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={siteToEdit ? 'Edit Industrial Site' : 'Register New Industrial Site'}
      subtitle="Establish site compliance profile and operational boundaries"
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
            {loading ? 'Saving...' : siteToEdit ? 'Update Site' : 'Create Site'}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Site Code *</label>
            <input
              type="text"
              name="siteCode"
              required
              disabled={!!siteToEdit}
              value={formData.siteCode}
              onChange={handleChange}
              placeholder="e.g. APEX-TX-01"
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 uppercase focus:bg-white focus:outline-none focus:border-teal-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Facility / Site Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Apex Petrochemical Complex"
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Industry Classification *</label>
            <select
              name="industryType"
              value={formData.industryType}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="Petrochemical Refining">Petrochemical Refining</option>
              <option value="Metallurgical & Heavy Manufacturing">Metallurgical & Heavy Manufacturing</option>
              <option value="Pharmaceuticals & Fine Chemicals">Pharmaceuticals & Fine Chemicals</option>
              <option value="Agricultural Chemicals & Fertilizers">Agricultural Chemicals & Fertilizers</option>
              <option value="Food Processing & Agribusiness">Food Processing & Agribusiness</option>
              <option value="Energy & Thermal Utilities">Energy & Thermal Utilities</option>
              <option value="Automotive & Aerospace Assembly">Automotive & Aerospace Assembly</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="Active">Active Operational</option>
              <option value="Inactive">Inactive / Suspended</option>
              <option value="Under Renovation">Under Renovation</option>
              <option value="Decommissioned">Decommissioned</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Location / Geographic Zone *</label>
          <input
            type="text"
            name="location"
            required
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Houston Ship Channel Industrial Basin"
            className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-700">Address *</label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address"
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">City *</label>
            <input
              type="text"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">State / Region *</label>
            <input
              type="text"
              name="state"
              required
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Contact Person *</label>
            <input
              type="text"
              name="contactPerson"
              required
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="Site Lead Name"
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Contact Email *</label>
            <input
              type="email"
              name="contactEmail"
              required
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="lead@site.com"
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Contact Phone *</label>
            <input
              type="text"
              name="contactPhone"
              required
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Environmental Clearance / Regulatory Permit Reference
          </label>
          <input
            type="text"
            name="environmentalClearanceNumber"
            value={formData.environmentalClearanceNumber}
            onChange={handleChange}
            placeholder="e.g. EPA-TX-R6-882910 / State Permit"
            className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>
      </form>
    </Modal>
  );
}

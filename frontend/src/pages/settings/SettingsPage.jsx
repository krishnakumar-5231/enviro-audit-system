import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle } from 'lucide-react';
import { settingAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    organizationName: '',
    highComplianceThreshold: 85,
    moderateComplianceThreshold: 70,
    capaOverdueGracePeriodDays: 3,
    enableAutoAuditNotifications: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingAPI.getSettings();
        if (res.data.success) {
          setSettings((prev) => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await settingAPI.updateSettings(settings);
      setMessage('System settings saved successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><LoadingSpinner /></div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">System Configuration</h2>
        <p className="text-xs text-slate-500 mt-1">Configure global compliance thresholds, organization details, and notification rules.</p>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Organization / Enterprise Name</label>
          <input
            type="text"
            value={settings.organizationName}
            onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">High Compliance Threshold (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.highComplianceThreshold}
              onChange={(e) => setSettings({ ...settings, highComplianceThreshold: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Audits scoring above this percentage are flagged compliant.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Moderate Compliance Threshold (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.moderateComplianceThreshold}
              onChange={(e) => setSettings({ ...settings, moderateComplianceThreshold: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Audits below this percentage trigger non-compliance warnings.</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">CAPA Overdue Warning Grace Period (Days)</label>
          <input
            type="number"
            min="1"
            max="30"
            value={settings.capaOverdueGracePeriodDays}
            onChange={(e) => setSettings({ ...settings, capaOverdueGracePeriodDays: Number(e.target.value) })}
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">Days before a CAPA target date when warning notices trigger.</p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="notifs"
            checked={settings.enableAutoAuditNotifications}
            onChange={(e) => setSettings({ ...settings, enableAutoAuditNotifications: e.target.checked })}
            className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
          />
          <label htmlFor="notifs" className="text-xs font-medium text-slate-700 cursor-pointer">
            Enable automatic audit lifecycle notifications
          </label>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

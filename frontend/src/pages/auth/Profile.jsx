import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Phone, Building, CheckCircle2 } from 'lucide-react';
import Badge from '../../components/common/Badge';

export default function Profile() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center text-3xl font-bold shadow-md shadow-teal-500/20">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{user?.name}</h2>
              <Badge status="Active" />
            </div>
            <p className="text-sm font-semibold text-teal-700 mt-1">{user?.role}</p>
            <p className="text-xs text-slate-500 mt-0.5">{user?.department || 'Environmental Health & Safety'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <Mail className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-[11px] font-medium text-slate-500">Email Address</p>
              <p className="text-xs font-semibold text-slate-800">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <Phone className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-[11px] font-medium text-slate-500">Contact Number</p>
              <p className="text-xs font-semibold text-slate-800">{user?.phone || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <Shield className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-[11px] font-medium text-slate-500">Role Permissions</p>
              <p className="text-xs font-semibold text-slate-800">{user?.role} Access Level</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <Building className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-[11px] font-medium text-slate-500">Department</p>
              <p className="text-xs font-semibold text-slate-800">{user?.department || 'EHS'}</p>
            </div>
          </div>
        </div>

        {user?.assignedSites?.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Assigned Industrial Facilities ({user.assignedSites.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {user.assignedSites.map((s) => (
                <span
                  key={s._id || s}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold"
                >
                  {s.name || s.siteCode || s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

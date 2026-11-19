import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname === '/') return 'Environmental Compliance Dashboard';
    if (pathname.startsWith('/sites')) return 'Industrial Sites Management';
    if (pathname.startsWith('/audits')) return 'Environmental Audits';
    if (pathname.startsWith('/inspections')) return 'Digital Inspections';
    if (pathname.startsWith('/findings')) return 'Findings & Non-Conformances';
    if (pathname.startsWith('/capa')) return 'CAPA Management & Verification';
    if (pathname.startsWith('/checklists')) return 'Compliance Checklist Templates';
    if (pathname.startsWith('/reports')) return 'Statutory & Compliance Reports';
    if (pathname.startsWith('/notifications')) return 'Notification Center';
    if (pathname.startsWith('/audit-trail')) return 'System Audit Trail & Traceability';
    if (pathname.startsWith('/users')) return 'User & Access Control';
    if (pathname.startsWith('/settings')) return 'System Configuration';
    if (pathname.startsWith('/profile')) return 'User Profile';
    return 'Environmental Audit Management';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          title={getPageTitle(location.pathname)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

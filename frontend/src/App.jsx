import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AppLayout from './components/layout/AppLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/auth/Profile';

// Application Pages
import Dashboard from './pages/dashboard/Dashboard';
import SiteList from './pages/sites/SiteList';
import SiteDetails from './pages/sites/SiteDetails';
import AuditList from './pages/audits/AuditList';
import AuditDetails from './pages/audits/AuditDetails';
import InspectionList from './pages/inspections/InspectionList';
import InspectionExecution from './pages/inspections/InspectionExecution';
import FindingsList from './pages/findings/FindingsList';
import FindingDetails from './pages/findings/FindingDetails';
import CapaList from './pages/capa/CapaList';
import CapaDetails from './pages/capa/CapaDetails';
import ChecklistList from './pages/checklists/ChecklistList';
import ChecklistBuilder from './pages/checklists/ChecklistBuilder';
import ChecklistDetails from './pages/checklists/ChecklistDetails';
import ReportList from './pages/reports/ReportList';
import ReportDetails from './pages/reports/ReportDetails';
import NotificationCenter from './pages/notifications/NotificationCenter';
import AuditTrail from './pages/auditTrail/AuditTrail';
import UserList from './pages/users/UserList';
import SettingsPage from './pages/settings/SettingsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Authenticated Layout Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />

              {/* Sites */}
              <Route path="sites" element={<SiteList />} />
              <Route path="sites/:id" element={<SiteDetails />} />

              {/* Audits */}
              <Route path="audits" element={<AuditList />} />
              <Route path="audits/:id" element={<AuditDetails />} />

              {/* Inspections */}
              <Route path="inspections" element={<InspectionList />} />
              <Route path="inspections/:id/execute" element={<InspectionExecution />} />

              {/* Findings */}
              <Route path="findings" element={<FindingsList />} />
              <Route path="findings/:id" element={<FindingDetails />} />

              {/* CAPA */}
              <Route path="capa" element={<CapaList />} />
              <Route path="capa/:id" element={<CapaDetails />} />

              {/* Checklists */}
              <Route path="checklists" element={<ChecklistList />} />
              <Route path="checklists/builder" element={<ChecklistBuilder />} />
              <Route path="checklists/:id" element={<ChecklistDetails />} />

              {/* Reports */}
              <Route path="reports" element={<ReportList />} />
              <Route path="reports/:id" element={<ReportDetails />} />

              {/* Notifications */}
              <Route path="notifications" element={<NotificationCenter />} />

              {/* Administration & Audit Trail */}
              <Route path="audit-trail" element={<AuditTrail />} />
              <Route path="users" element={<UserList />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

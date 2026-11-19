import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Factory,
  ClipboardList,
  CheckSquare,
  AlertTriangle,
  ShieldCheck,
  FileText,
  ListTodo,
  Bell,
  History,
  Users,
  Settings,
  LogOut,
  Leaf,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, hasRole } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Sites', href: '/sites', icon: Factory },
    { name: 'Audits', href: '/audits', icon: ClipboardList },
    { name: 'Inspections', href: '/inspections', icon: CheckSquare },
    { name: 'Findings', href: '/findings', icon: AlertTriangle },
    { name: 'CAPA Management', href: '/capa', icon: ShieldCheck },
    { name: 'Checklists', href: '/checklists', icon: ListTodo },
    { name: 'Reports', href: '/reports', icon: FileText },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null
    },
    // Admin / Compliance Officer restricted
    ...(hasRole('Administrator', 'Compliance Officer')
      ? [{ name: 'Audit Trail', href: '/audit-trail', icon: History }]
      : []),
    // Admin restricted
    ...(hasRole('Administrator')
      ? [
          { name: 'Users', href: '/users', icon: Users },
          { name: 'Settings', href: '/settings', icon: Settings }
        ]
      : [])
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20">
              <Leaf className="w-5 h-5 fill-slate-950 text-slate-950" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">CEAMS</span>
              <span className="block text-[10px] uppercase tracking-wider text-teal-400 font-semibold">
                Environmental Audit
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Main Operations
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => onClose && onClose()}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-teal-600/90 text-white shadow-sm shadow-teal-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-400 text-slate-950 rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Current User Card */}
        {user && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/40">
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-teal-900 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-xs flex-shrink-0">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-teal-400 font-medium truncate">{user.role}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </div>

            <button
              onClick={logout}
              className="mt-2 w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

import React, { useState } from 'react';
import { Menu, Bell, Search, User, Shield, LogOut, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ onMenuToggle, title = 'Environmental Management' }) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
        </div>
      </div>

      {/* Right: Search, Notifications & User Dropdown */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Global Quick Action / Search */}
        <div className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search audits, sites, CAPA..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                navigate(`/audits?search=${encodeURIComponent(e.target.value.trim())}`);
              }
            }}
            className="w-56 lg:w-72 pl-9 pr-4 py-1.5 text-xs bg-slate-100/80 border border-transparent rounded-xl focus:bg-white focus:border-teal-500 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-100 text-teal-800 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications at this time
                  </div>
                ) : (
                  notifications.slice(0, 6).map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => markAsRead(notif._id)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                        !notif.read ? 'bg-teal-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-xs font-semibold text-slate-900">{notif.title}</p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  View Notification Center →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="hidden sm:block text-xs font-semibold text-slate-800">
              {user?.name?.split(' ')[0]}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3.5 border-b border-slate-100 bg-slate-50/60">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-teal-600 font-semibold">{user?.role}</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email}</p>
              </div>

              <div className="p-1">
                <Link
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </Link>
                {user?.role === 'Administrator' && (
                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span>System Settings</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-rose-600 rounded-xl hover:bg-rose-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

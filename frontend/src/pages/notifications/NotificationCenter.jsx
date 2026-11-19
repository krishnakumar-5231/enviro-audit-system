import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  ShieldCheck,
  Check,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import EmptyState from '../../components/common/EmptyState';

export default function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'AUDIT_ASSIGNED':
      case 'AUDIT_APPROACHING':
      case 'AUDIT_OVERDUE':
        return <ClipboardList className="w-5 h-5 text-blue-600" />;
      case 'FINDING_CREATED':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'CAPA_ASSIGNED':
      case 'CAPA_SUBMITTED':
      case 'CAPA_VERIFIED':
      case 'CAPA_REJECTED':
      case 'CAPA_OVERDUE':
        return <ShieldCheck className="w-5 h-5 text-teal-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleClick = (notif) => {
    markAsRead(notif._id);
    if (notif.relatedEntity === 'Audit' && notif.entityId) {
      navigate(`/audits/${notif.entityId}`);
    } else if (notif.relatedEntity === 'Finding' && notif.entityId) {
      navigate(`/findings/${notif.entityId}`);
    } else if (notif.relatedEntity === 'Capa' && notif.entityId) {
      navigate(`/capa/${notif.entityId}`);
    } else if (notif.relatedEntity === 'Report' && notif.entityId) {
      navigate(`/reports/${notif.entityId}`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Notification Center
            </h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time in-app alerts for scheduled audits, SLA deadlines, non-conformances, and CAPA verification actions.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm flex items-center space-x-1.5 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You are completely up to date with environmental alerts."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => handleClick(notif)}
              className={`p-4 sm:p-5 flex items-start space-x-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                !notif.read ? 'bg-teal-50/30' : ''
              }`}
            >
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex-shrink-0">
                {getNotificationIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {notif.title}
                    </h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                    {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                    {new Date(notif.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                {notif.relatedEntity && (
                  <div className="mt-2 flex items-center space-x-1 text-[11px] font-semibold text-teal-600">
                    <span>View {notif.relatedEntity}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

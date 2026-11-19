import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'teal',
  trend,
  onClick
}) {
  const colorThemes = {
    teal: {
      bg: 'bg-teal-50',
      text: 'text-teal-600',
      border: 'border-teal-100',
      ring: 'group-hover:ring-teal-500/20'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
      ring: 'group-hover:ring-blue-500/20'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
      ring: 'group-hover:ring-amber-500/20'
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100',
      ring: 'group-hover:ring-rose-500/20'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
      ring: 'group-hover:ring-purple-500/20'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      ring: 'group-hover:ring-emerald-500/20'
    }
  };

  const theme = colorThemes[color] || colorThemes.teal;

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {value}
            </span>
            {trend && (
              <span
                className={`text-xs font-medium ${
                  trend.positive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>

        {Icon && (
          <div
            className={`p-3 rounded-xl border ${theme.bg} ${theme.text} ${theme.border} transition-colors`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}

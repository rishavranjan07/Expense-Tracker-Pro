import React from 'react';

const StatCard = ({
  title,
  amount,
  subtitle,
  icon: Icon,
  variant = 'indigo',
  badgeText,
}) => {
  const variantStyles = {
    indigo: {
      border: 'hover:border-indigo-200',
      iconBg: 'bg-indigo-50 text-indigo-600',
      badgeBg: 'bg-indigo-100/70 text-indigo-700',
      glow: 'group-hover:shadow-indigo-500/10',
    },
    emerald: {
      border: 'hover:border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-600',
      badgeBg: 'bg-emerald-100/70 text-emerald-700',
      glow: 'group-hover:shadow-emerald-500/10',
    },
    rose: {
      border: 'hover:border-rose-200',
      iconBg: 'bg-rose-50 text-rose-600',
      badgeBg: 'bg-rose-100/70 text-rose-700',
      glow: 'group-hover:shadow-rose-500/10',
    },
    amber: {
      border: 'hover:border-amber-200',
      iconBg: 'bg-amber-50 text-amber-600',
      badgeBg: 'bg-amber-100/70 text-amber-700',
      glow: 'group-hover:shadow-amber-500/10',
    },
  };

  const style = variantStyles[variant] || variantStyles.indigo;

  return (
    <div
      className={`group relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 ${style.border} ${style.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {amount}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${style.iconBg} shadow-xs`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {badgeText && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Status</span>
          <span className={`px-2 py-0.5 rounded-full font-semibold ${style.badgeBg}`}>
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;

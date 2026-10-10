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
      border: 'hover:border-indigo-300 dark:hover:border-indigo-500/50',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
      badgeBg: 'bg-indigo-100/70 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300',
      glow: 'group-hover:shadow-indigo-500/10',
    },
    emerald: {
      border: 'hover:border-emerald-300 dark:hover:border-emerald-500/50',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-100/70 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
      glow: 'group-hover:shadow-emerald-500/10',
    },
    rose: {
      border: 'hover:border-rose-300 dark:hover:border-rose-500/50',
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
      badgeBg: 'bg-rose-100/70 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300',
      glow: 'group-hover:shadow-rose-500/10',
    },
    amber: {
      border: 'hover:border-amber-300 dark:hover:border-amber-500/50',
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-100/70 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
      glow: 'group-hover:shadow-amber-500/10',
    },
  };

  const style = variantStyles[variant] || variantStyles.indigo;

  return (
    <div
      className={`group relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-300 ${style.border} ${style.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 tracking-tight">
            {amount}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${style.iconBg} shadow-xs`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {badgeText && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${style.badgeBg}`}>
            {badgeText}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Updated live</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;

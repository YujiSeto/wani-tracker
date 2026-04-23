// Presentational card component — no state, safe to use anywhere.

interface DashboardCardProps {
  label: string;
  value: string | number;
  icon: string;
  accent?: 'pink' | 'blue' | 'purple' | 'gold' | 'green' | 'gray';
  description?: string;
}

const accentStyles = {
  pink: {
    border: 'border-pink-300/40 dark:border-pink-500/30',
    iconBg: 'bg-pink-50 dark:bg-pink-950/40',
    iconText: 'text-wk-pink',
    valueText: 'text-wk-pink',
  },
  blue: {
    border: 'border-sky-300/40 dark:border-sky-500/30',
    iconBg: 'bg-sky-50 dark:bg-sky-950/40',
    iconText: 'text-wk-blue',
    valueText: 'text-wk-blue',
  },
  purple: {
    border: 'border-purple-300/40 dark:border-purple-500/30',
    iconBg: 'bg-purple-50 dark:bg-purple-950/40',
    iconText: 'text-wk-purple',
    valueText: 'text-wk-purple',
  },
  gold: {
    border: 'border-yellow-300/40 dark:border-yellow-500/30',
    iconBg: 'bg-yellow-50 dark:bg-yellow-950/40',
    iconText: 'text-yellow-500',
    valueText: 'text-yellow-500',
  },
  green: {
    border: 'border-emerald-300/40 dark:border-emerald-500/30',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconText: 'text-emerald-500',
    valueText: 'text-emerald-600 dark:text-emerald-400',
  },
  gray: {
    border: 'border-gray-200/60 dark:border-gray-700/50',
    iconBg: 'bg-gray-50 dark:bg-gray-800/60',
    iconText: 'text-gray-400',
    valueText: 'text-gray-500 dark:text-gray-400',
  },
};

export function DashboardCard({
  label,
  value,
  icon,
  accent = 'pink',
  description,
}: DashboardCardProps) {
  const s = accentStyles[accent];

  return (
    <div
      className={`group relative rounded-2xl border ${s.border} bg-white dark:bg-gray-800/50 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-sm`}
    >
      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-xl ${s.iconBg} flex items-center justify-center text-xl mb-4 transition-transform duration-300 group-hover:scale-110`}
        aria-hidden="true"
      >
        <span className={s.iconText}>{icon}</span>
      </div>

      {/* Label */}
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
        {label}
      </p>

      {/* Value */}
      <p className={`text-3xl font-black leading-none ${s.valueText}`}>
        {value}
      </p>

      {/* Optional description */}
      {description && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 capitalize">
          {description}
        </p>
      )}
    </div>
  );
}

interface ProgressProps {
  value: number; // 0–100
  className?: string;
  showLabel?: boolean;
}

export function Progress({ value, className = '', showLabel = false }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const color =
    clamped >= 80 ? 'bg-emerald-500' :
    clamped >= 50 ? 'bg-brand-500'   :
                    'bg-amber-500';

  return (
    <div className={`space-y-1.5 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Profile Completion</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{clamped}%</span>
        </div>
      )}
      <div className="h-2 bg-slate-100 dark:bg-brand-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

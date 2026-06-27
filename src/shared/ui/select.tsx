import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className = '', children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={`w-full appearance-none px-3 py-2.5 pr-9 rounded-lg border border-slate-300 dark:border-brand-700 bg-white dark:bg-brand-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors ${className}`}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
  </div>
));
Select.displayName = 'Select';

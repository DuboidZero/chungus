import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { PerformanceTier, GuidanceCaseStatus } from '../../../api/entities/teacher';

export interface FilterState {
  search: string;
  batch: string;
  department: string;
  performanceTier: PerformanceTier | '';
  guidanceStatus: GuidanceCaseStatus | '';
  skill?: string;
  domain?: string;
  supportNeeded?: boolean;
}

interface Props {
  /** Called whenever any dropdown filter changes (real-time). */
  onFilterChange: (filters: FilterState) => void;
  /** 
   * Optional: called when the user explicitly submits a search (Enter key or search button).
   * If omitted, search triggers onFilterChange on every keystroke.
   */
  onSearch?: (query: string) => void;
  initialState?: FilterState;
}

export function SearchFilterBar({ onFilterChange, onSearch, initialState }: Props) {
  const [filters, setFilters] = useState<FilterState>(initialState || {
    search: '',
    batch: '',
    department: '',
    performanceTier: '',
    guidanceStatus: ''
  });

  // Sync when initialState changes (e.g. from URL)
  useEffect(() => {
    if (initialState) {
      setFilters(initialState);
    }
  }, [initialState]);

  const [isExpanded, setIsExpanded] = useState(false);

  const updateDropdownFilter = (key: keyof FilterState, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilterChange(next);
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    // If no explicit onSearch, stream changes immediately (for MyStudentsView)
    if (!onSearch) {
      onFilterChange({ ...filters, search: value });
    }
  };

  const handleSearchSubmit = () => {
    if (onSearch) {
      onSearch(filters.search);
    } else {
      onFilterChange({ ...filters });
    }
  };

  const clearFilters = () => {
    const cleared: FilterState = { search: '', batch: '', department: '', performanceTier: '', guidanceStatus: '' };
    setFilters(cleared);
    onFilterChange(cleared);
    if (onSearch) onSearch('');
  };

  const hasActiveFilters = filters.batch || filters.department || filters.performanceTier || filters.guidanceStatus;

  return (
    <div className="bg-white dark:bg-brand-900/40 rounded-lg border border-slate-200 dark:border-brand-800 p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student by Name or PRN..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-brand-950/50 border border-slate-200 dark:border-brand-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchSubmit();
            }}
          />
          {filters.search && (
            <button
              onClick={() => { handleSearchChange(''); if (onSearch) onSearch(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Explicit Search button (shown when onSearch is provided) */}
        {onSearch && (
          <button
            onClick={handleSearchSubmit}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white transition-colors"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
            hasActiveFilters || isExpanded 
              ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800'
              : 'bg-white dark:bg-transparent text-slate-600 dark:text-slate-400 border-slate-200 dark:border-brand-800 hover:bg-slate-50 dark:hover:bg-brand-900/20'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters ? <span className="w-2 h-2 rounded-full bg-brand-500 ml-1" /> : null}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-brand-800 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Batch</label>
            <select
              value={filters.batch}
              onChange={(e) => updateDropdownFilter('batch', e.target.value)}
              className="w-full p-2 text-sm bg-slate-50 dark:bg-brand-950/50 border border-slate-200 dark:border-brand-800 rounded text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
            >
              <option value="">All Batches</option>
              <option value="2022-2026">2022-2026</option>
              <option value="2023-2027">2023-2027</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Performance Tier</label>
            <select
              value={filters.performanceTier}
              onChange={(e) => updateDropdownFilter('performanceTier', e.target.value as PerformanceTier)}
              className="w-full p-2 text-sm bg-slate-50 dark:bg-brand-950/50 border border-slate-200 dark:border-brand-800 rounded text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
            >
              <option value="">All Tiers</option>
              <option value="High Performing">High Performing</option>
              <option value="Average - Guidable">Average - Guidable</option>
              <option value="Underperforming">Underperforming</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Guidance Status</label>
            <select
              value={filters.guidanceStatus}
              onChange={(e) => updateDropdownFilter('guidanceStatus', e.target.value as GuidanceCaseStatus)}
              className="w-full p-2 text-sm bg-slate-50 dark:bg-brand-950/50 border border-slate-200 dark:border-brand-800 rounded text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
            >
              <option value="">Any Status</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters && !filters.search}
              className="w-full py-2 px-4 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

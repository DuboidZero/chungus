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
    <div className="bg-white rounded-lg border border-outline-variant p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/70" />
          <input
            type="text"
            placeholder="Search student by Name or PRN..."
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchSubmit();
            }}
          />
          {filters.search && (
            <button
              onClick={() => { handleSearchChange(''); if (onSearch) onSearch(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 hover:text-on-surface"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Explicit Search button (shown when onSearch is provided) */}
        {onSearch && (
          <button
            onClick={handleSearchSubmit}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary-container hover:bg-primary text-white transition-colors"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
            hasActiveFilters || isExpanded 
              ? 'bg-surface-container-low text-primary border-outline-variant'
              : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters ? <span className="w-2 h-2 rounded-full bg-primary-container ml-1" /> : null}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-outline-variant/40 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">Batch</label>
            <select
              value={filters.batch}
              onChange={(e) => updateDropdownFilter('batch', e.target.value)}
              className="w-full p-2 text-sm bg-surface-container-low border border-outline-variant rounded text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="">All Batches</option>
              <option value="2022-2026">2022-2026</option>
              <option value="2023-2027">2023-2027</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">Performance Tier</label>
            <select
              value={filters.performanceTier}
              onChange={(e) => updateDropdownFilter('performanceTier', e.target.value as PerformanceTier)}
              className="w-full p-2 text-sm bg-surface-container-low border border-outline-variant rounded text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="">All Tiers</option>
              <option value="High Performing">High Performing</option>
              <option value="Average - Guidable">Average - Guidable</option>
              <option value="Underperforming">Underperforming</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">Guidance Status</label>
            <select
              value={filters.guidanceStatus}
              onChange={(e) => updateDropdownFilter('guidanceStatus', e.target.value as GuidanceCaseStatus)}
              className="w-full p-2 text-sm bg-surface-container-low border border-outline-variant rounded text-on-surface focus:outline-none focus:border-primary"
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
              className="w-full py-2 px-4 text-sm text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

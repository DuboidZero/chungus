import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface SortOption<T> {
  key: string;
  sortFn?: (a: T, b: T) => number;
}

export function useSortableTable<T>(data: T[], options: SortOption<T>[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const requestSort = (key: string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const option = options.find(o => o.key === sortConfig.key);
    if (!option) return data;

    // To ensure a stable sort, we map each element to include its original index
    const mapped = data.map((item, index) => ({ item, index }));

    mapped.sort((a, b) => {
      let comparison = 0;
      if (option.sortFn) {
        comparison = option.sortFn(a.item, b.item);
      } else {
        // Fallback generic sorting if no sortFn provided
        const aVal = (a.item as any)[sortConfig.key];
        const bVal = (b.item as any)[sortConfig.key];
        if (aVal < bVal) comparison = -1;
        else if (aVal > bVal) comparison = 1;
      }

      // Reverse comparison for descending
      if (sortConfig.direction === 'desc') {
        comparison *= -1;
      }

      // Stable sort fallback
      if (comparison === 0) {
        return a.index - b.index;
      }

      return comparison;
    });

    return mapped.map(m => m.item);
  }, [data, sortConfig, options]);

  return { sortedData, sortConfig, requestSort };
}

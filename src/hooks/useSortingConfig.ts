import { useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export type SortConfig<T> = {
  key: keyof T;
  direction: SortDirection;
};

export function useSortingConfig<T>(initialKey: keyof T, initialDirection: SortDirection = 'desc') {
  const [sortKey, setSortKey] = useState<keyof T>(initialKey);
  const [direction, setDirection] = useState<SortDirection>(initialDirection);

  const onSort = (key: keyof T) => {
    if (sortKey === key) {
      setDirection(direction === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setDirection('desc');
    }
  };

  return {
    sortConfig: { key: sortKey, direction } as SortConfig<T>,
    onSort,
  };
}

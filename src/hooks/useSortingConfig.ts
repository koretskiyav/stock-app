import { useSearchParams } from 'react-router-dom';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

export function useSortingConfig<T>(initialKey: keyof T, initialDirection: SortDirection = 'desc') {
  const [searchParams, setSearchParams] = useSearchParams();

  const sortKey = (searchParams.get('sort') as keyof T) || initialKey;
  const sortDir = (searchParams.get('order') as SortDirection) || initialDirection;

  const onSort = (key: keyof T) => {
    const direction = key === sortKey && sortDir === 'desc' ? 'asc' : 'desc';
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('sort', String(key));
      next.set('order', direction);
      return next;
    });
  };

  return {
    sortConfig: {
      key: sortKey,
      direction: sortDir,
    },
    onSort,
  };
}

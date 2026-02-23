import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortfolioSummary } from '../components/PortfolioSummary/PortfolioSummary';
import {
  useEnrichedSummaries as usePortfolioSummary,
  usePortfolioTotals,
  useCash,
  useTotalPortfolioValue,
  type TickerSummary,
} from '../store/selectors';
import { useSortingConfig } from '../hooks/useSortingConfig';

export const HomePage = () => {
  const summary = usePortfolioSummary();
  const totals = usePortfolioTotals();
  const cash = useCash();
  const navigate = useNavigate();
  const { sortConfig, onSort } = useSortingConfig<TickerSummary>('marketValue');
  const [showClosed, setShowClosed] = useState(false);

  const totalPortfolioValue = useTotalPortfolioValue();

  const filteredSummary = showClosed
    ? summary
    : summary.filter((item: TickerSummary) => item.netQuantity !== 0);

  const sortedSummary = [...filteredSummary].sort((a, b) => {
    const aValue = a[sortConfig.key] ?? 0;
    const bValue = b[sortConfig.key] ?? 0;
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleRowClick = (symbol: string) => {
    navigate(`/details/${symbol}`);
  };

  return (
    <PortfolioSummary
      summary={sortedSummary}
      totals={totals}
      cash={cash}
      totalValue={totalPortfolioValue}
      showClosed={showClosed}
      onShowClosedChange={setShowClosed}
      sortConfig={sortConfig}
      onSort={onSort}
      onRowClick={handleRowClick}
    />
  );
};

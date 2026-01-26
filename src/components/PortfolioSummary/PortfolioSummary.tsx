import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Trade } from '../../data/trades';
import { sortSummary, calculateTotals, type TickerSummary, type SortConfig } from './logic';
import {
  Th,
  Td,
  MoneyTd,
  RealtimeMoneyTd,
  NumberTd,
  PercentTd,
  OverviewCard,
  OverviewGrid,
} from '../ui';
import styles from './PortfolioSummary.module.css';
import cn from 'classnames';
import { formatMoney } from '../../utils/format';

import { usePortfolioSummary } from '../../hooks/usePortfolioSummary';
import { useCashBalance } from '../../hooks/useCashBalance';
import { useSortingConfig } from '../../hooks/useSortingConfig';

const SortableTh = ({
  column,
  label,
  sortConfig,
  onSort,
  align = 'left',
}: {
  column: keyof TickerSummary;
  label: string;
  sortConfig: SortConfig;
  onSort: (key: keyof TickerSummary) => void;
  align?: 'left' | 'right' | 'center';
}) => {
  const getSortIcon = (key: keyof TickerSummary) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <Th align={align} className={styles.sortableHeader} onClick={() => onSort(column)}>
      <div className={cn(styles.headerContent, { [styles.justifyEnd]: align === 'right' })}>
        <span>{label}</span>
        <span className={styles.sortIcon}>{getSortIcon(column)}</span>
      </div>
    </Th>
  );
};

const SummaryTable = ({
  data,
  title,
  onRowClick,
  sortConfig,
  onSort,
  totalPortfolioValue,
  showClosed,
  onShowClosedChange,
}: {
  data: TickerSummary[];
  title: string;
  onRowClick: (symbol: string) => void;
  sortConfig: SortConfig;
  onSort: (key: keyof TickerSummary) => void;
  totalPortfolioValue?: number;
  showClosed: boolean;
  onShowClosedChange: (val: boolean) => void;
}) => {
  if (data.length === 0) return null;

  const totals = calculateTotals(data);

  return (
    <div className={styles.summaryCard}>
      <header className={styles.cardHeader}>
        <h2>
          {title} ({data.length})
        </h2>
        <div className={styles.controlsSection}>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={showClosed}
              onChange={(e) => onShowClosedChange(e.target.checked)}
            />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.switchLabel} onClick={() => onShowClosedChange(!showClosed)}>
            Show Closed Positions
          </span>
        </div>
      </header>

      <table className={styles.summaryTable}>
        <thead>
          <tr>
            <SortableTh column="symbol" label="Symbol" sortConfig={sortConfig} onSort={onSort} />
            <SortableTh
              column="dailyChangePercent"
              label="Day Chg %"
              align="right"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableTh
              column="avgBuyPrice"
              label="Avg Buy"
              align="right"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableTh
              column="currentPrice"
              label="Price"
              align="right"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableTh
              column="netQuantity"
              label="Net Qty"
              align="right"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableTh
              column="marketValue"
              label="Value"
              align="right"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableTh
              column="portfolioWeight"
              label="% Share"
              align="right"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableTh
              column="dividends"
              label="Divs"
              align="right"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableTh
              column="realizedPL"
              label="Real. P/L"
              align="right"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableTh
              column="unrealizedPL"
              label="Unreal. P/L"
              align="right"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableTh
              column="totalGain"
              label="Total Gain"
              align="right"
              sortConfig={sortConfig}
              onSort={onSort}
            />
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.symbol} onClick={() => onRowClick(item.symbol)}>
              <Td bold>{item.symbol}</Td>
              <PercentTd value={item.dailyChangePercent || 0} colored />
              <MoneyTd value={item.avgBuyPrice} />
              <RealtimeMoneyTd value={item.currentPrice || 0} />
              <NumberTd value={item.netQuantity} colorType="blue" />
              <MoneyTd value={item.marketValue || 0} />
              <PercentTd value={item.portfolioWeight || 0} />
              <MoneyTd value={item.dividends} colored />
              <MoneyTd value={item.realizedPL} colored />
              <MoneyTd value={item.unrealizedPL || 0} colored />
              <MoneyTd value={item.totalGain || 0} colored />
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={styles.tableFooter}>
            <Td colSpan={2} bold>
              Total
            </Td>
            <Td />
            <Td />
            <Td />
            <MoneyTd value={totals.marketValue} bold />
            {totalPortfolioValue !== undefined && (
              <PercentTd value={totals.marketValue / totalPortfolioValue} bold />
            )}
            <MoneyTd value={totals.dividends} colored bold />
            <MoneyTd value={totals.realizedPL} colored bold />
            <MoneyTd value={totals.unrealizedPL} colored bold />
            <MoneyTd value={totals.totalGain} colored bold />
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export const PortfolioSummary = ({ trades }: { trades: Trade[] }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { sortConfig, onSort } = useSortingConfig<TickerSummary>('marketValue');

  const showClosed = searchParams.get('closed') === 'true';
  const setShowClosed = (val: boolean) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set('closed', 'true');
      else next.delete('closed');
      return next;
    });
  };

  const cash = useCashBalance();
  const summary = usePortfolioSummary(trades, cash);
  const totals = calculateTotals(summary);
  const totalValue = totals.marketValue + cash;

  const filteredSummary = showClosed ? summary : summary.filter((item) => item.netQuantity !== 0);

  const sortedSummary = sortSummary(filteredSummary, sortConfig);

  const handleRowClick = (symbol: string) => navigate(`/events/${symbol}${window.location.search}`);

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <h1>Portfolio Summary</h1>
      </header>

      <OverviewGrid>
        <OverviewCard label="Net Asset Value" value={formatMoney(totalValue)} />
        <OverviewCard label="Stock Value" value={formatMoney(totals.marketValue)} />
        <OverviewCard label="Cash" value={formatMoney(cash)} />
        <OverviewCard
          label="Day Change"
          value={formatMoney(totals.dailyChange)}
          colorType={totals.dailyChange > 0 ? 'green' : totals.dailyChange < 0 ? 'red' : undefined}
          animateOnChange
        />
        <OverviewCard
          label="Dividends"
          value={formatMoney(totals.dividends)}
          colorType={totals.dividends > 0 ? 'green' : undefined}
        />
        <OverviewCard
          label="Realized P/L"
          value={formatMoney(totals.realizedPL)}
          colorType={totals.realizedPL > 0 ? 'green' : totals.realizedPL < 0 ? 'red' : undefined}
        />
        <OverviewCard
          label="Unrealized P/L"
          value={formatMoney(totals.unrealizedPL)}
          colorType={
            totals.unrealizedPL > 0 ? 'green' : totals.unrealizedPL < 0 ? 'red' : undefined
          }
        />
        <OverviewCard
          label="Total Gain"
          value={formatMoney(totals.totalGain)}
          colorType={totals.totalGain > 0 ? 'green' : totals.totalGain < 0 ? 'red' : undefined}
        />
      </OverviewGrid>

      <SummaryTable
        data={sortedSummary}
        title={showClosed ? 'All Positions' : 'Active Positions'}
        onRowClick={handleRowClick}
        sortConfig={sortConfig}
        onSort={onSort}
        totalPortfolioValue={totalValue}
        showClosed={showClosed}
        onShowClosedChange={setShowClosed}
      />
    </div>
  );
};

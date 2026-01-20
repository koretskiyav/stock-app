import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Trade } from "../../data/trades";
import { 
  sortSummary, 
  calculateTotals,
  type TickerSummary, 
  type SortConfig 
} from "./logic";
import { Th, Td, MoneyTd, NumberTd, PercentTd } from "../ui";
import styles from "./PortfolioSummary.module.css";
import cn from "classnames";
import { formatMoney } from "../../utils/format";

import { usePortfolioSummary } from "../../hooks/usePortfolioSummary";
import { useCashBalance } from "../../hooks/useCashBalance";
import { useSortingConfig } from "../../hooks/useSortingConfig";

const SummaryTable = ({ 
  data, 
  title, 
  onRowClick,
  sortConfig,
  onSort,
  totalPortfolioValue
}: { 
  data: TickerSummary[]; 
  title: string; 
  onRowClick: (symbol: string) => void;
  sortConfig: SortConfig;
  onSort: (key: keyof TickerSummary) => void;
  totalPortfolioValue?: number;
}) => {
  if (data.length === 0) return null;

  const totals = calculateTotals(data);

  const getSortIcon = (key: keyof TickerSummary) => {
    if (sortConfig.key !== key) return "↕";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const SortableTh = ({ column, label, align = "left" }: { column: keyof TickerSummary, label: string, align?: "left" | "right" | "center" }) => (
    <Th 
      align={align} 
      className={styles.sortableHeader} 
      onClick={() => onSort(column)}
    >
      <div className={cn(styles.headerContent, { [styles.justifyEnd]: align === "right" })}>
        <span>{label}</span>
        <span className={styles.sortIcon}>{getSortIcon(column)}</span>
      </div>
    </Th>
  );

  return (
    <div className={styles.summaryCard}>
      <header className={styles.cardHeader}>
        <h2>{title} ({data.length})</h2>
      </header>
      
      <table className={styles.summaryTable}>
        <thead>
          <tr>
            <SortableTh column="symbol" label="Symbol" />
            <SortableTh column="avgBuyPrice" label="Avg Buy" align="right" />
            <SortableTh column="currentPrice" label="Price" align="right" />
            <SortableTh column="netQuantity" label="Net Qty" align="right" />
            <SortableTh column="marketValue" label="Market Value" align="right" />
            <SortableTh column="portfolioWeight" label="% Share" align="right" />
            <SortableTh column="realizedPL" label="Realized P/L" align="right" />
            <SortableTh column="unrealizedPL" label="Unrealized P/L" align="right" />
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr 
              key={item.symbol} 
              onClick={() => onRowClick(item.symbol)}
            >
              <Td bold>{item.symbol}</Td>
              <MoneyTd value={item.avgBuyPrice} />
              <MoneyTd value={item.currentPrice || 0} />
              <NumberTd value={item.netQuantity} colorType="blue" />
              <MoneyTd value={item.marketValue || 0} />
              <PercentTd value={item.portfolioWeight || 0} />
              <MoneyTd value={item.realizedPL} colored />
              <MoneyTd value={item.unrealizedPL || 0} colored />
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={styles.tableFooter}>
            <Td colSpan={4} bold>Total</Td>
            <MoneyTd value={totals.marketValue} />
            {totalPortfolioValue !== undefined && (
              <PercentTd value={totals.marketValue / totalPortfolioValue} />
            )}
            <MoneyTd value={totals.realizedPL} colored />
            <MoneyTd value={totals.unrealizedPL} colored />
          </tr>
        </tfoot>
      </table>
    </div>
  );
};


export const PortfolioSummary = ({ trades }: { trades: Trade[] }) => {
  const navigate = useNavigate();
  const [showClosed, setShowClosed] = useState(false);
  const { sortConfig, onSort } = useSortingConfig<TickerSummary>("marketValue");

  const cash = useCashBalance();
  const summary = usePortfolioSummary(trades, cash);
  const stockValue = summary.reduce((sum, item) => sum + (item.marketValue || 0), 0);
  const totalValue = stockValue + cash;

  const filteredSummary = showClosed 
    ? summary 
    : summary.filter(item => item.netQuantity !== 0);

  const sortedSummary = sortSummary(filteredSummary, sortConfig);

  const handleRowClick = (symbol: string) => navigate(`/trades/${symbol}`);

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <h1>Portfolio Summary</h1>
        <div className={styles.controlsSection}>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={showClosed} 
              onChange={(e) => setShowClosed(e.target.checked)} 
            />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.switchLabel} onClick={() => setShowClosed(!showClosed)}>
            Show Closed Positions
          </span>
        </div>
      </header>
      
      <div className={styles.overviewGrid}>
        <div className={styles.overviewCard}>
          <span className={styles.label}>Net Asset Value</span>
          <span className={styles.value}>{formatMoney(totalValue)}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.label}>Stock Value</span>
          <span className={styles.value}>{formatMoney(stockValue)}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.label}>Cash</span>
          <span className={styles.value}>{formatMoney(cash)}</span>
        </div>
      </div>

      <SummaryTable 
        data={sortedSummary} 
        title={showClosed ? "All Positions" : "Active Positions"} 
        onRowClick={handleRowClick} 
        sortConfig={sortConfig}
        onSort={onSort}
        totalPortfolioValue={totalValue}
      />
    </div>
  );
};




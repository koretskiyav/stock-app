import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Trades as Trade } from "../../data/trades";
import { 
  calculatePortfolioSummary, 
  enrichSummaryWithMarketData, 
  sortSummary, 
  calculateTotals,
  type TickerSummary, 
  type SortConfig 
} from "./logic";
import { Th, Td, MoneyTd, NumberTd, PercentTd } from "../ui";
import { fetchBatchQuotes } from "../../services/marketData";
import styles from "./PortfolioSummary.module.css";
import cn from "classnames";
import { formatMoney } from "../../utils/format";
import { getLatestCashBalance, getReportedPrices } from "../../data/portfolio";

const SummaryTable = ({ 
  data, 
  title, 
  onRowClick,
  initiallyExpanded = true,
  showMarketData = false,
  sortConfig,
  onSort,
  totalPortfolioValue
}: { 
  data: TickerSummary[]; 
  title: string; 
  onRowClick: (symbol: string) => void;
  initiallyExpanded?: boolean;
  showMarketData?: boolean;
  sortConfig: SortConfig;
  onSort: (key: keyof TickerSummary) => void;
  totalPortfolioValue?: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

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
      <header className={styles.cardHeader} onClick={() => setIsExpanded(!isExpanded)}>
        <h2>{title} ({data.length})</h2>
        <span className={cn(styles.toggleBtn, { [styles.expanded]: isExpanded })}>
          ▶
        </span>
      </header>
      
      {isExpanded && (
        <table className={styles.summaryTable}>
          <thead>
            <tr>
              <SortableTh column="symbol" label="Symbol" />
              <SortableTh column="avgBuyPrice" label="Avg Buy" align="right" />
              {showMarketData && <SortableTh column="currentPrice" label="Price" align="right" />}
              <SortableTh column="netQuantity" label="Net Qty" align="right" />
              {showMarketData && <SortableTh column="marketValue" label="Market Value" align="right" />}
              {showMarketData && <SortableTh column="portfolioWeight" label="% Share" align="right" />}
              <SortableTh column="realizedPL" label="Realized P/L" align="right" />
              {showMarketData && <SortableTh column="unrealizedPL" label="Unrealized P/L" align="right" />}
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
                {showMarketData && <MoneyTd value={item.currentPrice || 0} />}
                <NumberTd value={item.netQuantity} colorType="blue" />
                {showMarketData && <MoneyTd value={item.marketValue || 0} />}
                {showMarketData && <PercentTd value={item.portfolioWeight || 0} />}
                <MoneyTd value={item.realizedPL} colored />
                {showMarketData && <MoneyTd value={item.unrealizedPL || 0} colored />}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={styles.tableFooter}>
              <Td colSpan={showMarketData ? 4 : 5} bold>Total</Td>
              {showMarketData && <MoneyTd value={totals.marketValue} />}
              {showMarketData && totalPortfolioValue !== undefined && (
                <PercentTd value={totals.marketValue / totalPortfolioValue} />
              )}
              <MoneyTd value={totals.realizedPL} colored />
              {showMarketData && <MoneyTd value={totals.unrealizedPL} colored />}
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
};

export const PortfolioSummary = ({ trades }: { trades: Trade[] }) => {
  const navigate = useNavigate();
  const [prices, setPrices] = useState<Map<string, number>>(new Map());
  const [showClosed, setShowClosed] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: "marketValue", 
    direction: "desc" 
  });

  const baseSummary = calculatePortfolioSummary(trades);
  const cash = getLatestCashBalance();
  const reportedPrices = getReportedPrices();

  useEffect(() => {
    const activeSymbols = baseSummary
      .filter(item => item.netQuantity > 0)
      .map(item => item.symbol);
    
    if (activeSymbols.length > 0) {
      fetchBatchQuotes(activeSymbols).then(setPrices);
    }
  }, [baseSummary]);

  const { summary, stockValue, totalValue } = enrichSummaryWithMarketData(
    baseSummary,
    prices,
    reportedPrices,
    cash
  );

  const filteredSummary = showClosed 
    ? summary 
    : summary.filter(item => item.netQuantity !== 0);

  const sortedSummary = sortSummary(filteredSummary, sortConfig);

  const handleSort = (key: keyof TickerSummary) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc"
    }));
  };

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
        showMarketData={true}
        sortConfig={sortConfig}
        onSort={handleSort}
        totalPortfolioValue={totalValue}
      />
    </div>
  );
};




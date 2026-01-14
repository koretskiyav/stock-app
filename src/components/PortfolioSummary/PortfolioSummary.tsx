import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Trades as Trade } from "../../data/trades";
import { calculatePortfolioSummary, type TickerSummary } from "./logic";
import { Th, Td, MoneyTd, NumberTd, PercentTd } from "../ui";
import { fetchBatchQuotes, getCachedPrice } from "../../services/marketData";
import styles from "./PortfolioSummary.module.css";
import cn from "classnames";
import { formatMoney } from "../../utils/format";
import { getLatestCashBalance, getReportedPrices } from "../../data/portfolio";

type SortConfig = {
  key: keyof TickerSummary;
  direction: "asc" | "desc";
};

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

  const totalRealizedPL = data.reduce((sum, item) => sum + item.realizedPL, 0);
  const totalMarketValue = data.reduce((sum, item) => sum + (item.marketValue || 0), 0);
  const totalUnrealizedPL = data.reduce((sum, item) => sum + (item.unrealizedPL || 0), 0);

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
              {showMarketData && <MoneyTd value={totalMarketValue} />}
              {showMarketData && totalPortfolioValue !== undefined && (
                <PercentTd value={totalMarketValue / totalPortfolioValue} />
              )}
              <MoneyTd value={totalRealizedPL} colored />
              {showMarketData && <MoneyTd value={totalUnrealizedPL} colored />}
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
};

export const PortfolioSummary = ({ trades }: { trades: Trade[] }) => {
  const baseSummary = calculatePortfolioSummary(trades);
  const [prices, setPrices] = useState<Map<string, number>>(new Map());
  const [showClosed, setShowClosed] = useState(false);
  const cash = getLatestCashBalance();
  
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: "marketValue", 
    direction: "desc" 
  });
  const navigate = useNavigate();

  useEffect(() => {
    const activeSymbols = baseSummary
      .filter(item => item.netQuantity > 0)
      .map(item => item.symbol);
    
    if (activeSymbols.length > 0) {
      fetchBatchQuotes(activeSymbols).then(setPrices);
    }
  }, [baseSummary]);

  const reportedPrices = getReportedPrices();

  const rawSummary = baseSummary.map(item => {
    const livePrice = prices.get(item.symbol);
    const cachedPrice = getCachedPrice(item.symbol);
    const reportedPrice = reportedPrices.get(item.symbol) || 0;
    
    const currentPrice = livePrice ?? (cachedPrice ?? reportedPrice);
    
    const marketValue = item.netQuantity * currentPrice;
    const unrealizedPL = marketValue - (item.netQuantity * item.avgBuyPrice);
    return { 
      ...item, 
      currentPrice, 
      marketValue, 
      unrealizedPL
    };
  });

  const dynamicStockValue = rawSummary.reduce((sum, item) => sum + item.marketValue, 0);

  const dynamicTotalValue = dynamicStockValue + cash;

  const summaryWithWeights = rawSummary.map(item => ({
    ...item,
    portfolioWeight: dynamicTotalValue > 0 ? item.marketValue / dynamicTotalValue : 0
  }));

  const filteredSummary = showClosed 
    ? summaryWithWeights 
    : summaryWithWeights.filter(item => item.netQuantity !== 0);

  const sortedSummary = [...filteredSummary].sort((a, b) => {
    const aValue = a[sortConfig.key] ?? 0;
    const bValue = b[sortConfig.key] ?? 0;

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key: keyof TickerSummary) => {
    let direction: "asc" | "desc" = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
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
          <span className={styles.value}>{formatMoney(dynamicTotalValue)}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.label}>Stock Value</span>
          <span className={styles.value}>{formatMoney(dynamicStockValue)}</span>
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
        onSort={requestSort}
        totalPortfolioValue={dynamicTotalValue}
      />
    </div>
  );
};




import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Trades as Trade } from "../../data/trades";
import { calculatePortfolioSummary, type TickerSummary } from "./logic";
import { Th, Td, MoneyTd, NumberTd } from "../ui";
import { fetchBatchQuotes } from "../../services/marketData";
import styles from "./PortfolioSummary.module.css";
import cn from "classnames";

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
  onSort
}: { 
  data: TickerSummary[]; 
  title: string; 
  onRowClick: (symbol: string) => void;
  initiallyExpanded?: boolean;
  showMarketData?: boolean;
  sortConfig: SortConfig;
  onSort: (key: keyof TickerSummary) => void;
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
                <MoneyTd value={item.realizedPL} colored />
                {showMarketData && <MoneyTd value={item.unrealizedPL || 0} colored />}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={styles.tableFooter}>
              <Td colSpan={showMarketData ? 4 : 5} bold>Total</Td>
              {showMarketData && <MoneyTd value={totalMarketValue} />}
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
  const baseSummary = useMemo(() => calculatePortfolioSummary(trades), [trades]);
  const [prices, setPrices] = useState<Map<string, number>>(new Map());
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

  const rawSummary = useMemo(() => {
    return baseSummary.map(item => {
      const currentPrice = prices.get(item.symbol);
      const marketValue = currentPrice !== undefined ? item.netQuantity * currentPrice : 0;
      const unrealizedPL = currentPrice !== undefined ? marketValue - (item.netQuantity * item.avgBuyPrice) : 0;
      return { 
        ...item, 
        currentPrice: currentPrice || 0, 
        marketValue, 
        unrealizedPL 
      };
    });
  }, [baseSummary, prices]);

  const sortedSummary = useMemo(() => {
    const sortableItems = [...rawSummary];
    sortableItems.sort((a, b) => {
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
    return sortableItems;
  }, [rawSummary, sortConfig]);

  const { active, closed, anomalies } = useMemo(() => {
    const active: TickerSummary[] = [];
    const closed: TickerSummary[] = [];
    const anomalies: TickerSummary[] = [];

    for (const item of sortedSummary) {
      if (item.netQuantity > 0) {
        active.push(item);
      } else if (item.netQuantity === 0) {
        closed.push(item);
      } else {
        anomalies.push(item);
      }
    }

    return { active, closed, anomalies };
  }, [sortedSummary]);

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
      <h1>Portfolio Summary</h1>
      <SummaryTable 
        data={active} 
        title="Active Positions" 
        onRowClick={handleRowClick} 
        showMarketData={true}
        sortConfig={sortConfig}
        onSort={requestSort}
      />
      <SummaryTable 
        data={closed} 
        title="Closed Positions" 
        onRowClick={handleRowClick} 
        initiallyExpanded={false} 
        sortConfig={sortConfig}
        onSort={requestSort}
      />
      <SummaryTable 
        data={anomalies} 
        title="Anomalies (Negative Balance)" 
        onRowClick={handleRowClick} 
        sortConfig={sortConfig}
        onSort={requestSort}
      />
    </div>
  );
};


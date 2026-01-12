import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Trades as Trade } from "../../data/trades";
import { calculatePortfolioSummary, type TickerSummary } from "./logic";
import { Th, Td, MoneyTd, NumberTd } from "../ui";
import styles from "./PortfolioSummary.module.css";
import cn from "classnames";

const SummaryTable = ({ 
  data, 
  title, 
  onRowClick,
  initiallyExpanded = true
}: { 
  data: TickerSummary[]; 
  title: string; 
  onRowClick: (symbol: string) => void;
  initiallyExpanded?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  if (data.length === 0) return null;

  const totalRealizedPL = data.reduce((sum, item) => sum + item.realizedPL, 0);

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
              <Th>Symbol</Th>
              <Th align="right">Buy Qty</Th>
              <Th align="right">Buy Amount</Th>
              <Th align="right">Sell Qty</Th>
              <Th align="right">Sell Amount</Th>
              <Th align="right">Net Qty</Th>
              <Th align="right">Realized P/L</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr 
                key={item.symbol} 
                onClick={() => onRowClick(item.symbol)}
              >
                <Td bold>{item.symbol}</Td>
                <NumberTd value={item.buyQuantity} />
                <MoneyTd value={item.buySum} />
                <NumberTd value={item.sellQuantity} />
                <MoneyTd value={item.sellSum} />
                <NumberTd value={item.netQuantity} colorType="blue" />
                <MoneyTd value={item.realizedPL} colored />
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={styles.tableFooter}>
              <Td colSpan={6} bold>Total Realized P/L</Td>
              <MoneyTd value={totalRealizedPL} colored />
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
};

export const PortfolioSummary = ({ trades }: { trades: Trade[] }) => {
  const summary = useMemo(() => calculatePortfolioSummary(trades), [trades]);
  const navigate = useNavigate();

  const { active, closed, anomalies } = useMemo(() => {
    const active: TickerSummary[] = [];
    const closed: TickerSummary[] = [];
    const anomalies: TickerSummary[] = [];

    for (const item of summary) {
      if (item.netQuantity > 0) {
        active.push(item);
      } else if (item.netQuantity === 0) {
        closed.push(item);
      } else {
        anomalies.push(item);
      }
    }

    return { active, closed, anomalies };
  }, [summary]);

  const handleRowClick = (symbol: string) => navigate(`/trades/${symbol}`);

  return (
    <div className={styles.dashboardContainer}>
      <h1>Portfolio Summary</h1>
      <SummaryTable data={active} title="Active Positions" onRowClick={handleRowClick} />
      <SummaryTable data={closed} title="Closed Positions" onRowClick={handleRowClick} initiallyExpanded={false} />
      <SummaryTable data={anomalies} title="Anomalies (Negative Balance)" onRowClick={handleRowClick} />
    </div>
  );
};


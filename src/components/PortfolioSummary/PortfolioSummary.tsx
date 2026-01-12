import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Trades as Trade } from "../../data/trades";
import { formatMoney, formatNumber } from "../../utils/format";
import { calculatePortfolioSummary, type TickerSummary } from "./logic";
import styles from "./PortfolioSummary.module.css";
import cn from "classnames";

const SummaryTable = ({ 
  data, 
  title, 
  onRowClick 
}: { 
  data: TickerSummary[]; 
  title: string; 
  onRowClick: (symbol: string) => void;
}) => {
  if (data.length === 0) return null;

  return (
    <div className={styles.summaryCard}>
      <h2>{title} ({data.length})</h2>
      <table className={styles.summaryTable}>
        <thead>
          <tr>
            <th>Symbol</th>
            <th className={styles.textRight}>Buy Qty</th>
            <th className={styles.textRight}>Buy Amount</th>
            <th className={styles.textRight}>Sell Qty</th>
            <th className={styles.textRight}>Sell Amount</th>
            <th className={styles.textRight}>Net Qty</th>
            <th className={styles.textRight}>Realized P/L</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr 
              key={item.symbol} 
              onClick={() => onRowClick(item.symbol)}
            >
              <td className={styles.fontBold}>{item.symbol}</td>
              <td className={cn(styles.textRight, styles.fontMono)}>
                {formatNumber(item.buyQuantity)}
              </td>
              <td className={cn(styles.textRight, styles.fontMono)}>
                {formatMoney(item.buySum)}
              </td>
              <td className={cn(styles.textRight, styles.fontMono)}>
                {formatNumber(item.sellQuantity)}
              </td>
              <td className={cn(styles.textRight, styles.fontMono)}>
                {formatMoney(item.sellSum)}
              </td>
              <td
                className={cn(
                  styles.textRight,
                  styles.fontMono,
                  { [styles.textBlue]: item.netQuantity > 0 }
                )}
              >
                {formatNumber(item.netQuantity)}
              </td>
              <td
                className={cn(
                  styles.textRight,
                  styles.fontMono,
                  item.realizedPL >= 0 ? styles.textGreen : styles.textRed
                )}
              >
                {formatMoney(item.realizedPL)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
      <SummaryTable data={closed} title="Closed Positions" onRowClick={handleRowClick} />
      <SummaryTable data={anomalies} title="Anomalies (Negative Balance)" onRowClick={handleRowClick} />
    </div>
  );
};


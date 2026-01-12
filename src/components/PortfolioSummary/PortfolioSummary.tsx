import { useMemo } from "react";
import type { Trades as Trade } from "../../data/trades";
import { formatMoney, formatNumber } from "../../utils/format";
import { calculatePortfolioSummary } from "./logic";
import styles from "./PortfolioSummary.module.css";
import cn from "classnames";

export const PortfolioSummary = ({ trades }: { trades: Trade[] }) => {
  const summary = useMemo(() => calculatePortfolioSummary(trades), [trades]);

  return (
    <div className={styles.dashboardContainer}>
      <h1>Portfolio Summary</h1>

      <div className={styles.summaryCard}>
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
            {summary.map((item) => (
              <tr key={item.symbol}>
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
    </div>
  );
};


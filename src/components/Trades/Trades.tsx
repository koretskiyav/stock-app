import type { Trades as Trade } from "../../data/trades";
import { formatMoney, formatNumber } from "../../utils/format";
import styles from "./Trades.module.css";
import cn from "classnames";

export const Trades = ({ trades }: { trades: Trade[] }) => {
  const totalQuantity = trades.reduce((acc, trade) => acc + trade.quantity, 0);
  const totalProceeds = trades.reduce((acc, trade) => acc + trade.proceeds, 0);
  const totalCommFee = trades.reduce((acc, trade) => acc + trade.commFee, 0);
  const totalRealizedPL = trades.reduce((acc, trade) => acc + trade.realizedPL, 0);

  return (
    <div className={styles.tradesContainer}>
      <div className={styles.tableCard}>
        <table className={styles.tradesTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th className={styles.textRight}>Quantity</th>
              <th className={styles.textRight}>Trade Price</th>
              <th className={styles.textRight}>Current Price</th>
              <th className={styles.textRight}>Proceeds</th>
              <th className={styles.textRight}>Commission Fee</th>
              <th className={styles.textRight}>Basis</th>
              <th className={styles.textRight}>Realized P/L</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr
                key={trade.dateTime + trade.trades} // Assuming dateTime + id is unique enough or use index fallback
                className={cn(
                  trade.quantity > 0 ? styles.rowBuy : styles.rowSell
                )}
              >
                <td>{trade.dateTime}</td>
                <td className={cn(styles.textRight, styles.fontMono)}>
                  {formatNumber(trade.quantity)}
                </td>
                <td className={cn(styles.textRight, styles.fontMono)}>
                  {formatMoney(trade.tPrice)}
                </td>
                <td className={cn(styles.textRight, styles.fontMono)}>
                  {formatMoney(trade.cPrice)}
                </td>
                <td className={cn(styles.textRight, styles.fontMono)}>
                  {formatMoney(trade.proceeds)}
                </td>
                <td className={cn(styles.textRight, styles.fontMono)}>
                  {formatMoney(trade.commFee)}
                </td>
                <td className={cn(styles.textRight, styles.fontMono)}>
                  {formatMoney(trade.basis)}
                </td>
                <td
                  className={cn(
                    styles.textRight,
                    styles.fontMono,
                    trade.realizedPL >= 0 ? styles.textGreen : styles.textRed
                  )}
                >
                  {formatMoney(trade.realizedPL)}
                </td>
              </tr>
            ))}
            <tr className={styles.totalRow}>
              <td className={styles.fontBold}>Total</td>
              <td className={cn(styles.textRight, styles.fontMono)}>
                {formatNumber(totalQuantity)}
              </td>
              <td></td>
              <td></td>
              <td className={cn(styles.textRight, styles.fontMono)}>
                {formatMoney(totalProceeds)}
              </td>
              <td className={cn(styles.textRight, styles.fontMono)}>
                {formatMoney(totalCommFee)}
              </td>
              <td></td>
              <td
                className={cn(
                  styles.textRight,
                  styles.fontMono,
                  totalRealizedPL >= 0 ? styles.textGreen : styles.textRed
                )}
              >
                {formatMoney(totalRealizedPL)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

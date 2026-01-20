import type { Trade } from "../../data/trades";
import { Th, Td, MoneyTd, NumberTd } from "../ui";
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
              <Th>Date</Th>
              <Th align="right">Quantity</Th>
              <Th align="right">Trade Price</Th>
              <Th align="right">Current Price</Th>
              <Th align="right">Proceeds</Th>
              <Th align="right">Commission Fee</Th>
              <Th align="right">Basis</Th>
              <Th align="right">Realized P/L</Th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr
                key={trade.dateTime + trade.trades}
                className={cn(
                  trade.quantity > 0 ? styles.rowBuy : styles.rowSell
                )}
              >
                <Td>{trade.dateTime}</Td>
                <NumberTd value={trade.quantity} />
                <MoneyTd value={trade.tPrice} />
                <MoneyTd value={trade.cPrice} />
                <MoneyTd value={trade.proceeds} />
                <MoneyTd value={trade.commFee} />
                <MoneyTd value={trade.basis} />
                <MoneyTd value={trade.realizedPL} colored />
              </tr>
            ))}
            <tr className={styles.totalRow}>
              <Td bold>Total</Td>
              <NumberTd value={totalQuantity} />
              <Td></Td>
              <Td></Td>
              <MoneyTd value={totalProceeds} />
              <MoneyTd value={totalCommFee} />
              <Td></Td>
              <MoneyTd value={totalRealizedPL} colored />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

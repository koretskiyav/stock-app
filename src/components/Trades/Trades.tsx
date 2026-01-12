import styles from "./styles.module.scss";
import cn from "classnames";

export interface Trade {
  currency: string;
  symbol: string;
  date: string;
  quantity: number;
  tPrice: number;
  cPrice: number;
  proceeds: number;
  commFee: number;
  basis: number;
  realizedPL: number;
}

const money = (value: number) => Math.round(value * 100) / 100;

export const Trades = ({ trades }: { trades: Trade[] }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Quantity</th>
          <th>Trade Price</th>
          <th>Current Price</th>
          <th>Proceeds</th>
          <th>Commission Fee</th>
          <th>Basis</th>
          <th>Realized P/L</th>
        </tr>
      </thead>
      <tbody>
        {trades.map((trade) => {
          return (
            <tr
              key={trade.date}
              className={trade.quantity > 0 ? styles.buy : styles.sell}
            >
              <td>{trade.date}</td>
              <td>{trade.quantity}</td>
              <td>{money(trade.tPrice)}</td>
              <td>{money(trade.cPrice)}</td>
              <td>{money(trade.proceeds)}</td>
              <td>{money(trade.commFee)}</td>
              <td>{money(trade.basis)}</td>
              <td
                className={cn({
                  [styles.profit]: trade.realizedPL > 0,
                  [styles.loss]: trade.realizedPL < 0,
                })}
              >
                {money(trade.realizedPL)}
              </td>
            </tr>
          );
        })}
        <tr className={styles.total}>
          <td>Total</td>
          <td>{trades.reduce((acc, trade) => acc + trade.quantity, 0)}</td>
          <td></td>
          <td></td>
          <td>
            {money(trades.reduce((acc, trade) => acc + trade.proceeds, 0))}
          </td>
          <td>
            {money(trades.reduce((acc, trade) => acc + trade.commFee, 0))}
          </td>
          <td></td>
          <td>
            {money(trades.reduce((acc, trade) => acc + trade.realizedPL, 0))}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

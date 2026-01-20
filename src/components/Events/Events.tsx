import type { Trade } from '../../data/trades';
import type { Dividend } from '../../data/dividends';
import type { Split } from '../../data/splits';
import { Th, Td, MoneyTd, NumberTd } from '../ui';
import styles from './Events.module.css';
import cn from 'classnames';

type EventType = 'BUY' | 'SELL' | 'DIVIDEND' | 'SPLIT';

interface UnifiedEvent {
  date: string;
  type: EventType;
  description: string;
  quantity: number | string;
  price: number | null;
  amount: number | null;
  fees: number | null;
  realizedPL: number | null;
  id: string;
}

export const Events = ({
  trades,
  dividends,
  splits,
}: {
  trades: Trade[];
  dividends: Dividend[];
  splits: Split[];
}) => {
  const events: UnifiedEvent[] = [
    ...trades.map((t) => ({
      date: t.dateTime,
      type: (t.quantity > 0 ? 'BUY' : 'SELL') as EventType,
      description: `${t.quantity > 0 ? 'Buy' : 'Sell'} ${t.symbol}`,
      quantity: Math.abs(t.quantity),
      price: t.tPrice,
      amount: t.proceeds,
      fees: t.commFee,
      realizedPL: t.realizedPL,
      id: `trade-${t.dateTime}-${t.trades}-${t.quantity}`,
    })),
    ...dividends.map((d) => ({
      date: d.date,
      type: 'DIVIDEND' as EventType,
      description: d.description,
      quantity: d.quantity,
      price: d.perShare,
      amount: d.amount,
      fees: null,
      realizedPL: null,
      id: `div-${d.date}-${d.description}`,
    })),
    ...splits.map((s) => ({
      date: s.date,
      type: 'SPLIT' as EventType,
      description: `Split ${s.ratio} for 1`,
      quantity: s.ratio,
      price: null,
      amount: null,
      fees: null,
      realizedPL: null,
      id: `split-${s.date}-${s.symbol}-${s.ratio}`,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const totalRealizedPL = trades.reduce((acc, t) => acc + t.realizedPL, 0);
  const totalDividends = dividends.reduce((acc, d) => acc + d.amount, 0);

  return (
    <div className={styles.eventsContainer}>
      <div className={styles.tableCard}>
        <table className={styles.eventsTable}>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Type</Th>
              <Th>Description</Th>
              <Th align="right">Quantity</Th>
              <Th align="right">Price / Per Share</Th>
              <Th align="right">Amount / Proceeds</Th>
              <Th align="right">Fees</Th>
              <Th align="right">Realized P/L</Th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr
                key={event.id}
                className={cn({
                  [styles.rowBuy]: event.type === 'BUY',
                  [styles.rowSell]: event.type === 'SELL',
                  [styles.rowDividend]: event.type === 'DIVIDEND',
                  [styles.rowSplit]: event.type === 'SPLIT',
                })}
              >
                <Td>{event.date}</Td>
                <Td>
                  <span className={styles.typeBadge}>{event.type}</span>
                </Td>
                <Td>{event.description}</Td>
                {typeof event.quantity === 'number' ? (
                  <NumberTd value={event.quantity} />
                ) : (
                  <Td align="right">{event.quantity}</Td>
                )}
                {event.price !== null ? (
                  <MoneyTd value={event.price} />
                ) : (
                  <Td align="right">—</Td>
                )}
                {event.amount !== null ? (
                  <MoneyTd value={event.amount} />
                ) : (
                  <Td align="right">—</Td>
                )}
                {event.fees !== null ? (
                  <MoneyTd value={event.fees} />
                ) : (
                  <Td align="right">—</Td>
                )}
                {event.realizedPL !== null ? (
                  <MoneyTd value={event.realizedPL} colored />
                ) : (
                  <Td align="right">—</Td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={styles.totalRow}>
              <Td colSpan={5} bold>
                Total Realized P/L + Dividends
              </Td>
              <MoneyTd value={totalDividends} />
              <Td></Td>
              <MoneyTd value={totalRealizedPL} colored />
            </tr>
            <tr className={styles.totalRow}>
              <Td colSpan={5} bold>
                Combined Total Gain
              </Td>
              <Td></Td>
              <Td></Td>
              <MoneyTd value={totalRealizedPL + totalDividends} colored />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

import type { Trade } from '../../data/trades';
import type { Dividend } from '../../data/dividends';
import type { Split } from '../../data/splits';
import { Th, Td, MoneyTd, NumberTd, OverviewCard, OverviewGrid } from '../ui';
import { type TickerSummary } from '../PortfolioSummary/logic';
import styles from './Events.module.css';
import cn from 'classnames';
import { formatMoney, formatNumber, formatPercent } from '../../utils/format';

type EventType = 'BUY' | 'SELL' | 'DIVIDEND' | 'SPLIT';

interface UnifiedEvent {
  dateStr: string;
  timeStr: string;
  fullDate: string;
  type: EventType;
  description: string;
  quantity: number | string;
  price: number | null;
  amount: number | null;
  fees: number | null;
  realizedPL: number | null;
  id: string;
}

const parseDateTime = (dateTime: string) => {
  const parts = dateTime.split(',');
  return {
    date: parts[0]?.trim() || '',
    time: parts[1]?.trim() || '',
  };
};

export const Events = ({
  trades,
  dividends,
  splits,
  summary,
}: {
  trades: Trade[];
  dividends: Dividend[];
  splits: Split[];
  summary?: TickerSummary;
}) => {
  const events: UnifiedEvent[] = [
    ...trades.map((t) => {
      const { date, time } = parseDateTime(t.dateTime);
      return {
        dateStr: date,
        timeStr: time,
        fullDate: t.dateTime,
        type: (t.quantity > 0 ? 'BUY' : 'SELL') as EventType,
        description: `${t.quantity > 0 ? 'Buy' : 'Sell'} ${t.symbol}`,
        quantity: Math.abs(t.quantity),
        price: t.tPrice,
        amount: t.proceeds,
        fees: t.commFee,
        realizedPL: t.realizedPL,
        id: `trade-${t.dateTime}-${t.trades}-${t.quantity}`,
      };
    }),
    ...dividends.map((d) => {
      const { date, time } = parseDateTime(d.date);
      return {
        dateStr: date,
        timeStr: time,
        fullDate: d.date,
        type: 'DIVIDEND' as EventType,
        description: d.description,
        quantity: d.quantity,
        price: d.perShare,
        amount: d.amount,
        fees: null,
        realizedPL: null,
        id: `div-${d.date}-${d.description}`,
      };
    }),
    ...splits.map((s) => {
      const { date, time } = parseDateTime(s.date);
      return {
        dateStr: date,
        timeStr: time,
        fullDate: s.date,
        type: 'SPLIT' as EventType,
        description: `Split ${s.ratio} for 1`,
        quantity: s.ratio,
        price: null,
        amount: null,
        fees: null,
        realizedPL: null,
        id: `split-${s.date}-${s.symbol}-${s.ratio}`,
      };
    }),
  ].sort((a, b) => b.fullDate.localeCompare(a.fullDate));

  return (
    <div className={styles.eventsContainer}>
      {summary && (
        <OverviewGrid>
          <OverviewCard
            label="Net Quantity"
            value={formatNumber(summary.netQuantity)}
            colorType="blue"
          />
          <OverviewCard label="Avg Buy Price" value={formatMoney(summary.avgBuyPrice)} />
          <OverviewCard label="Current Price" value={formatMoney(summary.currentPrice || 0)} />
          <OverviewCard label="Market Value" value={formatMoney(summary.marketValue || 0)} />
          <OverviewCard label="Portfolio Weight" value={formatPercent(summary.portfolioWeight || 0)} />
          <OverviewCard
            label="Dividends"
            value={formatMoney(summary.dividends)}
            colorType={summary.dividends > 0 ? 'green' : undefined}
          />
          <OverviewCard
            label="Realized P/L"
            value={formatMoney(summary.realizedPL)}
            colorType={
              summary.realizedPL > 0 ? 'green' : summary.realizedPL < 0 ? 'red' : undefined
            }
          />
          <OverviewCard
            label="Unrealized P/L"
            value={formatMoney(summary.unrealizedPL || 0)}
            colorType={
              (summary.unrealizedPL || 0) > 0
                ? 'green'
                : (summary.unrealizedPL || 0) < 0
                  ? 'red'
                  : undefined
            }
          />
          <OverviewCard
            label="Total Gain"
            value={formatMoney(summary.totalGain || 0)}
            colorType={
              (summary.totalGain || 0) > 0 ? 'green' : (summary.totalGain || 0) < 0 ? 'red' : undefined
            }
          />
        </OverviewGrid>
      )}

      <div className={styles.tableCard}>
        <table className={styles.eventsTable}>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Type</Th>
              <Th align="right">Quantity</Th>
              <Th align="right">Price / Per Share</Th>
              <Th align="right">Amount / Proceeds</Th>
              <Th align="right">Fees</Th>
              <Th align="right">Realized P/L</Th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <Td>
                  <span className={styles.dateCell} title={event.timeStr || 'No time data'}>
                    {event.dateStr}
                  </span>
                </Td>
                <Td>
                  <span className={cn(styles.typeBadge, styles[`type_${event.type}`])}>
                    {event.type}
                  </span>
                </Td>
                {typeof event.quantity === 'number' ? (
                  <NumberTd value={event.quantity} />
                ) : (
                  <Td align="right">{event.quantity}</Td>
                )}
                {event.price !== null ? <MoneyTd value={event.price} /> : <Td align="right">—</Td>}
                {event.amount !== null ? <MoneyTd value={event.amount} /> : <Td align="right">—</Td>}
                {event.fees !== null ? <MoneyTd value={event.fees} /> : <Td align="right">—</Td>}
                {event.realizedPL !== null ? (
                  <MoneyTd value={event.realizedPL} />
                ) : (
                  <Td align="right">—</Td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

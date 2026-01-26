import { useState } from 'react';
import cn from 'classnames';
import type { Trade } from '../../data/trades';
import type { Dividend } from '../../data/dividends';
import type { Split } from '../../data/splits';
import { Th, Td, MoneyTd, NumberTd, OverviewCard, OverviewGrid } from '../ui';
import { type TickerSummary } from '../PortfolioSummary/logic';
import styles from './Events.module.css';
import { formatMoney, formatNumber, formatPercent } from '../../utils/format';
import { calculateLots } from './logic';

const parseDateTime = (dateTime: string) => {
  const parts = dateTime.split(',');
  return {
    date: parts[0]?.trim() || '',
    time: parts[1]?.trim() || '',
  };
};

const TypeBadge = ({ type }: { type: 'BUY' | 'SELL' | 'DIVIDEND' | 'SPLIT' }) => (
  <span className={cn(styles.typeBadge, styles[`type_${type}`])}>{type}</span>
);

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
  const [showAllTrades, setShowAllTrades] = useState(false);
  const { openLots, soldLots } = calculateLots(trades, summary?.currentPrice);

  // Totals
  const totalOpenQty = openLots.reduce((acc, lot) => acc + lot.quantity, 0);
  const totalOpenCostBasis = openLots.reduce((acc, lot) => acc + lot.costBasis, 0);
  const totalOpenUnrealizedPL = openLots.reduce((acc, lot) => acc + (lot.unrealizedPL || 0), 0);

  const totalSoldQty = soldLots.reduce((acc, lot) => acc + lot.quantity, 0);
  const totalSoldRealizedPL = soldLots.reduce((acc, lot) => acc + (lot.realizedPL || 0), 0);

  const totalAllTradesQty = trades.reduce((acc, trade) => acc + Math.abs(trade.quantity), 0);
  const totalAllTradesProceeds = trades.reduce((acc, trade) => acc + trade.proceeds, 0);
  const totalAllTradesFees = trades.reduce((acc, trade) => acc + trade.commFee, 0);
  const totalAllTradesRealizedPL = trades.reduce((acc, trade) => acc + trade.realizedPL, 0);

  const totalDividendsAmount = dividends.reduce((acc, div) => acc + div.amount, 0);

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
          <OverviewCard
            label="Portfolio Weight"
            value={formatPercent(summary.portfolioWeight || 0)}
          />
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
              (summary.totalGain || 0) > 0
                ? 'green'
                : (summary.totalGain || 0) < 0
                  ? 'red'
                  : undefined
            }
          />
        </OverviewGrid>
      )}

      {/* Actual Lots (Open) */}
      {openLots.length > 0 && (
        <>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Actual Lots</h3>
          </div>
          <div className={styles.tableCard}>
            <table className={styles.eventsTable}>
              <thead>
                <tr>
                  <Th>Buy Date</Th>
                  <Th align="right">Quantity</Th>
                  <Th align="right">Buy Price</Th>
                  <Th align="right">Cost Basis</Th>
                  <Th align="right">Current Price</Th>
                  <Th align="right">Unrealized P/L</Th>
                </tr>
              </thead>
              <tbody>
                {[...openLots]
                  .sort((a, b) => b.buyDate.localeCompare(a.buyDate))
                  .map((lot, idx) => (
                    <tr key={`open-${idx}`}>
                      <Td>{parseDateTime(lot.buyDate).date}</Td>
                      <NumberTd value={lot.quantity} />
                      <MoneyTd value={lot.buyPrice} />
                      <MoneyTd value={lot.costBasis} />
                      <MoneyTd value={lot.currentPrice || 0} />
                      <MoneyTd value={lot.unrealizedPL || 0} colored />
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className={styles.totalRow}>
                  <Td />
                  <NumberTd value={totalOpenQty} bold />
                  <Td />
                  <MoneyTd value={totalOpenCostBasis} bold />
                  <Td />
                  <MoneyTd value={totalOpenUnrealizedPL} colored bold />
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {/* Sold Lots (Closed) */}
      {soldLots.length > 0 && (
        <>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Sold Lots</h3>
          </div>
          <div className={styles.tableCard}>
            <table className={styles.eventsTable}>
              <thead>
                <tr>
                  <Th>Buy Date</Th>
                  <Th>Sell Date</Th>
                  <Th align="right">Quantity</Th>
                  <Th align="right">Buy Price</Th>
                  <Th align="right">Sell Price</Th>
                  <Th align="right">Realized P/L</Th>
                </tr>
              </thead>
              <tbody>
                {[...soldLots]
                  .sort((a, b) => b.sellDate!.localeCompare(a.sellDate!))
                  .map((lot, idx) => (
                    <tr key={`sold-${idx}`}>
                      <Td>{parseDateTime(lot.buyDate || '').date}</Td>
                      <Td>{parseDateTime(lot.sellDate || '').date}</Td>
                      <NumberTd value={lot.quantity} />
                      <MoneyTd value={lot.buyPrice} />
                      <MoneyTd value={lot.sellPrice || 0} />
                      <MoneyTd value={lot.realizedPL || 0} colored />
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className={styles.totalRow}>
                  <Td />
                  <Td />
                  <NumberTd value={totalSoldQty} bold />
                  <Td />
                  <Td />
                  <MoneyTd value={totalSoldRealizedPL} colored bold />
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {/* All Trades (Collapsible) */}
      {trades.length > 0 && (
        <>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>All Trades</h3>
            <button
              className={styles.collapseButton}
              onClick={() => setShowAllTrades(!showAllTrades)}
            >
              {showAllTrades ? 'Hide' : 'Show'}
            </button>
          </div>
          {showAllTrades && (
            <div className={styles.tableCard}>
              <table className={styles.eventsTable}>
                <thead>
                  <tr>
                    <Th>Type</Th>
                    <Th>Date</Th>
                    <Th align="right">Quantity</Th>
                    <Th align="right">Price</Th>
                    <Th align="right">Proceeds</Th>
                    <Th align="right">Comm/Fee</Th>
                    <Th align="right">Realized P/L</Th>
                  </tr>
                </thead>
                <tbody>
                  {[...trades]
                    .sort((a, b) => b.dateTime.localeCompare(a.dateTime))
                    .map((trade, idx) => (
                      <tr key={`trade-${idx}`}>
                        <Td>
                          <TypeBadge type={trade.quantity > 0 ? 'BUY' : 'SELL'} />
                        </Td>
                        <Td>{parseDateTime(trade.dateTime).date}</Td>
                        <NumberTd value={Math.abs(trade.quantity)} />
                        <MoneyTd value={trade.tPrice} />
                        <MoneyTd value={trade.proceeds} />
                        <MoneyTd value={trade.commFee} />
                        <MoneyTd value={trade.realizedPL} colored />
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr className={styles.totalRow}>
                    <Td bold>Total</Td>
                    <Td />
                    <NumberTd value={totalAllTradesQty} bold />
                    <Td />
                    <MoneyTd value={totalAllTradesProceeds} bold />
                    <MoneyTd value={totalAllTradesFees} bold />
                    <MoneyTd value={totalAllTradesRealizedPL} colored bold />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}

      {/* Dividends */}
      {dividends.length > 0 && (
        <>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Dividends</h3>
          </div>
          <div className={styles.tableCard}>
            <table className={styles.eventsTable}>
              <thead>
                <tr>
                  <Th>Type</Th>
                  <Th>Date</Th>
                  <Th align="right">Quantity</Th>
                  <Th align="right">Per Share</Th>
                  <Th align="right">Amount</Th>
                </tr>
              </thead>
              <tbody>
                {[...dividends]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((div, idx) => (
                    <tr key={`div-${idx}`}>
                      <Td>
                        <TypeBadge type="DIVIDEND" />
                      </Td>
                      <Td>{parseDateTime(div.date).date}</Td>
                      <NumberTd value={div.quantity} />
                      <MoneyTd value={div.perShare} />
                      <MoneyTd value={div.amount} colored />
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className={styles.totalRow}>
                  <Td bold>Total</Td>
                  <Td />
                  <Td />
                  <Td />
                  <MoneyTd value={totalDividendsAmount} colored bold />
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {/* Other Events (Splits) */}
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Other Events (Splits)</h3>
      </div>
      {splits.length > 0 && (
        <div className={styles.tableCard}>
          <table className={styles.eventsTable}>
            <thead>
              <tr>
                <Th>Type</Th>
                <Th>Date</Th>
                <Th>Symbol</Th>
                <Th>Ratio</Th>
                <Th>Description</Th>
              </tr>
            </thead>
            <tbody>
              {[...splits]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((split, idx) => (
                  <tr key={`split-${idx}`}>
                    <Td>
                      <TypeBadge type="SPLIT" />
                    </Td>
                    <Td>{parseDateTime(split.date).date}</Td>
                    <Td>{split.symbol}</Td>
                    <Td>{split.ratio} for 1</Td>
                    <Td>Stock Split</Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

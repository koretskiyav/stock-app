import { useState } from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';
import { type Trade, type Dividend, type Split } from '../../services/parser';
import { type TickerSummary, type Lot } from '../../store/selectors';
import { Th, Td, MoneyTd, NumberTd, OverviewCard, OverviewGrid } from '../ui';
import styles from './TickerDetails.module.css';
import { formatMoney, formatNumber, formatPercent } from '../../utils/format';

const parseDateTime = (dateTime: string) => {
  const parts = dateTime.split(',');
  return {
    date: parts[0]?.trim() || '',
    time: parts[1]?.trim() || '',
  };
};

const TypeBadge = ({ type }: { type: 'BUY' | 'SELL' | 'DIVIDEND' | 'SPLIT' | 'SPINOFF' }) => (
  <span className={cn(styles.typeBadge, styles[`type_${type}`])}>{type}</span>
);

export interface TickerDetailsProps {
  symbol: string;
  backUrl: string;
  trades: Trade[];
  dividends: Dividend[];
  splits: Split[];
  openLots: Lot[];
  soldLots: Lot[];
  summary?: TickerSummary;
  lotTotals: {
    openQty: number;
    openCostBasis: number;
    openUnrealizedPL: number;
    soldQty: number;
    soldRealizedPL: number;
  };
  tradeTotals: {
    allTradesQty: number;
    allTradesProceeds: number;
    allTradesFees: number;
    allTradesRealizedPL: number;
    totalDividends: number;
  };
}

export const TickerDetails = ({
  symbol,
  backUrl,
  trades,
  dividends,
  splits,
  openLots,
  soldLots,
  summary,
  lotTotals,
  tradeTotals,
}: TickerDetailsProps) => {
  const [showAllTrades, setShowAllTrades] = useState(false);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to={backUrl} className={styles.backLink}>
          &larr; Back to Portfolio
        </Link>
        <h1>Details for {symbol}</h1>
      </header>

      <div className={styles.detailsContent}>
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
              label="Day Change %"
              value={formatPercent(summary.dailyChangePercent || 0)}
              colorType={
                (summary.dailyChangePercent || 0) > 0
                  ? 'green'
                  : (summary.dailyChangePercent || 0) < 0
                    ? 'red'
                    : undefined
              }
            />
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
                    <NumberTd value={lotTotals.openQty} bold />
                    <Td />
                    <MoneyTd value={lotTotals.openCostBasis} bold />
                    <Td />
                    <MoneyTd value={lotTotals.openUnrealizedPL} colored bold />
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
                    <NumberTd value={lotTotals.soldQty} bold />
                    <Td />
                    <Td />
                    <MoneyTd value={lotTotals.soldRealizedPL} colored bold />
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
                            <TypeBadge
                              type={
                                trade.tPrice === 0 && trade.proceeds === 0
                                  ? 'SPINOFF'
                                  : trade.quantity > 0
                                    ? 'BUY'
                                    : 'SELL'
                              }
                            />
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
                      <NumberTd value={tradeTotals.allTradesQty} bold />
                      <Td />
                      <MoneyTd value={tradeTotals.allTradesProceeds} bold />
                      <MoneyTd value={tradeTotals.allTradesFees} bold />
                      <MoneyTd value={tradeTotals.allTradesRealizedPL} colored bold />
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
                    <MoneyTd value={tradeTotals.totalDividends} colored bold />
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
    </div>
  );
};

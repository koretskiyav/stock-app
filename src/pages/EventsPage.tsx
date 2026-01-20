import { useParams, Link, useSearchParams } from 'react-router-dom';
import { trades as allTrades } from '../data/trades';
import { dividends as allDividends } from '../data/dividends';
import { splits as allSplits } from '../data/splits';
import { Events } from '../components/Events/Events';
import styles from './EventsPage.module.css';

export const EventsPage = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [searchParams] = useSearchParams();

  if (!symbol) {
    return <div>Symbol not found</div>;
  }

  const trades = allTrades.filter((t) => t.symbol === symbol);
  const dividends = allDividends.filter((d) => d.symbol === symbol);
  const splits = allSplits.filter((s) => s.symbol === symbol);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to={`/?${searchParams.toString()}`} className={styles.backLink}>
          &larr; Back to Portfolio
        </Link>
        <h1>Events for {symbol}</h1>
      </header>
      <Events trades={trades} dividends={dividends} splits={splits} />
    </div>
  );
};

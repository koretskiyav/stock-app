import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { trades as allTrades } from "../data/trades";
import { Trades } from "../components/Trades/Trades";
import styles from "./TradeDetailsPage.module.css";

export const TradeDetailsPage = () => {
  const { symbol } = useParams<{ symbol: string }>();

  const trades = useMemo(() => {
    if (!symbol) return [];
    return allTrades.filter((t) => t.symbol === symbol);
  }, [symbol]);

  if (!symbol) {
    return <div>Symbol not found</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/" className={styles.backLink}>
          &larr; Back to Portfolio
        </Link>
        <h1>Trades for {symbol}</h1>
      </header>
      <Trades trades={trades} />
    </div>
  );
};

import { useMemo, useState } from "react";
import "./App.css";

import { trades as allTrades } from "./data";
import { Trades } from "./components/Trades/Trades";

const symbols = [...new Set(allTrades.map((trade) => trade.symbol))].sort();

function App() {
  const [symbol, setSymbol] = useState("");
  const trades = useMemo(
    () => allTrades.filter((trade) => trade.symbol === symbol),
    [symbol]
  );

  return (
    <>
      <h1>{symbol}</h1>
        {symbols.map((s) => (
          <button key={s} onClick={() => setSymbol(s)}>
            {s}
          </button>
        ))}
      {trades.length > 0 && <Trades trades={trades} />}
    </>
  );
}

export default App;

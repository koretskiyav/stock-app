import { trades } from "./data/trades";
import { PortfolioSummary } from "./components/PortfolioSummary/PortfolioSummary";

function App() {
  return <PortfolioSummary trades={trades} />;
}

export default App;

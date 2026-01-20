import { trades } from '../data/trades';
import { PortfolioSummary } from '../components/PortfolioSummary/PortfolioSummary';

export const HomePage = () => {
  return <PortfolioSummary trades={trades} />;
};

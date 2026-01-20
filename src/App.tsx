import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { TradeDetailsPage } from './pages/TradeDetailsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trades/:symbol" element={<TradeDetailsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

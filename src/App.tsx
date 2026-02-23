import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { TickerDetailsPage } from './pages/TickerDetailsPage';
import { AppStoreProvider } from './store/AppStoreProvider';
import { parseStatements, getAllStatementContents } from './services/parser';

const initialData = parseStatements(getAllStatementContents());

function App() {
  return (
    <AppStoreProvider initialData={initialData}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/details/:symbol" element={<TickerDetailsPage />} />
        </Routes>
      </BrowserRouter>
    </AppStoreProvider>
  );
}

export default App;

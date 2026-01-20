import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events/:symbol" element={<EventsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

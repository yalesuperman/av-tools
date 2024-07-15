import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';

import './styles/index.scss';
import Home from './Home';
import Analyse from './Analyse';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/h264-analayse" element={<Analyse />} />
      </Routes>
    </Router>
  );
}

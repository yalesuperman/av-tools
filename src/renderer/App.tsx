import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';
import Analyse from './Analyse';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Analyse />} />
      </Routes>
    </Router>
  );
}

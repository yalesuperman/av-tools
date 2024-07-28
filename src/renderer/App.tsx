import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';

import './styles/index.scss';
import Home from './Home';
import Analyse from './Analyse';
import EditMedia from './EditMedia';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/edit-media" element={<EditMedia />} />
        <Route path="/h264-analayse" element={<Analyse />} />
      </Routes>
    </Router>
  );
}

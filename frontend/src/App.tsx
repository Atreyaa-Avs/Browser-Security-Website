import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Content from './pages/Content';
import Lab from './pages/Lab';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/content" element={<Content />} />
      <Route path="/lab" element={<Lab />} />
    </Routes>
  );
}


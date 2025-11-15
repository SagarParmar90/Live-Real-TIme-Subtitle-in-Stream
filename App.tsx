
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ControlPage from './components/ControlPage';
import DisplayPage from './components/DisplayPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/control/:streamId" element={<ControlPage />} />
        <Route path="/display/:streamId" element={<DisplayPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;

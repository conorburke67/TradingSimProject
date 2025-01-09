import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
// import { Home, Portfolio, Market } from './pages'
import TopBar from './components/TopBar';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Market from './pages/Market';

function App() {

  return (
    <Router>
      <TopBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/market" element={<Market />} />
      </Routes>
    </Router>
  );
}

export default App;

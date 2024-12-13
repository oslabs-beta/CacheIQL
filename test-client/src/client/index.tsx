import React from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './components/Dashboard';
import './styles/characterCard.scss';
import './styles/dashboard.scss';
import './styles/time.scss';

const App = () => {
  return (
    <div>
      <Dashboard />
    </div>
  );
};

createRoot(document.querySelector('#root')!).render(<App />);

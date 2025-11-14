import React from 'react';
import ReactDOM from 'react-dom/client';
import FitnessAssistant from './FitnessAssistant.jsx';

// Montar el componente en el DOM
const root = ReactDOM.createRoot(document.getElementById('fitness-assistant-root'));
root.render(
  <React.StrictMode>
    <FitnessAssistant />
  </React.StrictMode>
);

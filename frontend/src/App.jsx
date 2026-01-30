import React from 'react';
import TransactionManager from './components/TransactionManager';
import './App.css';

function App() {
  // Default token - no authentication required
  const token = 'admin123';

  const handleLogout = () => {
    // Just refresh the page on logout
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <TransactionManager token={token} onLogout={handleLogout} />
    </div>
  );
}

export default App;

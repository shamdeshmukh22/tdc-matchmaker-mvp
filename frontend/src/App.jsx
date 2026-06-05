import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('tdc_isAuthenticated') === 'true';
  });

  const handleLogin = () => {
    localStorage.setItem('tdc_isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('tdc_isAuthenticated');
    setIsAuthenticated(false);
  };

  return isAuthenticated
    ? <Dashboard onLogout={handleLogout} />
    : <Login onLogin={handleLogin} />;
}

export default App;

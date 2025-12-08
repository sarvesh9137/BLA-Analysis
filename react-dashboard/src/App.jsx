import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persistent login if desired, 
    // for now just simple state as per request (session based)
    // But "Simple Session State" usually implies per-browser-session. 
    // React state resets on refresh. 
    // If we want it to persist purely on refresh, we can use sessionStorage.
    const loggedIn = sessionStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    sessionStorage.setItem('isLoggedIn', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    setIsAuthenticated(false);
  };

  if (isLoading) return null;

  return (
    <div className="bg-slate-50 min-h-screen font-poppins text-slate-800">
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;

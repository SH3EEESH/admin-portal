import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Home from './pages/Home';
import Team from './pages/Team';
import Dashboard from './pages/Dashboard';
import AuditLogs from './pages/AuditLogs';
import Login from './pages/Login.jsx';
import Register from './pages/Register';
import UserHub from './pages/UserHub';
import AccessDenied from './pages/AccessDenied';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Retrieve user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (loggedUser, token) => {
    setUser(loggedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div style={{ color: '#8b949e', padding: '20px', fontFamily: 'monospace' }}>Loading session...</div>;
  }

  const isAdmin = user && user.role === 'Admin';

  return (
    <Router>
      <div style={styles.appContainer}>
        {/* Navigation bar is visible only when logged in */}
        {user && <NavigationBar user={user} />} 
        
        <div style={styles.layoutContainer}>
          {/* Side panel for user profile info */}
          {user && (
            <div style={styles.sidebar}>
              <h2 style={styles.logo}>Sentinel IAM</h2>
              <div style={styles.userInfo}>
                <span style={styles.username}>{user.username}</span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: isAdmin ? '#3ebd28' : '#58a6ff',
                  fontWeight: 'bold'
                }}>{user.role}</span>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                  Logout
                </button>
              </div>
            </div>
          )}

          {/* Main page router */}
          <div style={styles.main}>
            <Routes>
              {!user ? (
                <>
                  <Route path="/login" element={<Login onLogin={handleLogin} />} />
                  <Route path="/register" element={<Register onLogin={handleLogin} />} />
                  <Route path="/" element={<Login onLogin={handleLogin} />} />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </>
              ) : (
                <>
                  <Route path="/access-denied" element={<AccessDenied />} />
                  {!isAdmin ? (
                    <>
                      <Route path="/user-hub" element={<UserHub />} />
                      <Route path="*" element={<Navigate to="/user-hub" replace />} />
                    </>
                  ) : (
                    <>
                      <Route path="/" element={<Home />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/logs" element={<AuditLogs />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </>
                  )}
                </>
              )}
            </Routes>
          </div>
          
        </div>
      </div>
    </Router>
  );
}

const styles = {
  appContainer: {
    backgroundColor: '#010409',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  layoutContainer: {
    display: 'flex',
    flex: 1,
    height: 'calc(100vh - 60px)',
    overflow: 'hidden'
  },
  sidebar: { 
    width: '240px', 
    backgroundColor: '#0d1117', 
    padding: '20px', 
    borderRight: '1px solid #30363d',
    display: 'flex',
    flexDirection: 'column'
  },
  logo: { 
    color: '#ffffff', 
    fontSize: '1.2rem', 
    marginBottom: '20px', 
    marginTop: 0,
    fontFamily: 'monospace',
    fontWeight: 'bold'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingBottom: '15px',
    borderBottom: '1px solid #30363d'
  },
  username: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontFamily: 'monospace'
  },
  logoutBtn: {
    backgroundColor: '#21262d',
    color: '#f85149',
    border: '1px solid #30363d',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    width: '100%',
    fontWeight: 'bold'
  },
  main: { 
    flex: 1, 
    padding: '30px 40px', 
    overflowY: 'auto' 
  }
};

export default App;

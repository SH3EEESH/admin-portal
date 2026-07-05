import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Home from './pages/Home';
import Team from './pages/Team';
import Dashboard from './pages/Dashboard';
import AuditLogs from './pages/AuditLogs';

function App() {
  return (
    <Router>
      <div style={styles.appContainer}>
        {/* The navigation bar stays visible across all pages */}
        <NavigationBar /> 
        
        {/* Main layout with sidebar and content area */}
        <div style={styles.layoutContainer}>
          
          {/* Side panel for project status and branding */}
          <div style={styles.sidebar}>
            <h2 style={styles.logo}>Sentinel IAM</h2>
            <div style={styles.inDevelopment}>
              (in development for final project)
            </div>
          </div>

          {/* Page content changes based on the active route */}
          <div style={styles.main}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/team" element={<Team />} />
              <Route path="/logs" element={<AuditLogs />} />
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
    width: '250px', 
    backgroundColor: '#0d1117', 
    padding: '30px 20px', 
    borderRight: '1px solid #30363d',
    display: 'flex',
    flexDirection: 'column'
  },
  logo: { 
    color: '#ffffff', 
    fontSize: '1.4rem', 
    marginBottom: '20px', 
    marginTop: 0,
    fontFamily: 'monospace',
    fontWeight: 'bold'
  },
  inDevelopment: {
    color: '#8b949e',
    fontStyle: 'italic',
    fontSize: '0.85rem',
    fontFamily: 'monospace',
    lineHeight: '1.4',
    borderTop: '1px solid #30363d',
    paddingTop: '15px',
    marginTop: '10px'
  },
  main: { 
    flex: 1, 
    padding: '40px 50px', 
    overflowY: 'auto' 
  }
};

export default App;
import React from 'react';

function Home() {
  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Sentinel Authentication</h1>
        <span style={styles.statusBadge}>● Secure</span>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <span style={styles.activeTab}>Overview</span>
      </div>

      {/* 2-Column Grid */}
      <div style={styles.grid}>
        
        {/* Left Column: System & Services */}
        <div style={styles.columnWrapper}>
          <div style={styles.colHeader}>
            <h3 style={styles.columnTitle}>System & Services</h3>
          </div>
          
          {/* Card 1: Core Health */}
          <div style={styles.card}>
            <div style={styles.cardTop}>
              <strong style={styles.cardTitle}>🖥️ Core Health</strong>
            </div>
            <div style={styles.cardBottom}>
              <div style={styles.row}>
                <span>Status</span>
                <span style={{ color: '#3ebd28', fontWeight: 'bold' }}>All Systems Operational</span>
              </div>
              <div style={styles.row}>
                <span>Uptime</span>
                <span style={styles.value}>99.98%</span>
              </div>
              <div style={styles.row}>
                <span>Active JWT Sessions</span>
                <span style={styles.value}>142</span>
              </div>
            </div>
          </div>

          {/* Card 2: Infrastructure Connections */}
          <div style={styles.card}>
            <div style={styles.cardTop}>
              <strong style={styles.cardTitle}>🔌 Infrastructure Connections</strong>
            </div>
            <div style={styles.cardBottom}>
              <div style={styles.row}>
                <span>PostgreSQL Database</span>
                <span style={{ color: '#3ebd28', fontWeight: 'bold' }}>Connected</span>
              </div>
              <div style={styles.row}>
                <span>Node.js API Server</span>
                <span style={{ color: '#3ebd28', fontWeight: 'bold' }}>Connected</span>
              </div>
              <div style={styles.row}>
                <span>Firewall Rules</span>
                <span style={{ color: '#3ebd28', fontWeight: 'bold' }}>Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security Monitoring */}
        <div style={styles.columnWrapper}>
          <div style={styles.colHeader}>
            <h3 style={styles.columnTitle}>Security Monitoring</h3>
          </div>

          {/* Card 3: Live Alerts */}
          <div style={styles.card}>
            <div style={styles.cardTop}>
              <strong style={styles.cardTitle}>⚠️ Live Alerts</strong>
            </div>
            <div style={styles.cardBottom}>
              <div style={styles.row}>
                <span>Failed Logins (1h)</span>
                <span style={{ color: '#f8e300', fontWeight: 'bold' }}>3 Failed</span>
              </div>
              <div style={styles.row}>
                <span>IP Address Blocks</span>
                <span style={{ color: '#f85149', fontWeight: 'bold' }}>1 Blocked (10.0.0.12)</span>
              </div>
              <div style={styles.row}>
                <span>Last Audit Scan</span>
                <span style={styles.value}>2 mins ago</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  header: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '15px', 
    marginBottom: '25px' 
  },
  title: { 
    margin: 0, 
    fontSize: '2.2rem', 
    fontWeight: 'bold',
    color: '#3ebd28',
    fontFamily: 'monospace'
  },
  statusBadge: { 
    backgroundColor: 'rgba(62, 189, 40, 0.15)', 
    color: '#3ebd28', 
    padding: '6px 12px', 
    borderRadius: '20px', 
    fontSize: '0.85rem', 
    fontWeight: 'bold' 
  },
  tabs: { 
    borderBottom: '1px solid #30363d', 
    paddingBottom: '0px', 
    marginBottom: '30px', 
    display: 'flex', 
    gap: '30px' 
  },
  activeTab: { 
    color: '#3ebd28', 
    fontWeight: 'bold', 
    borderBottom: '2px solid #3ebd28', 
    paddingBottom: '12px', 
    cursor: 'pointer' 
  },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '30px' 
  },
  columnWrapper: { 
    backgroundColor: '#161b22', 
    padding: '25px', 
    borderRadius: '6px',
    border: '1px solid #30363d'
  },
  colHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '20px' 
  },
  columnTitle: {
    margin: 0,
    color: '#ffffff',
    fontFamily: 'monospace',
    fontSize: '1.2rem'
  },
  card: { 
    backgroundColor: '#0d1117', 
    border: '1px solid #30363d', 
    borderRadius: '6px', 
    marginBottom: '15px' 
  },
  cardTop: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '15px 20px', 
    borderBottom: '1px solid #30363d' 
  },
  cardTitle: {
    color: '#58a6ff'
  },
  cardBottom: { 
    padding: '15px 20px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px', 
    color: '#8b949e', 
    fontSize: '0.9rem' 
  },
  row: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    borderBottom: '1px dashed #30363d', 
    paddingBottom: '8px' 
  },
  value: { 
    color: '#ffffff', 
    fontWeight: 'bold' 
  }
};

export default Home;
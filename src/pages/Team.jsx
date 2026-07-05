import React from 'react';

function Team() {
  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>MLZH Productions</h1>
        <span style={styles.statusBadge}>● 4 Members</span>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <span style={styles.activeTab}>Architecture Team</span>
      </div>

      {/* 2-Column Grid */}
      <div style={styles.grid}>
        
        {/* Left Column: Backend & Security */}
        <div style={styles.columnWrapper}>
          <div style={styles.colHeader}>
            <h3 style={styles.columnTitle}>Backend & Security</h3>
          </div>
          
          {/* Mihail Stegall */}
          <div style={styles.card}>
            <div style={styles.cardTop}>
              <strong style={styles.cardTitle}>👤 Mihail Stegall</strong>
              <span style={styles.btnLabel}>Database Architect</span>
            </div>
            <div style={styles.cardBottom}>
              <div style={styles.row}>
                <span>Primary Focus</span>
                <span style={styles.value}>PostgreSQL Schema</span>
              </div>
              <div style={styles.row}>
                <span>Infrastructure</span>
                <span style={styles.value}>IAM & Security</span>
              </div>
            </div>
          </div>

          {/* Zachary Dinkelman */}
          <div style={styles.card}>
            <div style={styles.cardTop}>
              <strong style={styles.cardTitle}>👤 Zachary Dinkelman</strong>
              <span style={styles.btnLabel}>Backend Lead</span>
            </div>
            <div style={styles.cardBottom}>
              <div style={styles.row}>
                <span>Primary Focus</span>
                <span style={styles.value}>Node.js / Express</span>
              </div>
              <div style={styles.row}>
                <span>Authentication</span>
                <span style={styles.value}>Auth Middleware & JWTs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Frontend UI/UX */}
        <div style={styles.columnWrapper}>
          <div style={styles.colHeader}>
            <h3 style={styles.columnTitle}>Frontend UI/UX</h3>
          </div>

          {/* Teammate L */}
          <div style={styles.card}>
            <div style={styles.cardTop}>
              <strong style={styles.cardTitle}>👤 Teammate L</strong>
              <span style={styles.btnLabel}>UI Engineer</span>
            </div>
            <div style={styles.cardBottom}>
              <div style={styles.row}>
                <span>Primary Focus</span>
                <span style={styles.value}>React UI/UX</span>
              </div>
              <div style={styles.row}>
                <span>Integration</span>
                <span style={styles.value}>External API Integration</span>
              </div>
            </div>
          </div>

          {/* Teammate H */}
          <div style={styles.card}>
            <div style={styles.cardTop}>
              <strong style={styles.cardTitle}>👤 Teammate H</strong>
              <span style={styles.btnLabel}>State Specialist</span>
            </div>
            <div style={styles.cardBottom}>
              <div style={styles.row}>
                <span>Primary Focus</span>
                <span style={styles.value}>React Router</span>
              </div>
              <div style={styles.row}>
                <span>State Management</span>
                <span style={styles.value}>Application State</span>
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
  btnLabel: { 
    backgroundColor: '#21262d', 
    color: '#8b949e', 
    border: '1px solid #30363d', 
    padding: '6px 12px', 
    borderRadius: '6px', 
    fontSize: '0.8rem',
    fontWeight: 'bold',
    fontFamily: 'monospace'
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

export default Team;
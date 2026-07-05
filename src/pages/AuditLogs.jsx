import React, { useState, useEffect } from 'react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/DefaultAuditLogs.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load audit logs.');
        }
        return response.json();
      })
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Helper to color action badges
  const getActionStyle = (action) => {
    if (action.includes('SUCCESS')) {
      return { backgroundColor: 'rgba(62, 189, 40, 0.15)', color: '#3ebd28' };
    } else if (action.includes('ATTEMPT') || action.includes('FAILED') || action.includes('UNAUTHORIZED') || action.includes('BLOCKED')) {
      return { backgroundColor: 'rgba(248, 81, 73, 0.15)', color: '#f85149' };
    } else {
      return { backgroundColor: 'rgba(88, 166, 255, 0.15)', color: '#58a6ff' };
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Audit Logs</h1>
        <span style={styles.statusBadge}>● Realtime</span>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <span style={styles.activeTab}>System Events</span>
      </div>

      {/* Main Grid Wrapper */}
      <div style={styles.columnWrapper}>
        <div style={styles.colHeader}>
          <h3 style={styles.columnTitle}>Recent Authentication Events</h3>
        </div>

        {loading && <div style={styles.message}>Loading logs...</div>}
        {error && <div style={{ ...styles.message, color: '#f85149' }}>Error: {error}</div>}

        {!loading && !error && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.headerRow}>
                  <th style={styles.th}>Timestamp</th>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Action</th>
                  <th style={styles.th}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={styles.row}>
                    <td style={styles.tdTimestamp}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={styles.tdUser}>
                      <strong>{log.user}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...getActionStyle(log.action) }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={styles.tdIP}>{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
  columnWrapper: { 
    backgroundColor: '#161b22', 
    padding: '25px', 
    borderRadius: '6px',
    border: '1px solid #30363d'
  },
  colHeader: { 
    marginBottom: '20px' 
  },
  columnTitle: {
    margin: 0,
    color: '#ffffff',
    fontFamily: 'monospace',
    fontSize: '1.2rem'
  },
  message: {
    color: '#8b949e',
    fontFamily: 'monospace',
    padding: '20px 0',
    textAlign: 'center'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: 'sans-serif',
    fontSize: '0.9rem',
    color: '#c9d1d9'
  },
  headerRow: {
    borderBottom: '2px solid #30363d'
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    color: '#8b949e',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    fontSize: '0.8rem',
    letterSpacing: '0.5px'
  },
  row: {
    borderBottom: '1px solid #21262d',
    transition: 'background-color 0.2s ease-in-out'
  },
  td: {
    padding: '16px',
    verticalAlign: 'middle'
  },
  tdTimestamp: {
    padding: '16px',
    fontFamily: 'monospace',
    color: '#8b949e'
  },
  tdUser: {
    padding: '16px',
    color: '#ffffff'
  },
  tdIP: {
    padding: '16px',
    fontFamily: 'monospace',
    color: '#58a6ff'
  },
  badge: {
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    display: 'inline-block'
  }
};

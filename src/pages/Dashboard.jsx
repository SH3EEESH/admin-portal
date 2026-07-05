import React, { useState } from 'react';

function Dashboard() {
  // Store the list of active access roles shown in the left column
  const [roles, setRoles] = useState([
    { id: 1, name: 'System Administrators', users: 4, level: 'Full Access', isFullAccess: true },
    { id: 2, name: 'Standard Users', users: 131, level: 'Restricted', isFullAccess: false }
  ]);

  // Store the list of connected infrastructure nodes shown in the right column
  const [nodes, setNodes] = useState([
    { id: 1, name: 'Primary Auth Database', flag: '🇺🇸', ip: '101.103.255.255', hostname: 'db-01.sentinel.local', load: '12%' }
  ]);

  // Track which card is currently hovered so its visual style can change
  const [hoveredCardId, setHoveredCardId] = useState(null);

  // Remove a role card from the list when the user clicks Remove
  const handleRemoveRole = (id) => {
    setRoles(roles.filter(role => role.id !== id));
  };

  // Remove a node card from the list when the user clicks Remove
  const handleRemoveNode = (id) => {
    setNodes(nodes.filter(node => node.id !== id));
  };

  // Apply the hover style only to the card that is currently being hovered
  const cardStyle = (id) => hoveredCardId === id ? { ...styles.card, ...styles.cardHover } : styles.card;

  return (
    <div>
      {/* Top section with the page title and current status badge */}
      <div style={styles.header}>
        <h1 style={styles.title}>Headquarters</h1>
        <span style={styles.statusBadge}>● Active</span>
      </div>

      {/* Current dashboard section tab shown below the header */}
      <div style={styles.tabs}>
        <span style={styles.activeTab}>General</span>
      </div>

      {/* Main dashboard layout split into two side-by-side sections */}
      <div style={styles.grid}>
        
        {/* Left column for displaying and managing active roles */}
        <div style={styles.columnWrapper}>
          <div style={styles.colHeader}>
            <h3 style={styles.columnTitle}>Active Roles</h3>
          </div>
          
          {/* Render one card for each active role in the list */}
          {roles.map(role => (
            <div
              key={role.id}
              style={cardStyle(role.id)}
              // Show hover feedback when the user moves over a role card
              onMouseEnter={() => setHoveredCardId(role.id)}
              // Reset the hover state when the cursor leaves the card
              onMouseLeave={() => setHoveredCardId(null)}
            >
              <div style={styles.cardTop}>
                <strong style={styles.cardTitle}>👥 {role.name}</strong>
                <button style={styles.btn} onClick={() => handleRemoveRole(role.id)}>Remove</button>
              </div>
              <div style={styles.cardBottom}>
                <div style={styles.row}><span>Assigned Users</span><span style={styles.value}>{role.users}</span></div>
                <div style={styles.row}>
                  <span>Permission Level</span>
                  <span style={{ color: role.isFullAccess ? '#3ebd28' : '#ffffff', fontWeight: 'bold' }}>
                    {role.level}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {/* Show a message if there are no roles left to display */}
          {roles.length === 0 && (
            <div style={{ color: '#8b949e', fontStyle: 'italic', padding: '10px 0', fontFamily: 'monospace' }}>
              No active roles.
            </div>
          )}
        </div>

        {/* Right column for displaying connected infrastructure nodes */}
        <div style={styles.columnWrapper}>
          <div style={styles.colHeader}>
            <h3 style={styles.columnTitle}>Connected Nodes</h3>
          </div>

          {/* Render one card for each connected node in the list */}
          {nodes.map(node => (
            <div
              key={node.id}
              style={cardStyle(node.id)}
              // Show hover feedback when the user moves over a node card
              onMouseEnter={() => setHoveredCardId(node.id)}
              // Clear the hover state when the cursor leaves the node card
              onMouseLeave={() => setHoveredCardId(null)}
            >
              <div style={styles.cardTop}>
                <strong style={styles.cardTitle}>{node.flag} {node.name}</strong>
                <button style={styles.btn} onClick={() => handleRemoveNode(node.id)}>Remove</button>
              </div>
              <div style={styles.cardBottom}>
                <div style={styles.row}><span>IP Address</span><span style={styles.valueCode}>{node.ip}</span></div>
                <div style={styles.row}><span>Hostname</span><span style={styles.valueCode}>{node.hostname}</span></div>
                <div style={styles.row}><span>Server load</span><span style={{ color: '#3ebd28', fontWeight: 'bold' }}>● {node.load}</span></div>
              </div>
            </div>
          ))}
          {/* Show a message if there are no nodes left to display */}
          {nodes.length === 0 && (
            <div style={{ color: '#8b949e', fontStyle: 'italic', padding: '10px 0', fontFamily: 'monospace' }}>
              No connected nodes.
            </div>
          )}
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
    marginBottom: '15px',
    transition: 'all 0.2s ease-in-out' 
  },
  cardHover: {
    transform: 'translateY(-2px)',
    borderColor: '#58a6ff',
    boxShadow: '0 8px 20px rgba(88, 166, 255, 0.12)'
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
  btn: { 
    backgroundColor: '#21262d', 
    color: '#c9d1d9', 
    border: '1px solid #30363d', 
    padding: '6px 12px', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontSize: '0.85rem' 
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
  },
  valueCode: { 
    color: '#ffffff', 
    fontFamily: 'monospace' 
  }
};

export default Dashboard;

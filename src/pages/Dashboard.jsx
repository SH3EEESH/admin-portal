import React, { useState, useEffect } from 'react';

// Admin dashboard page
function Dashboard() {
  const [roles, setRoles] = useState([
    { id: 1, name: 'System Administrators', users: 1, level: 'Full Access', isFullAccess: true },
    { id: 2, name: 'Standard Users', users: 7, level: 'Restricted', isFullAccess: false }
  ]);

  // Initial connected nodes list
  const initialNodesList = [
    { id: 1, name: 'Primary Auth Database', ip: 'localhost:5432', hostname: 'postgres-db.sentinel.local', status: 'Online' },
    { id: 2, name: 'Secondary Backup Node', ip: '192.168.1.105', hostname: 'backup.sentinel.local', status: 'Online' },
    { id: 3, name: 'Audit Logging Ingestion Server', ip: '192.168.1.50', hostname: 'audit-log.sentinel.local', status: 'Online' },
    { id: 4, name: 'Edge Security Firewall Node', ip: '10.0.0.12', hostname: 'firewall.sentinel.local', status: 'Online' }
  ];

  const [nodes, setNodes] = useState(() => {
    const saved = localStorage.getItem('sentinel_connected_nodes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return initialNodesList;
  });

  // Initial seed of accounts (MLZH_admin, jdoe, sys_service) so table is never empty
  const initialAccountsList = [
    { id: 1, username: 'MLZH_admin', email: 'admin@sentinel.local', role_id: 1, role_name: 'Admin', created_at: '2026-07-05 10:00:00' },
    { id: 2, username: 'jdoe', email: 'john@gmail.com', role_id: 2, role_name: 'User', created_at: '2026-08-01 14:20:00' },
    { id: 3, username: 'sys_service', email: 'sys@sentinel.local', role_id: 2, role_name: 'User', created_at: '2026-08-02 09:15:00' }
  ];

  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('sentinel_active_accounts');
    const storedUser = localStorage.getItem('user');
    let list = initialAccountsList;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
      } catch (e) {}
    }

    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.username && !list.some(a => a.username === u.username)) {
          list = [
            ...list,
            {
              id: u.id || Date.now(),
              username: u.username,
              email: u.email || `${u.username}@gmail.com`,
              role_id: u.role === 'Admin' ? 1 : 2,
              role_name: u.role || 'User',
              created_at: new Date().toISOString()
            }
          ];
        }
      } catch (e) {}
    }

    return list;
  });

  const [feedbacks, setFeedbacks] = useState([]);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [notification, setNotification] = useState('');

  // Fetch initial dashboard stats, nodes, user accounts, and feedback
  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    // Fetch system stats
    fetch('/api/stats', { headers })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (data.users) {
          setRoles(prevRoles => prevRoles.map(role => {
            if (role.id === 1) return { ...role, users: data.users.admins };
            if (role.id === 2) return { ...role, users: data.users.standards };
            return role;
          }));
        }
      })
      .catch(() => {});

    // Fetch connected nodes
    fetch('/api/nodes', { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setNodes(data);
          localStorage.setItem('sentinel_connected_nodes', JSON.stringify(data));
        } else {
          setNodes(initialNodesList);
        }
      })
      .catch(() => {
        setNodes(initialNodesList);
      });

    // Fetch active user accounts from server database and merge
    fetch('/api/users', { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const combinedMap = new Map();
          initialAccountsList.forEach(a => combinedMap.set(a.username, a));
          data.forEach(u => {
            combinedMap.set(u.username, {
              id: u.id,
              username: u.username,
              email: u.email,
              role_id: u.role_id,
              role_name: u.role_name || (u.role_id === 1 ? 'Admin' : 'User'),
              created_at: u.created_at || new Date().toISOString()
            });
          });
          const merged = Array.from(combinedMap.values());
          setAccounts(merged);
          localStorage.setItem('sentinel_active_accounts', JSON.stringify(merged));
        }
      })
      .catch(() => {});

    // Fetch submitted user feedback
    const localFeedbacks = JSON.parse(localStorage.getItem('sentinel_feedback_list') || '[]');
    fetch('/api/feedback', { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const serverFb = Array.isArray(data) ? data : [];
        const combined = [...localFeedbacks, ...serverFb];
        const uniqueMap = new Map();
        combined.forEach(item => {
          const key = `${item.username}-${item.message}`;
          if (!uniqueMap.has(key)) uniqueMap.set(key, item);
        });
        setFeedbacks(Array.from(uniqueMap.values()));
      })
      .catch(() => {
        setFeedbacks(localFeedbacks);
      });
  }, []);

  // Remove a role card
  const handleRemoveRole = (id) => {
    setRoles(roles.filter(role => role.id !== id));
  };

  // Decommission a node
  const handleRemoveNode = (id) => {
    const updatedNodes = nodes.filter(node => node.id !== id);
    setNodes(updatedNodes);
    localStorage.setItem('sentinel_connected_nodes', JSON.stringify(updatedNodes));

    const token = localStorage.getItem('token');
    fetch(`/api/nodes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).catch(() => {});
  };

  // Toggle user role permissions (Edit Permissions)
  const handleToggleRole = (userId, currentRoleId, username) => {
    const token = localStorage.getItem('token');
    const newRoleId = currentRoleId === 1 ? 2 : 1;
    const newRoleName = newRoleId === 1 ? 'Admin' : 'User';

    const updatedAccounts = accounts.map(acc => 
      acc.id === userId || acc.username === username 
        ? { ...acc, role_id: newRoleId, role_name: newRoleName } 
        : acc
    );

    setAccounts(updatedAccounts);
    localStorage.setItem('sentinel_active_accounts', JSON.stringify(updatedAccounts));

    // Sync session user if toggled user matches current logged-in session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const currentUserObj = JSON.parse(storedUser);
        if (currentUserObj.username === username) {
          const updatedSessionUser = { ...currentUserObj, role: newRoleName, role_id: newRoleId };
          localStorage.setItem('user', JSON.stringify(updatedSessionUser));
          window.dispatchEvent(new Event('storage'));
        }
      } catch (e) {}
    }

    const adminCount = updatedAccounts.filter(a => a.role_name === 'Admin').length;
    const userCount = updatedAccounts.filter(a => a.role_name === 'User').length;
    setRoles([
      { id: 1, name: 'System Administrators', users: adminCount, level: 'Full Access', isFullAccess: true },
      { id: 2, name: 'Standard Users', users: userCount, level: 'Restricted', isFullAccess: false }
    ]);

    setNotification(`Permissions updated! User '${username}' is now '${newRoleName}'.`);
    setTimeout(() => setNotification(''), 3500);

    fetch(`/api/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role_id: newRoleId })
    }).catch(err => console.log('Role updated locally:', err));
  };

  const cardStyle = (id) => hoveredCardId === id ? { ...styles.card, ...styles.cardHover } : styles.card;

  return (
    <div>
      {/* Page Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Headquarters</h1>
        <span style={styles.statusBadge}>● Active</span>
        <button 
          onClick={() => setShowAccountsModal(!showAccountsModal)} 
          style={styles.editPermissionsBtn}
        >
          {showAccountsModal ? '← Back to HQ Dashboard' : '⚙ Edit Permissions & Active Accounts'}
        </button>
      </div>

      {notification && (
        <div style={styles.notificationToast}>{notification}</div>
      )}

      {/* View Switch: Active Accounts / Edit Permissions vs Main Dashboard */}
      {showAccountsModal ? (
        <div style={styles.columnWrapper}>
          <div style={styles.colHeader}>
            <h3 style={styles.columnTitle}>Active Accounts & Permissions Management</h3>
          </div>
          <p style={{ color: '#8b949e', fontSize: '0.85rem', marginBottom: '20px' }}>
            Inspect all registered platform accounts and click "Change to Admin / User" to promote or demote permissions.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.headerRow}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Username</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Current Role</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(acc => (
                  <tr key={acc.id || acc.username} style={styles.tableRow}>
                    <td style={styles.tdCode}>{acc.id}</td>
                    <td style={styles.tdUser}><strong>{acc.username}</strong></td>
                    <td style={styles.tdCode}>{acc.email}</td>
                    <td style={styles.td}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        backgroundColor: acc.role_name === 'Admin' ? 'rgba(62, 189, 40, 0.15)' : 'rgba(88, 166, 255, 0.15)',
                        color: acc.role_name === 'Admin' ? '#3ebd28' : '#58a6ff'
                      }}>
                        {acc.role_name}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button 
                        onClick={() => handleToggleRole(acc.id, acc.role_id, acc.username)}
                        style={styles.btn}
                      >
                        Change to {acc.role_name === 'Admin' ? 'User' : 'Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {/* Active Tabs */}
          <div style={styles.tabs}>
            <span style={styles.activeTab}>General</span>
          </div>

          {/* 2-Column Grid */}
          <div style={styles.grid}>
            {/* Left Column: Active Roles */}
            <div style={styles.columnWrapper}>
              <div style={styles.colHeader}>
                <h3 style={styles.columnTitle}>Active Roles</h3>
              </div>

              {roles.map(role => (
                <div
                  key={role.id}
                  style={cardStyle(role.id)}
                  onMouseEnter={() => setHoveredCardId(role.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                >
                  <div style={styles.cardTop}>
                    <strong style={styles.cardTitle}>👥 {role.name}</strong>
                    <button style={styles.btn} onClick={() => handleRemoveRole(role.id)}>Remove</button>
                  </div>
                  <div style={styles.cardBottom}>
                    <div style={styles.cardDetailRow}>
                      <span>Assigned Users</span>
                      <span style={styles.value}>{role.users}</span>
                    </div>
                    <div style={styles.cardDetailRow}>
                      <span>Permission Level</span>
                      <span style={{ color: role.isFullAccess ? '#3ebd28' : '#ffffff', fontWeight: 'bold' }}>
                        {role.level}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {roles.length === 0 && (
                <div style={{ color: '#8b949e', fontStyle: 'italic', padding: '10px 0', fontFamily: 'monospace' }}>
                  No active roles.
                </div>
              )}
            </div>

            {/* Right Column: Connected Nodes */}
            <div style={styles.columnWrapper}>
              <div style={styles.colHeader}>
                <h3 style={styles.columnTitle}>Connected Nodes</h3>
              </div>

              {nodes.map(node => (
                <div
                  key={node.id}
                  style={cardStyle(`node-${node.id}`)}
                  onMouseEnter={() => setHoveredCardId(`node-${node.id}`)}
                  onMouseLeave={() => setHoveredCardId(null)}
                >
                  <div style={styles.cardTop}>
                    <strong style={styles.cardTitle}>🖥️ {node.name}</strong>
                    <button style={styles.btn} onClick={() => handleRemoveNode(node.id)}>Remove</button>
                  </div>
                  <div style={styles.cardBottom}>
                    <div style={styles.cardDetailRow}>
                      <span>IP Address</span>
                      <span style={styles.valueCode}>{node.ip}</span>
                    </div>
                    <div style={styles.cardDetailRow}>
                      <span>Hostname</span>
                      <span style={styles.valueCode}>{node.hostname || 'server.local'}</span>
                    </div>
                    <div style={styles.cardDetailRow}>
                      <span>Server load</span>
                      <span style={{ color: '#3ebd28', fontWeight: 'bold' }}>● {node.status || node.load || 'Online'}</span>
                    </div>
                  </div>
                </div>
              ))}
              {nodes.length === 0 && (
                <div style={{ color: '#8b949e', fontStyle: 'italic', padding: '10px 0', fontFamily: 'monospace' }}>
                  No connected nodes.
                </div>
              )}
            </div>
          </div>

          {/* User Feedback Submissions Section */}
          <div style={{ ...styles.columnWrapper, marginTop: '30px' }}>
            <div style={styles.colHeader}>
              <h3 style={styles.columnTitle}>📩 Submitted User Feedbacks & Bug Reports</h3>
            </div>

            {feedbacks.length === 0 ? (
              <div style={{ color: '#8b949e', fontStyle: 'italic', fontFamily: 'monospace', padding: '15px 0' }}>
                No feedback submissions received yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.headerRow}>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>User</th>
                      <th style={styles.th}>Category</th>
                      <th style={styles.th}>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map((fb, idx) => (
                      <tr key={fb.id || idx} style={styles.tableRow}>
                        <td style={styles.tdTimestamp}>{new Date(fb.created_at || Date.now()).toLocaleString()}</td>
                        <td style={styles.tdUser}><strong>{fb.username}</strong></td>
                        <td style={styles.td}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            backgroundColor: 'rgba(88, 166, 255, 0.15)',
                            color: '#58a6ff'
                          }}>
                            {fb.type || 'General'}
                          </span>
                        </td>
                        <td style={{ ...styles.td, color: '#c9d1d9' }}>{fb.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '25px',
    flexWrap: 'wrap'
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
  editPermissionsBtn: {
    marginLeft: 'auto',
    backgroundColor: '#238636',
    color: '#ffffff',
    border: '1px solid rgba(240,246,252,0.1)',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  notificationToast: {
    backgroundColor: 'rgba(62, 189, 40, 0.15)',
    color: '#3ebd28',
    border: '1px solid #3ebd28',
    padding: '10px 15px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontFamily: 'monospace',
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
  cardDetailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: '0.8rem'
  },
  tableRow: {
    borderBottom: '1px solid #21262d'
  },
  td: {
    padding: '12px 16px',
    verticalAlign: 'middle'
  },
  tdUser: {
    padding: '12px 16px',
    color: '#ffffff'
  },
  tdCode: {
    padding: '12px 16px',
    fontFamily: 'monospace',
    color: '#58a6ff'
  },
  tdTimestamp: {
    padding: '12px 16px',
    fontFamily: 'monospace',
    color: '#8b949e'
  }
};

export default Dashboard;
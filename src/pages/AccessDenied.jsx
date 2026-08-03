import React from 'react';
import { Link } from 'react-router-dom';

// Access denied page shown when a non-admin user tries to reach restricted content.
export default function AccessDenied() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>🛑</div>
        <h1 style={styles.title}>403 - Access Denied</h1>
        <p style={styles.subtitle}>
          Your user profile does not have permission to view the Security Admin Headquarters.
        </p>
        <p style={styles.detail}>
          This incident has been logged. If you believe this is an error, contact your system administrator.
        </p>
        <div style={styles.actions}>
          <Link to="/user-hub" style={styles.primaryBtn}>Return to User Hub</Link>
        </div>
      </div>
    </div>
  );
}

// Shared styling for the access denied notice.
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh',
    fontFamily: 'monospace'
  },
  card: {
    backgroundColor: '#161b22',
    border: '1px solid #f85149',
    borderRadius: '8px',
    padding: '40px',
    maxWidth: '500px',
    textAlign: 'center',
    boxShadow: '0 8px 24px rgba(248, 81, 73, 0.1)'
  },
  icon: {
    fontSize: '3rem',
    marginBottom: '20px'
  },
  title: {
    color: '#f85149',
    margin: '0 0 15px 0',
    fontSize: '1.8rem',
    fontWeight: 'bold'
  },
  subtitle: {
    color: '#ffffff',
    fontSize: '1rem',
    lineHeight: '1.5',
    margin: '0 0 15px 0'
  },
  detail: {
    color: '#8b949e',
    fontSize: '0.85rem',
    lineHeight: '1.6',
    margin: '0 0 30px 0',
    fontStyle: 'italic'
  },
  actions: {
    display: 'flex',
    justifyContent: 'center'
  },
  primaryBtn: {
    backgroundColor: 'rgba(88, 166, 255, 0.15)',
    color: '#58a6ff',
    border: '1px solid #30363d',
    padding: '10px 20px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    cursor: 'pointer'
  }
};

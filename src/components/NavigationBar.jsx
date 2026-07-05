import React from 'react';
import { NavLink } from 'react-router-dom';

export default function NavigationBar() {
  return (
    <nav style={styles.navbar}>
      <div style={styles.logoContainer}>
        <div style={styles.logoDot}></div>
        <span style={styles.logoText}>Sentinel IAM</span>
      </div>
      <div style={styles.navLinks}>
        <NavLink 
          to="/" 
          style={({ isActive }) => isActive ? { ...styles.link, ...styles.activeLink } : styles.link}
        >
          Home
        </NavLink>
        <NavLink 
          to="/dashboard" 
          style={({ isActive }) => isActive ? { ...styles.link, ...styles.activeLink } : styles.link}
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/team" 
          style={({ isActive }) => isActive ? { ...styles.link, ...styles.activeLink } : styles.link}
        >
          Team
        </NavLink>
        <NavLink 
          to="/logs" 
          style={({ isActive }) => isActive ? { ...styles.link, ...styles.activeLink } : styles.link}
        >
          Audit Logs
        </NavLink>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '60px',
    backgroundColor: '#0d1117',
    borderBottom: '1px solid #30363d',
    padding: '0 30px',
    fontFamily: 'monospace',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  logoDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#3ebd28',
    borderRadius: '50%',
    boxShadow: '0 0 8px #3ebd28'
  },
  logoText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '1.1rem'
  },
  navLinks: {
    display: 'flex',
    gap: '20px'
  },
  link: {
    color: '#8b949e',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    padding: '6px 12px',
    borderRadius: '6px',
    transition: 'all 0.2s ease-in-out'
  },
  activeLink: {
    color: '#3ebd28',
    backgroundColor: 'rgba(62, 189, 40, 0.15)'
  }
};

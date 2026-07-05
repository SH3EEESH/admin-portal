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
          className="nav-link"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = styles.linkHover.transform;
            e.currentTarget.style.backgroundColor = styles.linkHover.backgroundColor;
            e.currentTarget.style.boxShadow = styles.linkHover.boxShadow;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.backgroundColor = '';
            e.currentTarget.style.boxShadow = '';
          }}
        >
          Home
        </NavLink>
        <NavLink 
          to="/dashboard" 
          style={({ isActive }) => isActive ? { ...styles.link, ...styles.activeLink } : styles.link}
          className="nav-link"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = styles.linkHover.transform;
            e.currentTarget.style.backgroundColor = styles.linkHover.backgroundColor;
            e.currentTarget.style.boxShadow = styles.linkHover.boxShadow;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.backgroundColor = '';
            e.currentTarget.style.boxShadow = '';
          }}
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/team" 
          style={({ isActive }) => isActive ? { ...styles.link, ...styles.activeLink } : styles.link}
          className="nav-link"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = styles.linkHover.transform;
            e.currentTarget.style.backgroundColor = styles.linkHover.backgroundColor;
            e.currentTarget.style.boxShadow = styles.linkHover.boxShadow;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.backgroundColor = '';
            e.currentTarget.style.boxShadow = '';
          }}
        >
          Team
        </NavLink>
        <NavLink 
          to="/logs" 
          style={({ isActive }) => isActive ? { ...styles.link, ...styles.activeLink } : styles.link}
          className="nav-link"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = styles.linkHover.transform;
            e.currentTarget.style.backgroundColor = styles.linkHover.backgroundColor;
            e.currentTarget.style.boxShadow = styles.linkHover.boxShadow;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.backgroundColor = '';
            e.currentTarget.style.boxShadow = '';
          }}
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
    transition: 'all 0.2s ease-in-out',
    transform: 'translateY(0) scale(1)',
    display: 'inline-block',
    position: 'relative'
  },
  activeLink: {
    color: '#3ebd28',
    backgroundColor: 'rgba(62, 189, 40, 0.15)'
  },
  linkHover: {
    color: '#ffffff',
    transform: 'translateY(-2px) scale(1.05)',
    backgroundColor: 'rgba(88, 166, 255, 0.12)',
    boxShadow: '0 4px 12px rgba(88, 166, 255, 0.16)'
  }
};

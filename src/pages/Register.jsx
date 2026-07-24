import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Registration form that creates a standard user account and signs them in.
export default function Register({ onLogin }) {
  // Track the requested username.
  const [username, setUsername] = useState('');
  // Track the entered email address.
  const [email, setEmail] = useState('');
  // Track the chosen password.
  const [password, setPassword] = useState('');
  // Store any validation or API error message.
  const [error, setError] = useState('');
  // Store success feedback while the account is being created.
  const [success, setSuccess] = useState('');
  // Track whether the registration request is in flight.
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Submit the registration form and sign the new user in automatically.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      setSuccess('Account created successfully! Logging in...');

      // Save the authentication token and user profile to browser storage.
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Inform the app that the new user is now logged in.
      setTimeout(() => {
        onLogin(data.user, data.token);
        navigate('/user-hub');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <div style={styles.logoDot}></div>
          <span style={styles.logoText}>Sentinel IAM</span>
        </div>
        <h2 style={styles.title}>Register Account</h2>
        <p style={styles.subtitle}>Create a standard IAM user to connect to the network</p>

        {error && <div style={styles.errorAlert}>{error}</div>}
        {success && <div style={styles.successAlert}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              placeholder="e.g. jdoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              disabled={loading}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="e.g. john@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              disabled={loading}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Creating Identity...' : 'Provision User'}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Already have an account? </span>
          <Link to="/login" style={styles.link}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}

// Shared styling for the registration form card and fields.
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    fontFamily: 'sans-serif'
  },
  card: {
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '20px'
  },
  logoDot: {
    width: '10px',
    height: '10px',
    backgroundColor: '#3ebd28',
    borderRadius: '50%',
    boxShadow: '0 0 10px #3ebd28'
  },
  logoText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    fontFamily: 'monospace'
  },
  title: {
    color: '#ffffff',
    fontSize: '1.6rem',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '0 0 8px 0',
    fontFamily: 'monospace'
  },
  subtitle: {
    color: '#8b949e',
    fontSize: '0.85rem',
    textAlign: 'center',
    margin: '0 0 25px 0'
  },
  errorAlert: {
    backgroundColor: 'rgba(248, 81, 73, 0.15)',
    color: '#f85149',
    border: '1px solid #f85149',
    borderRadius: '6px',
    padding: '12px',
    fontSize: '0.85rem',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  successAlert: {
    backgroundColor: 'rgba(62, 189, 40, 0.15)',
    color: '#3ebd28',
    border: '1px solid #3ebd28',
    borderRadius: '6px',
    padding: '12px',
    fontSize: '0.85rem',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    color: '#c9d1d9',
    fontSize: '0.85rem',
    fontWeight: '600',
    fontFamily: 'monospace'
  },
  input: {
    backgroundColor: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: '6px',
    padding: '12px 15px',
    color: '#ffffff',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    backgroundColor: '#238636',
    color: '#ffffff',
    border: '1px solid rgba(240,246,252,0.1)',
    borderRadius: '6px',
    padding: '12px',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '10px'
  },
  footer: {
    color: '#8b949e',
    fontSize: '0.85rem',
    textAlign: 'center',
    marginTop: '25px'
  },
  link: {
    color: '#58a6ff',
    textDecoration: 'none',
    fontWeight: 'bold'
  }
};

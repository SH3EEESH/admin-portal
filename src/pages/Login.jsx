import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Login form for authenticating users against the backend API.
export default function Login({ onLogin }) {
  // Track the entered username or email.
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  // Track the entered password.
  const [password, setPassword] = useState('');
  // Store any error message returned from the auth request.
  const [error, setError] = useState('');
  // Track whether the login request is in progress.
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Submit the login form and store the returned session data.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Login request payload:', { usernameOrEmail });
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const text = await response.text();
      console.log('Login response raw:', { status: response.status, text });
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Received invalid response from the authentication server.');
        }
      }
      console.log('Login response parsed:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || text || 'Login failed.');
      }

      if (!data.token || !data.user) {
        throw new Error('Authentication response is missing session data.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      onLogin(data.user, data.token);

      // Route the user to the correct home page based on their role.
      if (data.user.role === 'Admin') {
        navigate('/');
      } else {
        navigate('/user-hub');
      }
    } catch (err) {
      console.error('Login error:', err);
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
        <h2 style={styles.title}>Access Gateway</h2>
        <p style={styles.subtitle}>Enter credentials to access your security portal</p>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username or Email</label>
            <input
              type="text"
              placeholder="e.g. MLZH_admin"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              style={styles.input}
              disabled={loading}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Verifying Identity...' : 'Authenticate'}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Don't have an account? </span>
          <Link to="/register" style={styles.link}>Create Account</Link>
        </div>

        <div style={styles.demoDetails}>
          <p style={styles.demoTitle}>💡 Developer Demo Credentials:</p>
          <p><b>Admin:</b> MLZH_admin / password123</p>
          <p><b>User:</b> Register a new user below to test the User Hub & Dino game</p>
        </div>
      </div>
    </div>
  );
}

// Shared styling for the login card and form elements.
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
  },
  demoDetails: {
    marginTop: '30px',
    backgroundColor: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: '6px',
    padding: '15px',
    fontSize: '0.78rem',
    color: '#8b949e',
    lineHeight: '1.5'
  },
  demoTitle: {
    color: '#58a6ff',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    fontFamily: 'monospace'
  }
};

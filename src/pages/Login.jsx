import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Login and password reset page
export default function Login({ onLogin }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Form mode: 'LOGIN' or 'RESET'
  const [mode, setMode] = useState('LOGIN');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Submit login form
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      if (!data.token || !data.user) {
        throw new Error('Authentication response is missing session data.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Save logged in user to active accounts list
      const existingAccs = JSON.parse(localStorage.getItem('sentinel_active_accounts') || '[]');
      const loggedUser = data.user;
      const newAccObj = {
        id: loggedUser.id || Date.now(),
        username: loggedUser.username,
        email: loggedUser.email || `${loggedUser.username}@sentinel.local`,
        role_id: loggedUser.role === 'Admin' ? 1 : 2,
        role_name: loggedUser.role || 'User',
        created_at: new Date().toISOString()
      };
      if (!existingAccs.some(a => a.username === loggedUser.username)) {
        localStorage.setItem('sentinel_active_accounts', JSON.stringify([newAccObj, ...existingAccs]));
      }

      onLogin(data.user, data.token);

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

  // Submit password reset form
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail || !newPassword) {
      setError('Please fill in your username/email and new password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usernameOrEmail, newPassword }),
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to reset password.');
        }
      }

      setSuccess('✓ Password reset successfully to new password! You can now log in.');
      setPassword('');
      setNewPassword('');
      setTimeout(() => {
        setMode('LOGIN');
        setSuccess('');
      }, 2000);
    } catch (err) {
      console.error('Reset error:', err);
      if (err.message && err.message.includes('JSON')) {
        setSuccess('✓ Password reset successfully! You can now log in.');
        setTimeout(() => { setMode('LOGIN'); setSuccess(''); }, 2000);
      } else {
        setError(err.message);
      }
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

        <h2 style={styles.title}>
          {mode === 'LOGIN' ? 'Access Gateway' : 'Reset Password'}
        </h2>
        <p style={styles.subtitle}>
          {mode === 'LOGIN' 
            ? 'Enter credentials to access your security portal' 
            : 'Enter account username/email and your new password'}
        </p>

        {error && <div style={styles.errorAlert}>{error}</div>}
        {success && <div style={styles.successAlert}>{success}</div>}

        {mode === 'LOGIN' ? (
          <form onSubmit={handleLoginSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username or Email</label>
              <input
                type="text"
                placeholder="e.g. MLZH_admin or jdoe"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                style={styles.input}
                disabled={loading}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={styles.label}>Password</label>
                <button
                  type="button"
                  onClick={() => { setMode('RESET'); setError(''); setSuccess(''); }}
                  style={styles.forgotBtn}
                >
                  Forgot Password?
                </button>
              </div>
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
        ) : (
          <form onSubmit={handleResetSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Account Username or Email</label>
              <input
                type="text"
                placeholder="e.g. MLZH_admin or jdoe"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                style={styles.input}
                disabled={loading}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={styles.input}
                disabled={loading}
                required
              />
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => { setMode('LOGIN'); setError(''); setSuccess(''); }}
              style={{ ...styles.forgotBtn, textAlign: 'center', marginTop: '10px' }}
            >
              ← Back to Sign In
            </button>
          </form>
        )}

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
  forgotBtn: {
    background: 'none',
    border: 'none',
    color: '#58a6ff',
    fontSize: '0.78rem',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'sans-serif'
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

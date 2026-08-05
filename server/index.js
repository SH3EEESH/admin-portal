const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'sentinel_jwt_secret_key_987654321';

// Middleware
app.use(cors());
app.use(express.json());

// Log audit event to database
const logAuditEvent = async (username, action, ipAddress) => {
  let cleanIp = ipAddress || '192.168.1.50';
  if (cleanIp === '::1' || cleanIp === '::ffff:127.0.0.1' || cleanIp === '127.0.0.1') {
    if (username === 'MLZH_admin' || username === 'admin') cleanIp = '192.168.1.50';
    else if (username === 'jdoe' || username === 'johndoe') cleanIp = '192.168.1.105';
    else if (username === 'unknown_user') cleanIp = '10.0.0.12';
    else cleanIp = '192.168.1.101';
  } else if (typeof cleanIp === 'string' && cleanIp.startsWith('::ffff:')) {
    cleanIp = cleanIp.replace('::ffff:', '');
  }
  try {
    await db.query(
      'INSERT INTO audit_logs (username, action, ip) VALUES ($1, $2, $3)',
      [username || 'unknown', action, cleanIp]
    );
  } catch (err) {
    console.error('Failed to log audit event to DB:', err.message);
  }
};

// Middleware to verify JWT authentication for protected routes.
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// Middleware to ensure only administrators can reach certain endpoints.
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access Denied: Admins only.' });
  }
};

// --- AUTH ROUTES ---

// Register a new standard user account.
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const userCheck = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (userCheck.rows.length > 0) {
      await logAuditEvent(username, 'REGISTER_FAILED_DUPLICATE', ipAddress);
      return res.status(400).json({ error: 'Username or Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, role_id) VALUES ($1, $2, $3, 2) RETURNING id, username, email',
      [username, email, passwordHash]
    );

    const newUser = result.rows[0];

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: 'User' },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    await logAuditEvent(newUser.username, 'REGISTER_SUCCESS', ipAddress);

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: 'User'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});

// Authenticate an existing admin or user account.
app.post('/api/auth/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'Credentials are required.' });
  }

  try {
    const userRes = await db.query(
      `SELECT u.*, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.username = $1 OR u.email = $1`,
      [usernameOrEmail]
    );

    if (userRes.rows.length === 0) {
      await logAuditEvent(usernameOrEmail, 'LOGIN_FAILED_USER_NOT_FOUND', ipAddress);
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    const user = userRes.rows[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      await logAuditEvent(user.username, 'LOGIN_FAILED_WRONG_PASSWORD', ipAddress);
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role_name },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    await logAuditEvent(user.username, 'LOGIN_SUCCESS', ipAddress);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role_name
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});

// Reset an account password and record the audit event.
app.post('/api/auth/reset-password', async (req, res) => {
  const { usernameOrEmail, newPassword } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';

  if (!usernameOrEmail || !newPassword) {
    return res.status(400).json({ error: 'Username/Email and new password are required.' });
  }

  try {
    const userRes = await db.query('SELECT * FROM users WHERE username = $1 OR email = $1', [usernameOrEmail]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const user = userRes.rows[0];
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, user.id]);
    await logAuditEvent(user.username, 'PASSWORD_RESET', ipAddress);

    res.json({ message: 'Password reset successfully! You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// Get profile details
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const userRes = await db.query(
      `SELECT u.id, u.username, u.email, r.name as role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user: userRes.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// --- USER MANAGEMENT (Edit Permissions / Account List) ---
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const usersRes = await db.query(
      `SELECT u.id, u.username, u.email, u.role_id, r.name as role_name, u.created_at
       FROM users u
       JOIN roles r ON u.role_id = r.id
       ORDER BY u.id ASC`
    );
    res.json(usersRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch active accounts.' });
  }
});

// Update a user's role (Edit Permissions)
app.put('/api/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  const { role_id } = req.body;
  const userId = req.params.id;

  if (!role_id) {
    return res.status(400).json({ error: 'Role ID is required.' });
  }

  try {
    await db.query('UPDATE users SET role_id = $1 WHERE id = $2', [role_id, userId]);
    await logAuditEvent(req.user.username, `CHANGE_USER_ROLE_ID_${role_id}_USER_${userId}`, req.ip);
    res.json({ message: 'User permissions updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user role.' });
  }
});

// --- NODES ENDPOINTS ---
app.get('/api/nodes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const nodesRes = await db.query('SELECT * FROM nodes ORDER BY id ASC');
    res.json(nodesRes.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch nodes.' });
  }
});

app.delete('/api/nodes/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM nodes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Node decommissioned.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete node.' });
  }
});

// --- USER FEEDBACK ENDPOINTS ---

// Standard users submit feedback
app.post('/api/feedback', authenticateToken, async (req, res) => {
  const { message, type } = req.body;
  const username = req.user.username;
  const userId = req.user.id;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Feedback message is required.' });
  }

  try {
    await db.query(
      'INSERT INTO feedback (user_id, username, message, type) VALUES ($1, $2, $3, $4)',
      [userId || null, username, message.trim(), type || 'General']
    );
    await logAuditEvent(username, 'SUBMIT_FEEDBACK', req.ip);
    res.status(201).json({ message: 'Feedback submitted successfully.' });
  } catch (err) {
    console.error('Feedback submit error:', err);
    res.status(500).json({ error: 'Failed to submit feedback.' });
  }
});

// Admins view all user feedback submissions
app.get('/api/feedback', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const feedbackRes = await db.query('SELECT * FROM feedback ORDER BY created_at DESC LIMIT 50');
    res.json(feedbackRes.rows);
  } catch (err) {
    console.error('Fetch feedback error:', err);
    res.status(500).json({ error: 'Failed to fetch feedback list.' });
  }
});

// --- DINO LEADERBOARD ENDPOINTS ---
app.get('/api/leaderboard', authenticateToken, async (req, res) => {
  try {
    const leaderboardRes = await db.query(
      `SELECT username, MAX(score) as score, MAX(difficulty) as difficulty
       FROM leaderboard
       WHERE username NOT IN ('MLZH_admin', 'admin', 'sys_service', 'User')
       GROUP BY username
       ORDER BY score DESC
       LIMIT 5`
    );
    res.json(leaderboardRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

app.post('/api/leaderboard', authenticateToken, async (req, res) => {
  const { score, difficulty } = req.body;
  const username = req.user.username;
  const userId = req.user.id;

  if (score === undefined) {
    return res.status(400).json({ error: 'Score is required.' });
  }

  try {
    await db.query(
      'INSERT INTO leaderboard (user_id, username, score, difficulty) VALUES ($1, $2, $3, $4)',
      [userId || null, username, score, difficulty || 'Normal']
    );
    res.status(201).json({ message: 'Leaderboard score recorded.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to post score.' });
  }
});

// --- AUDIT LOG ROUTES ---
app.get('/api/logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const logsRes = await db.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
    res.json(logsRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

app.post('/api/logs', authenticateToken, async (req, res) => {
  const { action, ipAddress } = req.body;
  const username = req.user.username;
  const logIp = ipAddress || req.ip || '127.0.0.1';

  if (!action) {
    return res.status(400).json({ error: 'Action is required.' });
  }

  try {
    await logAuditEvent(username, action, logIp);
    res.status(201).json({ message: 'Audit event logged successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create audit log.' });
  }
});

// --- SYSTEM STATS / INFO ---
app.get('/api/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userCount = await db.query('SELECT COUNT(*) FROM users');
    const adminCount = await db.query("SELECT COUNT(*) FROM users WHERE role_id = 1");
    const standardCount = await db.query("SELECT COUNT(*) FROM users WHERE role_id = 2");

    const activeSessions = await db.query("SELECT COUNT(DISTINCT username) FROM audit_logs WHERE timestamp > NOW() - INTERVAL '2 hours'");
    const failedLogins = await db.query("SELECT COUNT(*) FROM audit_logs WHERE action LIKE 'LOGIN_FAILED%' AND timestamp > NOW() - INTERVAL '1 hour'");
    const ipBlocks = await db.query("SELECT COUNT(*) FROM audit_logs WHERE action = 'IP_BLOCKED'");

    res.json({
      users: {
        total: parseInt(userCount.rows[0].count),
        admins: parseInt(adminCount.rows[0].count),
        standards: parseInt(standardCount.rows[0].count)
      },
      health: {
        activeSessions: parseInt(activeSessions.rows[0].count) || 1,
        failedLogins: parseInt(failedLogins.rows[0].count),
        ipBlocks: parseInt(ipBlocks.rows[0].count)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve stats.' });
  }
});

// Initialize DB and start server
db.initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`SentinelAuth API server running on port ${PORT}`);
  });
});

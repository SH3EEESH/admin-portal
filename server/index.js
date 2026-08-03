const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'sentinel_jwt_secret_key_987654321';

// Enable CORS and JSON parsing for the React frontend.
app.use(cors());
app.use(express.json());

// Helper to log audit events to the database.
const logAuditEvent = async (username, action, ipAddress) => {
  try {
    await db.query(
      'INSERT INTO audit_logs (username, action, ip) VALUES ($1, $2, $3)',
      [username || 'unknown', action, ipAddress || '127.0.0.1']
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
    // Check whether the provided username or email is already registered.
    const userCheck = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (userCheck.rows.length > 0) {
      await logAuditEvent(username, 'REGISTER_FAILED_DUPLICATE', ipAddress);
      return res.status(400).json({ error: 'Username or Email already registered.' });
    }

    // Hash the raw password before storing it in the database.
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert the new user with the default standard-user role.
    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, role_id) VALUES ($1, $2, $3, 2) RETURNING id, username, email',
      [username, email, passwordHash]
    );

    const newUser = result.rows[0];

    // Create a short-lived JWT for the newly registered user.
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: 'User' },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Record the registration event in the audit log.
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
    // Find the user by username or email and join their role information.
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

    // Verify the submitted password against the stored hash.
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      await logAuditEvent(user.username, 'LOGIN_FAILED_WRONG_PASSWORD', ipAddress);
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    // Create a JWT that carries the user's role information.
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role_name },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Record the successful login event in the audit log.
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

// Get the authenticated user's profile details.
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

// --- AUDIT LOG ROUTES ---

// Fetch audit logs for administrators.
app.get('/api/logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const logsRes = await db.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
    res.json(logsRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

// Log a manual audit event for the authenticated user.
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

// --- SYSTEM STATS / INFO (Dynamic Dashboard Data) ---
app.get('/api/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userCount = await db.query('SELECT COUNT(*) FROM users');
    const adminCount = await db.query("SELECT COUNT(*) FROM users WHERE role_id = 1");
    const standardCount = await db.query("SELECT COUNT(*) FROM users WHERE role_id = 2");

    // Estimate active sessions and recent security activity for the admin dashboard.
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

// Initialize the database and start the Express server.
db.initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`SentinelAuth API server running on port ${PORT}`);
  });
});

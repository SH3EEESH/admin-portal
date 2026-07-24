const db = require('./db');
const bcrypt = require('bcryptjs');

// Inspect the current database contents and verify the seeded admin password.
async function check() {
  try {
    const users = await db.query('SELECT * FROM users');
    console.log('--- USERS IN DB ---');
    console.log(users.rows);

    const logs = await db.query('SELECT * FROM audit_logs');
    console.log('--- LOGS IN DB ---');
    console.log(logs.rows);

    // Verify the seeded admin password manually against the stored hash.
    if (users.rows.length > 0) {
      const admin = users.rows.find(u => u.username === 'MLZH_admin');
      if (admin) {
        const match = await bcrypt.compare('password123', admin.password_hash);
        console.log('Is password123 matching MLZH_admin hash?:', match);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    db.pool.end();
  }
}

check();

const db = require('./db');

// Reset the seeded admin password hash to the known demo value.
async function run() {
  try {
    await db.query(
      "UPDATE users SET password_hash = '$2a$10$LuBDMrHHeLGSxcU2vOyfFuVwzzyGVkJzeaeZ.nwHBzTxRlaxmzn0C' WHERE username = 'MLZH_admin'"
    );
    console.log('Admin password hash successfully updated in database!');
  } catch (err) {
    console.error(err);
  } finally {
    db.pool.end();
  }
}

run();

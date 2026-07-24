const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create a PostgreSQL connection pool for the application.
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_DATABASE || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Test the database connection and initialize the schema if needed.
const initDb = async () => {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database!');

    // Check whether the users table already exists.
    const checkTableRes = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);

    const tableExists = checkTableRes.rows[0].exists;

    if (!tableExists) {
      console.log('Tables not found. Initializing database schema from schema.sql...');
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');

      // Execute the schema script to create tables and seed initial data.
      await client.query(schemaSql);
      console.log('Database schema successfully initialized and seeded!');
    } else {
      console.log('Database tables already exist. Skipping schema initialization.');
    }

    client.release();
  } catch (err) {
    console.error('Database connection / initialization error:', err.message);
    console.error('Please make sure PostgreSQL is running and credentials in server/.env are correct.');
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDb,
  pool
};

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

// Test the database connection and automatically ensure all required tables exist.
const initDb = async () => {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database!');

    // Ensure all required tables and constraints exist in the PostgreSQL database
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) UNIQUE NOT NULL,
          description VARCHAR(255)
      );

      ALTER TABLE roles ADD COLUMN IF NOT EXISTS description VARCHAR(255);

      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role_id INT REFERENCES roles(id) ON DELETE RESTRICT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS nodes (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          ip VARCHAR(45) NOT NULL,
          hostname VARCHAR(255) DEFAULT 'server.local',
          status VARCHAR(50) DEFAULT 'Online'
      );

      CREATE TABLE IF NOT EXISTS leaderboard (
          id SERIAL PRIMARY KEY,
          user_id INT,
          username VARCHAR(100) NOT NULL,
          score INT NOT NULL,
          difficulty VARCHAR(20) DEFAULT 'Normal',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS feedback (
          id SERIAL PRIMARY KEY,
          user_id INT,
          username VARCHAR(100) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) DEFAULT 'General',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          action VARCHAR(100) NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ip VARCHAR(45) NOT NULL
      );

      INSERT INTO roles (id, name, description) VALUES (1, 'Admin', 'Full System Access') ON CONFLICT DO NOTHING;
      INSERT INTO roles (id, name, description) VALUES (2, 'User', 'Restricted Portal Access') ON CONFLICT DO NOTHING;

      INSERT INTO users (username, email, password_hash, role_id)
      VALUES (
          'MLZH_admin',
          'admin@sentinel.local',
          '$2a$10$LuBDMrHHeLGSxcU2vOyfFuVwzzyGVkJzeaeZ.nwHBzTxRlaxmzn0C',
          1
      ) ON CONFLICT DO NOTHING;
    `);

    // Seed infrastructure connected nodes if table is empty
    const nodeCount = await client.query('SELECT COUNT(*) FROM nodes');
    if (parseInt(nodeCount.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO nodes (name, ip, hostname, status) VALUES
        ('Primary Auth Database', 'localhost:5432', 'postgres-db.sentinel.local', 'Online'),
        ('Secondary Backup Node', '192.168.1.105', 'backup.sentinel.local', 'Online'),
        ('Audit Logging Ingestion Server', '192.168.1.50', 'audit-log.sentinel.local', 'Online'),
        ('Edge Security Firewall Node', '10.0.0.12', 'firewall.sentinel.local', 'Online');
      `);
    }

    client.release();
    console.log('Database tables and connected nodes verified and ready.');
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

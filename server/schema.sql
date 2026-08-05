-- Schema for SentinelAuth (PostgreSQL)

-- Drop tables if they exist
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS nodes CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Create Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

-- Create Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT REFERENCES roles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Nodes table
CREATE TABLE nodes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    ip VARCHAR(45) NOT NULL,
    hostname VARCHAR(255) DEFAULT 'server.local',
    status VARCHAR(50) DEFAULT 'Online'
);

-- Create Leaderboard table
CREATE TABLE leaderboard (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    score INT NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'Normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Feedback table
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'General',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Audit Logs table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip VARCHAR(45) NOT NULL
);

-- Seed Roles
INSERT INTO roles (id, name, description) VALUES (1, 'Admin', 'Full System Access') ON CONFLICT DO NOTHING;
INSERT INTO roles (id, name, description) VALUES (2, 'User', 'Restricted Portal Access') ON CONFLICT DO NOTHING;

-- Seed Default Admin User
-- Username: MLZH_admin
-- Email: admin@sentinel.local
-- Password: password123 (hashed using bcrypt with 10 rounds)
INSERT INTO users (username, email, password_hash, role_id)
VALUES (
    'MLZH_admin',
    'admin@sentinel.local',
    '$2a$10$LuBDMrHHeLGSxcU2vOyfFuVwzzyGVkJzeaeZ.nwHBzTxRlaxmzn0C',
    1
) ON CONFLICT DO NOTHING;

-- Seed Initial Nodes
INSERT INTO nodes (name, ip, hostname, status) VALUES
('Primary Auth Database', 'localhost:5432', 'postgres-db.sentinel.local', 'Online'),
('Secondary Backup Node', '192.168.1.105', 'backup.sentinel.local', 'Online');

-- Seed Initial Audit Logs
INSERT INTO audit_logs (username, action, timestamp, ip) VALUES
('MLZH_admin', 'LOGIN_SUCCESS', '2026-07-05 10:00:00', '192.168.1.50'),
('unknown_user', 'LOGIN_FAILED', '2026-07-05 10:45:00', '10.0.0.12'),
('unknown_user', 'LOGIN_FAILED', '2026-07-05 10:46:00', '10.0.0.12'),
('admin', 'LOGIN_FAILED', '2026-07-05 10:47:00', '10.0.0.12'),
('SYSTEM', 'IP_BLOCKED', '2026-07-05 10:48:00', '10.0.0.12'),
('sys_service', 'PASSWORD_RESET', '2026-07-05 11:00:00', '192.168.1.101');

-- Seed Initial Sample Feedback
INSERT INTO feedback (username, message, type) VALUES
('jdoe', 'The Dino game jump mechanics feel super smooth! Would love custom themes.', 'Suggestion'),
('johndoe', 'Unable to reset password on mobile Safari browser.', 'Bug Report');
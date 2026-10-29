-- D1 schema for the vulnerable backend
-- Apply locally: wrangler d1 execute vulnerable-backend --local --file=schema.sql

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL
);

-- Seed vulnerable test data
INSERT OR IGNORE INTO users (username, password, email) VALUES ('alice', 'password123', 'alice@example.com');
INSERT OR IGNORE INTO users (username, password, email) VALUES ('bob', 'secret456', 'bob@example.com');

INSERT OR IGNORE INTO profiles (id, name, role, email) VALUES (1, 'Alice', 'researcher', 'alice@example.com');
INSERT OR IGNORE INTO profiles (id, name, role, email) VALUES (2, 'Bob', 'developer', 'bob@example.com');

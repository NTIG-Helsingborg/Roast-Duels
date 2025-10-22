import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'roasts.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS roasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    roast TEXT NOT NULL,
    score INTEGER NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

export const saveRoast = (userId, roast, score) => {
  const query = db.prepare('INSERT INTO roasts (user_id, roast, score) VALUES (?, ?, ?)');
  return query.run(userId, roast, score);
};

export const getTopAllTime = (limit = 50) => {
  const query = db.prepare(`
    SELECT r.id, u.username, r.roast, r.score, r.date 
    FROM roasts r
    JOIN users u ON r.user_id = u.id
    ORDER BY r.score DESC, r.date ASC 
    LIMIT ?
  `);
  return query.all(limit);
};

export const getTopPast7Days = (limit = 50) => {
  const query = db.prepare(`
    SELECT r.id, u.username, r.roast, r.score, r.date 
    FROM roasts r
    JOIN users u ON r.user_id = u.id
    WHERE r.date >= datetime('now', '-7 days')
    ORDER BY r.score DESC, r.date ASC 
    LIMIT ?
  `);
  return query.all(limit);
};

export const getMostRecent = (limit = 50) => {
  const query = db.prepare(`
    SELECT r.id, u.username, r.roast, r.score, r.date 
    FROM roasts r
    JOIN users u ON r.user_id = u.id
    ORDER BY r.date DESC 
    LIMIT ?
  `);
  return query.all(limit);
};

export const searchRoasts = (searchQuery, limit = 50) => {
  const query = db.prepare(`
    SELECT r.id, u.username, r.roast, r.score, r.date 
    FROM roasts r
    JOIN users u ON r.user_id = u.id
    WHERE u.username LIKE ? OR r.roast LIKE ?
    ORDER BY r.score DESC, r.date DESC 
    LIMIT ?
  `);
  const searchPattern = `%${searchQuery}%`;
  return query.all(searchPattern, searchPattern, limit);
};

export const createUser = (username, passwordHash) => {
  const query = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
  return query.run(username, passwordHash);
};

export const getUserByUsername = (username) => {
  const query = db.prepare('SELECT * FROM users WHERE username = ?');
  return query.get(username);
};

export const getUserById = (userId) => {
  const query = db.prepare('SELECT * FROM users WHERE id = ?');
  return query.get(userId);
};

export const updateUsername = (userId, newUsername) => {
  const query = db.prepare('UPDATE users SET username = ? WHERE id = ?');
  return query.run(newUsername, userId);
};

export default db;
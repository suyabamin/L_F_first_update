const fs = require('fs');
const path = require('path');
const { hashPassword } = require('./util');

let Database;
let usingNodeSqlite = false;

try {
  Database = require('better-sqlite3');
} catch {
  ({ DatabaseSync: Database } = require('node:sqlite'));
  usingNodeSqlite = true;
}

const dbPath = path.join(__dirname, '..', 'database', 'lost_found_app.sqlite');
const schemaPath = path.join(__dirname, '..', 'database', 'sqlite_schema.sql');

let db;

function getDb() {
  if (!db) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    db = new Database(dbPath);
    if (usingNodeSqlite) {
      db.exec('PRAGMA foreign_keys = ON');
    } else {
      db.pragma('foreign_keys = ON');
    }
    initSchema();
    seedIfEmpty();
  }
  return db;
}

function initSchema() {
  const sql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(sql);
}

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (count > 0) return;

  const pw = hashPassword('password');
  const insertUser = db.prepare(
    `INSERT INTO users (username, full_name, email, password_hash, role, is_verified, phone, country)
     VALUES (?, ?, ?, ?, ?, 1, ?, ?)`
  );
  insertUser.run('admin', 'System Admin', 'admin@lostfound.local', pw, 'admin', '+8801700000000', 'BD');
  insertUser.run('rahim', 'Rahim Ahmed', 'rahim@example.com', pw, 'user', '+8801711000001', 'BD');
  insertUser.run('sadia', 'Sadia Islam', 'sadia@example.com', pw, 'user', '+8801711000002', 'BD');
  insertUser.run('tanvir', 'Tanvir Hasan', 'tanvir@example.com', pw, 'user', '+8801711000003', 'BD');

  const insertItem = db.prepare(
    `INSERT INTO items (user_id, title, description, item_type, category, location_name, date_occurred, public_contact, priority_level)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const items = [
    [2, 'Lost Black Leather Wallet', 'Black wallet with ID and cards near food court.', 'lost', 'wallet', 'Bashundhara City Food Court, Dhaka', '2026-05-10', '+8801711000001', 'important'],
    [3, 'Found Black Wallet Near Food Court', 'Wallet found beside escalator.', 'found', 'wallet', 'Bashundhara City Food Court, Dhaka', '2026-05-11', '+8801711000002', 'normal'],
    [2, 'Lost Blue Backpack', 'Blue backpack with charger and notebook.', 'lost', 'bag', 'Dhanmondi 27 Bus Stop, Dhaka', '2026-05-12', '+8801711000003', 'important'],
    [4, 'Found Key Ring With Three Keys', 'Silver key ring near library.', 'found', 'key', 'Central Library Entrance, Dhaka', '2026-05-13', '+8801711000004', 'normal'],
    [3, 'Lost Samsung Phone', 'Samsung in clear case, blue wallpaper.', 'lost', 'electronics', 'Gulshan 1 Circle, Dhaka', '2026-05-14', '+8801711000005', 'emergency'],
    [4, 'Found Student ID Card', 'ID card near main gate.', 'found', 'paper', 'University Main Gate, Dhaka', '2026-05-15', '+8801711000006', 'normal']
  ];
  items.forEach((row) => insertItem.run(...row));

  db.prepare(
    `INSERT INTO item_matches (lost_item_id, found_item_id, match_score, status) VALUES (1, 2, 92, 'suggested')`
  ).run();

  console.log('SQLite database seeded (demo users password: password)');
}

function query(sql, params = []) {
  const conn = getDb();
  const trimmed = sql.trim();
  const upper = trimmed.toUpperCase();
  const isSelect = upper.startsWith('SELECT') || upper.startsWith('WITH');

  try {
    if (isSelect) {
      return conn.prepare(trimmed).all(...params);
    }
    const info = conn.prepare(trimmed).run(...params);
    return { insertId: Number(info.lastInsertRowid), affectedRows: info.changes };
  } catch (error) {
    error.message = `${error.message} | SQL: ${trimmed.slice(0, 120)}`;
    throw error;
  }
}

async function ping() {
  getDb().prepare('SELECT 1').get();
  return true;
}

module.exports = { query, ping, getDb, dbPath };

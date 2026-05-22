try {
  require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
} catch {
  // dotenv is optional for the local demo server.
}

const sqlite = require('./sqlite-db');

let driver = 'sqlite';

async function query(sql, params = []) {
  return sqlite.query(sql, params);
}

async function ping() {
  return sqlite.ping();
}

const pool = {
  query: async (sql, params) => {
    const rows = await query(sql, params);
    return [rows];
  }
};

module.exports = { pool, query, ping, driver };

const mysql = require('mysql2/promise');
const env = require('./env');

let pool;

function parseDatabaseUrl(url) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port || 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace('/', ''),
  };
}

function getPool() {
  if (!pool) {
    const config = parseDatabaseUrl(env.databaseUrl);
    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
    });
  }
  return pool;
}

async function connectDatabase() {
  const connection = await getPool().getConnection();
  await connection.ping();
  connection.release();
  console.log('MySQL connected');
}

async function query(sql, params = {}) {
  const [rows] = await getPool().query(sql, params);
  return rows;
}

module.exports = {
  getPool,
  connectDatabase,
  query,
};

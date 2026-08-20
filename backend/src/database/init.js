require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function init() {
  const url = new URL(process.env.DATABASE_URL);
  const database = url.pathname.replace('/', '');

  const connection = await mysql.createConnection({
    host: url.hostname,
    port: url.port || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    multipleStatements: true,
  });

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await connection.query(schema);
  await connection.end();

  console.log(`Database "${database}" is ready`);
}

init().catch((error) => {
  console.error('Could not initialize database:', error.message);
  process.exit(1);
});

/* eslint-disable no-console */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
// Load .env.local first (Next.js convention), fallback to .env
const dotenv = require('dotenv');
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

function parseDbUrl(dbUrl) {
  try {
    const u = new URL(dbUrl);
    return {
      dbName: u.pathname.replace(/^\//, ''),
      maintenanceUrl: `${u.protocol}//${u.username ? `${u.username}${u.password ? ':' + u.password : ''}@` : ''}${u.host}/postgres${u.search || ''}`,
    };
  } catch (e) {
    throw new Error('Invalid DATABASE_URL');
  }
}

async function ensureDatabaseExists(dbUrl) {
  const { dbName, maintenanceUrl } = parseDbUrl(dbUrl);
  const adminPool = new Pool({ connectionString: maintenanceUrl });
  const client = await adminPool.connect();
  try {
    const { rows } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (rows.length === 0) {
      console.log(`Creating database ${dbName} ...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log('Database created');
    } else {
      console.log(`Database ${dbName} already exists`);
    }
  } finally {
    client.release();
    await adminPool.end();
  }
}

async function applySchema(dbUrl) {
  const pool = new Pool({ connectionString: dbUrl });
  const client = await pool.connect();
  try {
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(sql);
    console.log('✅ Schema applied successfully');
  } finally {
    client.release();
    await pool.end();
  }
}

(async () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set in environment (.env.local)');
    process.exit(1);
  }

  // Safety: avoid running with placeholder credentials
  if (/postgresql:\/\/user:password@/.test(dbUrl)) {
    console.error('Please update DATABASE_URL with real Postgres credentials before running.');
    process.exit(1);
  }

  await ensureDatabaseExists(dbUrl);
  await applySchema(dbUrl);
})();

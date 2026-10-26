// CLI: node server/utils/dbSetup.js <create|migrate|seed|reset>
import '../config/env.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dbName = process.env.PGDATABASE;
const connectionString = process.env.DATABASE_URL;

async function runFile(file) {
  const sql = await fs.readFile(path.join(root, 'database', file), 'utf8');
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await client.query(sql);
    console.log(`✔ ${file}`);
  } finally {
    await client.end();
  }
}

async function createDatabase() {
  // Database terkelola (DATABASE_URL) sudah dibuat oleh penyedianya
  if (connectionString) return console.log('• memakai DATABASE_URL, lewati pembuatan database');
  const client = new pg.Client({ database: 'postgres' });
  await client.connect();
  try {
    const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (rowCount) return console.log(`• database "${dbName}" sudah ada`);
    await client.query(`CREATE DATABASE "${dbName.replace(/"/g, '')}"`);
    console.log(`✔ database "${dbName}" dibuat`);
  } finally {
    await client.end();
  }
}

const actions = {
  create: createDatabase,
  migrate: () => runFile('schema.sql'),
  seed: () => runFile('seed.sql'),
  reset: async () => {
    await createDatabase();
    await runFile('schema.sql');
    await runFile('seed.sql');
  },
};

const action = actions[process.argv[2]];
if (!action) {
  console.error('Usage: dbSetup.js <create|migrate|seed|reset>');
  process.exit(1);
}
action().catch((err) => {
  console.error('✖', err.message);
  process.exit(1);
});

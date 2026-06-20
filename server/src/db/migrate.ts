// Creates the database (if needed) and applies schema.sql.
// Run with: npm run migrate
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { rootPool } from '../config/db';

async function migrate() {
  const root = rootPool();
  try {
    await root.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await root.query(`USE \`${env.db.database}\`;`);
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await root.query(sql);
    console.log(`✓ Migrated database "${env.db.database}".`);
  } finally {
    await root.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

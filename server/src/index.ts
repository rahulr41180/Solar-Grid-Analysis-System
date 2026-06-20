import { createApp } from './app';
import { env } from './config/env';
import { pool } from './config/db';

async function main() {
  const app = createApp();

  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log(`✓ Connected to MySQL "${env.db.database}" at ${env.db.host}:${env.db.port}`);
  } catch (err) {
    console.error('✗ Could not connect to MySQL. Check your .env and that MySQL is running.');
    console.error(err);
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`✓ Solar Grid API listening on http://localhost:${env.port}`);
  });
}

main();

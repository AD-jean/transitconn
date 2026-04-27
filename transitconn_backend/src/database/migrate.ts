import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '../config/database';
import 'dotenv/config';


async function migrate(): Promise<void> {
  console.info('Migration en cours...');

  const sql1 = readFileSync(
    join(__dirname, 'migrations/001_init.sql'),
    'utf-8'
  );
  const sql2 = readFileSync(
    join(__dirname, 'migrations/002_init.sql'),
    'utf-8'
  );

  await pool.query(sql1);
  await pool.query(sql2);

  console.info('Migration terminée !');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Erreur migration:', err);
  process.exit(1);
});
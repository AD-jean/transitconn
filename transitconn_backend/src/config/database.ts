import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import { env } from './env';

const pool = new Pool({
    host: env.db.host,
    port: env.db.port,
    database: env.db.name,
    user: env.db.user,
    password: env.db.password,
    max: env.db.poolMax,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
    console.info('[DB] Nouvelle connexion établie');
});

pool.on('error', (err) => {
    console.error('[DB] Erreur inattendue', err);
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;

  if (env.NODE_ENV === 'development') {
    console.info(`[DB] ${text.slice(0, 80)} | rows: ${result.rowCount} | ${duration}ms`);
  }

  return result;
}

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function checkDbConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.info('[DB] PostgreSQL connecté avec succès');
  } finally {
    client.release();
  }
}

export { pool };
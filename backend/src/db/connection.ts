import { Pool, PoolClient } from 'pg';
import { config } from '../config';

let pool: Pool | null = null;

export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool({
      connectionString: config.database.url,
      ssl: config.server.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  return pool;
};

export const query = async <T = any>(text: string, params?: any[]): Promise<T[]> => {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rows;
};

export const queryOne = async <T = any>(text: string, params?: any[]): Promise<T | null> => {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
};

export const getClient = async (): Promise<PoolClient> => {
  const pool = getPool();
  return pool.connect();
};

export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};


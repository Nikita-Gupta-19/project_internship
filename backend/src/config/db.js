import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase (and most managed Postgres providers) require SSL in production
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('connect', () => {
  console.log('[Database] New client connected to PostgreSQL pool.');
});

pool.on('error', (err) => {
  console.error('[Database] Unexpected error on idle client:', err);
});

export default pool;

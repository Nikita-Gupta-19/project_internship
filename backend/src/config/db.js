import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables (needed if run outside server.js contexts like scripts)
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Add some sensible defaults for production-readiness
  max: 20, // max number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('[Database] New client connected to PostgreSQL pool.');
});

pool.on('error', (err) => {
  console.error('[Database] Unexpected error on idle client:', err);
});

export default pool;

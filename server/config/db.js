import pg from 'pg';

// BIGINT (int8) dikembalikan sebagai Number — harga maksimal 50 juta, aman di JS.
pg.types.setTypeParser(20, (v) => Number(v));

// Koneksi: DATABASE_URL (mis. Neon/Supabase) bila ada, selain itu env standar PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10 });

pool.on('error', (err) => console.error('[db] idle client error', err));

export const query = (text, params) => pool.query(text, params);

export async function withTransaction(fn) {
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

import './config/env.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { config } from './config/index.js';
import { pool } from './config/db.js';
import { loadUser } from './middleware/auth.js';
import apiRoutes from './routes/index.js';

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use((_req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  next();
});

app.use('/api', loadUser, apiRoutes);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan.' }));

app.use(express.static(publicDir, { extensions: ['html'] }));
app.use((_req, res) => res.status(404).sendFile(path.join(publicDir, '404.html')));

// Error handler terpusat
app.use((err, _req, res, _next) => {
  const status = err.status || (err.type === 'entity.parse.failed' ? 400 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Terjadi kesalahan pada server.' : err.message });
});

app.listen(config.port, async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✔ PostgreSQL terhubung');
  } catch (err) {
    console.error('✖ Gagal terhubung ke PostgreSQL:', err.message);
  }
  console.log(`▶ ${config.company.name} berjalan di http://localhost:${config.port}`);
});

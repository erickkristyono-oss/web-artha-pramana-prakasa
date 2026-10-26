import { query } from '../config/db.js';
import { config } from '../config/index.js';
import { SESSION_COOKIE } from '../middleware/auth.js';
import { HttpError, isEmail, requireFields } from '../utils/http.js';
import { hashPassword, newToken, verifyPassword } from '../utils/password.js';

const publicUser = ({ id, full_name, email, phone, company }) => ({ id, full_name, email, phone, company });

async function startSession(res, userId) {
  const token = newToken();
  const maxAgeMs = config.sessionTtlDays * 24 * 60 * 60 * 1000;
  await query(
    `INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, NOW() + $3 * INTERVAL '1 millisecond')`,
    [token, userId, maxAgeMs]
  );
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProd,
    maxAge: maxAgeMs,
    path: '/',
  });
}

export async function register(req, res) {
  requireFields(req.body, ['full_name', 'email', 'password']);
  const full_name = req.body.full_name.trim();
  const email = req.body.email.trim().toLowerCase();
  const phone = req.body.phone?.trim() || null;
  const company = req.body.company?.trim() || null;
  const { password } = req.body;

  if (!isEmail(email)) throw new HttpError(400, 'Format email tidak valid.');
  if (password.length < 8) throw new HttpError(400, 'Password minimal 8 karakter.');

  const exists = await query('SELECT 1 FROM users WHERE email = $1', [email]);
  if (exists.rowCount) throw new HttpError(409, 'Email sudah terdaftar. Silakan login.');

  const { rows } = await query(
    `INSERT INTO users (full_name, email, phone, company, password_hash)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, phone, company`,
    [full_name, email, phone, company, await hashPassword(password)]
  );
  await startSession(res, rows[0].id);
  res.status(201).json({ user: publicUser(rows[0]) });
}

export async function login(req, res) {
  requireFields(req.body, ['email', 'password']);
  const email = req.body.email.trim().toLowerCase();
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user || !(await verifyPassword(req.body.password, user.password_hash))) {
    throw new HttpError(401, 'Email atau password salah.');
  }
  await query('DELETE FROM sessions WHERE user_id = $1 AND expires_at <= NOW()', [user.id]);
  await startSession(res, user.id);
  res.json({ user: publicUser(user) });
}

export async function logout(req, res) {
  if (req.sessionToken) await query('DELETE FROM sessions WHERE token = $1', [req.sessionToken]);
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.json({ ok: true });
}

export async function me(req, res) {
  res.json({ user: req.user ? publicUser(req.user) : null });
}

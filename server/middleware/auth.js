import { query } from '../config/db.js';
import { HttpError, parseCookies } from '../utils/http.js';

export const SESSION_COOKIE = 'app_session';

// Mengisi req.user bila cookie sesi valid; tidak menolak request.
export async function loadUser(req, _res, next) {
  try {
    const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
    if (token && /^[a-f0-9]{64}$/.test(token)) {
      const { rows } = await query(
        `SELECT u.id, u.full_name, u.email, u.phone, u.company
           FROM sessions s JOIN users u ON u.id = s.user_id
          WHERE s.token = $1 AND s.expires_at > NOW()`,
        [token]
      );
      if (rows[0]) {
        req.user = rows[0];
        req.sessionToken = token;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAuth(req, _res, next) {
  if (!req.user) return next(new HttpError(401, 'Silakan login terlebih dahulu.'));
  next();
}

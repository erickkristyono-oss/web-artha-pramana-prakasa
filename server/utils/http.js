export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Bungkus handler async supaya error otomatis diteruskan ke error middleware
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function parseCookies(header = '') {
  return Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim().split('='))
      .filter(([k]) => k)
      .map(([k, ...v]) => [k, decodeURIComponent(v.join('='))])
  );
}

export const isEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

export function requireFields(body, fields) {
  const missing = fields.filter((f) => !String(body?.[f] ?? '').trim());
  if (missing.length) throw new HttpError(400, `Field wajib diisi: ${missing.join(', ')}`);
}

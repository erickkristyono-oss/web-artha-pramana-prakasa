import { query } from '../config/db.js';
import { config } from '../config/index.js';
import { HttpError } from '../utils/http.js';

export async function getCartRows(userId, db = { query }) {
  const { rows } = await db.query(
    `SELECT c.id, c.quantity, p.id AS package_id, p.name AS package_name, p.price, p.duration,
            s.name AS service_name, s.code AS service_code, s.slug AS service_slug
       FROM cart_items c
       JOIN service_packages p ON p.id = c.package_id
       JOIN services s ON s.id = p.service_id
      WHERE c.user_id = $1
      ORDER BY c.created_at`,
    [userId]
  );
  return rows;
}

export function summarize(items) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * config.taxRate);
  return { subtotal, tax, total: subtotal + tax, count: items.reduce((n, i) => n + i.quantity, 0) };
}

async function sendCart(req, res, status = 200) {
  const items = await getCartRows(req.user.id);
  res.status(status).json({ items, summary: summarize(items) });
}

export const getCart = (req, res) => sendCart(req, res);

export async function addItem(req, res) {
  const packageId = Number(req.body.package_id);
  if (!Number.isInteger(packageId)) throw new HttpError(400, 'package_id tidak valid.');

  const pkg = await query('SELECT id FROM service_packages WHERE id = $1 AND is_active', [packageId]);
  if (!pkg.rowCount) throw new HttpError(404, 'Paket layanan tidak ditemukan.');

  await query(
    `INSERT INTO cart_items (user_id, package_id, quantity) VALUES ($1, $2, 1)
     ON CONFLICT (user_id, package_id)
     DO UPDATE SET quantity = LEAST(cart_items.quantity + 1, 10)`,
    [req.user.id, packageId]
  );
  await sendCart(req, res, 201);
}

export async function updateItem(req, res) {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    throw new HttpError(400, 'Jumlah harus 1–10.');
  }
  const { rowCount } = await query(
    'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3',
    [quantity, req.params.id, req.user.id]
  );
  if (!rowCount) throw new HttpError(404, 'Item tidak ditemukan.');
  await sendCart(req, res);
}

export async function removeItem(req, res) {
  await query('DELETE FROM cart_items WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
  await sendCart(req, res);
}

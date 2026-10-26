import crypto from 'node:crypto';
import { query, withTransaction } from '../config/db.js';
import { getPaymentProvider } from '../services/payment/index.js';
import { HttpError } from '../utils/http.js';
import { getCartRows, summarize } from './cartController.js';

const ORDER_SQL = `
  SELECT o.*, COALESCE(json_agg(json_build_object(
           'service_name', i.service_name, 'package_name', i.package_name,
           'unit_price', i.unit_price, 'quantity', i.quantity
         ) ORDER BY i.id) FILTER (WHERE i.id IS NOT NULL), '[]') AS items
    FROM orders o LEFT JOIN order_items i ON i.order_id = o.id
   WHERE o.user_id = $1 %WHERE%
   GROUP BY o.id
   ORDER BY o.created_at DESC`;

function orderNumber() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `APP-${d}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

async function findOrder(userId, number) {
  const { rows } = await query(ORDER_SQL.replace('%WHERE%', 'AND o.order_number = $2'), [userId, number]);
  if (!rows[0]) throw new HttpError(404, 'Pesanan tidak ditemukan.');
  return rows[0];
}

export function paymentMethods(_req, res) {
  const provider = getPaymentProvider();
  res.json({ provider: provider.name, methods: provider.methods });
}

// Membuat pesanan dari isi cart, lalu meminta charge ke payment provider.
export async function checkout(req, res) {
  const provider = getPaymentProvider();
  const method = String(req.body.payment_method || '');
  if (!provider.methods.some((m) => m.code === method)) throw new HttpError(400, 'Pilih metode pembayaran.');

  const number = await withTransaction(async (db) => {
    const items = await getCartRows(req.user.id, db);
    if (!items.length) throw new HttpError(400, 'Keranjang masih kosong.');
    const { subtotal, tax, total } = summarize(items);
    const num = orderNumber();

    const { rows } = await db.query(
      `INSERT INTO orders (order_number, user_id, subtotal, tax_amount, total_amount, payment_provider, payment_method, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [num, req.user.id, subtotal, tax, total, provider.name, method, req.body.notes?.trim() || null]
    );
    const orderId = rows[0].id;

    for (const i of items) {
      await db.query(
        `INSERT INTO order_items (order_id, package_id, service_name, package_name, unit_price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, i.package_id, i.service_name, i.package_name, i.price, i.quantity]
      );
    }

    const charge = await provider.createCharge({ id: orderId, total }, method);
    await db.query('UPDATE orders SET payment_ref = $1 WHERE id = $2', [charge.reference, orderId]);
    await db.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    return num;
  });

  res.status(201).json({ order: await findOrder(req.user.id, number) });
}

export async function listOrders(req, res) {
  const { rows } = await query(ORDER_SQL.replace('%WHERE%', ''), [req.user.id]);
  res.json({ orders: rows });
}

export async function getOrder(req, res) {
  res.json({ order: await findOrder(req.user.id, req.params.number) });
}

// Konfirmasi pembayaran. Dengan gateway asli, ini digantikan webhook/callback dari provider.
export async function pay(req, res) {
  const order = await findOrder(req.user.id, req.params.number);
  if (order.status === 'paid') throw new HttpError(400, 'Pesanan sudah dibayar.');
  if (order.status === 'cancelled') throw new HttpError(400, 'Pesanan sudah dibatalkan.');

  const result = await getPaymentProvider().confirm(order, req.body);
  await query(
    `UPDATE orders SET status = $1::order_status, paid_at = CASE WHEN $1::text = 'paid' THEN NOW() END WHERE id = $2`,
    [result.status, order.id]
  );
  res.json({ order: await findOrder(req.user.id, order.order_number) });
}

export async function cancel(req, res) {
  const order = await findOrder(req.user.id, req.params.number);
  if (order.status === 'paid') throw new HttpError(400, 'Pesanan yang sudah dibayar tidak dapat dibatalkan.');
  await query(`UPDATE orders SET status = 'cancelled' WHERE id = $1`, [order.id]);
  res.json({ order: await findOrder(req.user.id, order.order_number) });
}

import { query } from '../config/db.js';
import { HttpError, isEmail, requireFields } from '../utils/http.js';

export async function createMessage(req, res) {
  requireFields(req.body, ['name', 'email', 'message']);
  const { name, email, phone, subject, message } = req.body;
  if (!isEmail(email.trim())) throw new HttpError(400, 'Format email tidak valid.');
  if (message.length > 5000) throw new HttpError(400, 'Pesan terlalu panjang (maks. 5000 karakter).');

  await query(
    `INSERT INTO contact_messages (name, email, phone, subject, message) VALUES ($1, $2, $3, $4, $5)`,
    [name.trim(), email.trim().toLowerCase(), phone?.trim() || null, subject?.trim() || null, message.trim()]
  );
  res.status(201).json({ ok: true, message: 'Terima kasih! Tim kami akan menghubungi Anda segera.' });
}

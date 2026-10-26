import { query } from '../config/db.js';
import { HttpError } from '../utils/http.js';

const SERVICES_SQL = `
  SELECT s.id, s.slug, s.code, s.name, s.tagline, s.description,
         COALESCE(json_agg(json_build_object(
           'id', p.id, 'name', p.name, 'price', p.price,
           'duration', p.duration, 'features', p.features
         ) ORDER BY p.sort_order) FILTER (WHERE p.id IS NOT NULL), '[]') AS packages,
         MIN(p.price) AS price_from
    FROM services s
    LEFT JOIN service_packages p ON p.service_id = s.id AND p.is_active
   WHERE s.is_active %WHERE%
   GROUP BY s.id
   ORDER BY s.sort_order`;

export async function listServices(_req, res) {
  const { rows } = await query(SERVICES_SQL.replace('%WHERE%', ''));
  res.json({ services: rows });
}

export async function getService(req, res) {
  const { rows } = await query(SERVICES_SQL.replace('%WHERE%', 'AND s.slug = $1'), [req.params.slug]);
  if (!rows[0]) throw new HttpError(404, 'Layanan tidak ditemukan.');
  res.json({ service: rows[0] });
}

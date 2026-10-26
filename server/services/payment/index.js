// Payment gateway adapter.
// Setiap provider mengekspor { name, methods, createCharge(order, method), confirm(order, payload) }.
// Untuk integrasi nanti cukup tambah file (mis. midtrans.js / xendit.js) lalu daftarkan di sini.
import { config } from '../../config/index.js';
import dummy from './dummy.js';

const providers = { dummy };

export function getPaymentProvider() {
  const provider = providers[config.paymentProvider];
  if (!provider) throw new Error(`Payment provider "${config.paymentProvider}" belum didukung.`);
  return provider;
}

// Dummy payment provider — TIDAK memproses uang sungguhan.
// Mensimulasikan alur gateway: createCharge -> user "membayar" -> confirm (sukses / gagal).
import crypto from 'node:crypto';

export default {
  name: 'dummy',

  methods: [
    { code: 'va_bca', label: 'Virtual Account BCA' },
    { code: 'va_mandiri', label: 'Virtual Account Mandiri' },
    { code: 'qris', label: 'QRIS' },
    { code: 'credit_card', label: 'Kartu Kredit' },
  ],

  async createCharge(order, method) {
    if (!this.methods.some((m) => m.code === method)) throw new Error('Metode pembayaran tidak dikenal.');
    return {
      reference: `DUMMY-${crypto.randomBytes(5).toString('hex').toUpperCase()}`,
      method,
      // Pada gateway asli, ini nomor VA / QR string / redirect URL
      instructions: method.startsWith('va_')
        ? { va_number: `8808${String(order.id).padStart(6, '0')}${Math.floor(Math.random() * 1e4)}` }
        : { note: 'Simulasi pembayaran — klik "Bayar Sekarang" untuk menyelesaikan.' },
    };
  },

  // payload.simulate: 'success' | 'failed'
  async confirm(_order, payload) {
    return { status: payload?.simulate === 'failed' ? 'failed' : 'paid' };
  },
};

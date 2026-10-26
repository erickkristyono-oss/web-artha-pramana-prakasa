import { api } from '../core/api.js';
import { requireUser } from '../core/auth.js';
import { initLayout, refreshCartBadge } from '../core/layout.js';
import { escapeHtml, formData, formatRupiah, qs, setLoading, showAlert } from '../core/ui.js';

const root = () => qs('[data-checkout-root]');

function render(user, { items, summary }, methods) {
  root().innerHTML = `
    <form class="shop" data-checkout-form novalidate>
      <div>
        <section class="checkout-section card chamfer">
          <h3>Data Pemesan</h3>
          <div class="form-grid" style="margin-top:18px">
            <div class="field"><label>Nama</label><input value="${escapeHtml(user.full_name)}" disabled /></div>
            <div class="field"><label>Email</label><input value="${escapeHtml(user.email)}" disabled /></div>
          </div>
        </section>
        <section class="checkout-section card chamfer">
          <h3>Metode Pembayaran</h3>
          <div class="methods">
            ${methods
              .map(
                (m, i) => `
              <label class="method">
                <input type="radio" name="payment_method" value="${escapeHtml(m.code)}"${i === 0 ? ' checked' : ''} />
                <span>${escapeHtml(m.label)}</span>
              </label>`
              )
              .join('')}
          </div>
        </section>
        <section class="checkout-section card chamfer">
          <h3>Catatan</h3>
          <div class="field" style="margin-top:18px">
            <label for="notes">Catatan untuk konsultan (opsional)</label>
            <textarea id="notes" name="notes" maxlength="1000" placeholder="Mis. jenis usaha, periode laporan, atau jadwal yang diinginkan"></textarea>
          </div>
        </section>
      </div>
      <aside class="summary card chamfer">
        <h3>Pesanan Anda</h3>
        <ul class="mini-items">
          ${items
            .map(
              (i) => `
            <li>
              <span><strong>${escapeHtml(i.service_name)}</strong><br />Paket ${escapeHtml(i.package_name)} × ${i.quantity}</span>
              <span>${formatRupiah(i.price * i.quantity)}</span>
            </li>`
            )
            .join('')}
        </ul>
        <div class="summary__row"><span>Subtotal</span><span>${formatRupiah(summary.subtotal)}</span></div>
        <div class="summary__row"><span>PPN 11%</span><span>${formatRupiah(summary.tax)}</span></div>
        <div class="summary__row summary__row--total"><span>Total</span><span>${formatRupiah(summary.total)}</span></div>
        <div class="form-alert" data-alert role="alert"></div>
        <button class="btn btn-primary btn-block" type="submit">Buat Pesanan &amp; Bayar</button>
        <p class="summary__note">Dengan melanjutkan, pesanan akan dibuat dan Anda diarahkan ke halaman pembayaran.</p>
      </aside>
    </form>`;

  const form = qs('[data-checkout-form]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertEl = qs('[data-alert]', form);
    const data = formData(form);
    if (!data.payment_method) return showAlert(alertEl, 'Pilih metode pembayaran.');

    const button = qs('button[type="submit"]', form);
    setLoading(button, true);
    showAlert(alertEl, '');
    try {
      const { order } = await api('/orders', { method: 'POST', body: data });
      refreshCartBadge(0);
      location.replace(`/payment?order=${encodeURIComponent(order.order_number)}`);
    } catch (err) {
      showAlert(alertEl, err.message);
      setLoading(button, false);
    }
  });
}

async function init() {
  const user = await requireUser();
  initLayout();
  const [cart, { methods }] = await Promise.all([api('/cart'), api('/payments/methods')]);
  if (!cart.items.length) return location.replace('/cart');
  render(user, cart, methods);
}

init();

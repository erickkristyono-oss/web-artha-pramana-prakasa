import { api } from '../core/api.js';
import { requireUser } from '../core/auth.js';
import { icons } from '../core/icons.js';
import { initLayout } from '../core/layout.js';
import { escapeHtml, formatDate, formatRupiah, qs } from '../core/ui.js';

const STATUS_LABEL = { pending: 'Menunggu Bayar', paid: 'Lunas', failed: 'Gagal', cancelled: 'Dibatalkan' };

function orderHtml(order, i) {
  const payable = order.status === 'pending' || order.status === 'failed';
  return `
    <article class="order chamfer" style="animation-delay:${i * 70}ms">
      <div class="order__head">
        <div>
          <h4>${escapeHtml(order.order_number)}</h4>
          <small>${formatDate(order.created_at)}</small>
        </div>
        <span class="badge badge--${order.status}">${STATUS_LABEL[order.status] || escapeHtml(order.status)}</span>
      </div>
      <ul>
        ${order.items
          .map(
            (it) => `
          <li>
            <span>${escapeHtml(it.service_name)} — Paket ${escapeHtml(it.package_name)} × ${it.quantity}</span>
            <span>${formatRupiah(it.unit_price * it.quantity)}</span>
          </li>`
          )
          .join('')}
      </ul>
      <div class="order__foot">
        <span class="order__total">Total <strong>${formatRupiah(order.total_amount)}</strong></span>
        <a class="btn ${payable ? 'btn-primary' : 'btn-outline'} btn-sm" href="/payment?order=${encodeURIComponent(order.order_number)}">
          ${payable ? 'Bayar Sekarang' : 'Lihat Detail'}
        </a>
      </div>
    </article>`;
}

async function init() {
  await requireUser();
  initLayout();
  const root = qs('[data-orders-root]');
  try {
    const { orders } = await api('/orders');
    root.innerHTML = orders.length
      ? `<div class="orders">${orders.map(orderHtml).join('')}</div>`
      : `<div class="empty chamfer" style="margin-top:clamp(32px,5vw,56px)">
          ${icons.emptyCart}
          <h3>Belum ada pesanan</h3>
          <p>Pesanan yang Anda buat akan tampil di sini.</p>
          <a class="btn btn-primary btn-sm" href="/#service">Lihat Layanan</a>
        </div>`;
  } catch (err) {
    root.innerHTML = `<div class="empty chamfer"><h3>Gagal memuat pesanan</h3><p>${escapeHtml(err.message)}</p></div>`;
  }
}

init();

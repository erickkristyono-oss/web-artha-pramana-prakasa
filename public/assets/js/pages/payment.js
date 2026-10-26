// Halaman pembayaran — saat ini mensimulasikan gateway (provider "dummy").
import { api } from '../core/api.js';
import { requireUser } from '../core/auth.js';
import { icons } from '../core/icons.js';
import { initLayout } from '../core/layout.js';
import { escapeHtml, formatDate, formatRupiah, qs, setLoading, toast } from '../core/ui.js';

const root = () => qs('[data-payment-root]');
const number = new URLSearchParams(location.search).get('order');
const STATUS_LABEL = { pending: 'Menunggu Bayar', paid: 'Lunas', failed: 'Gagal', cancelled: 'Dibatalkan' };
let methodLabels = {};

function resultHtml(order) {
  const views = {
    paid: {
      icon: icons.check,
      title: 'Pembayaran Berhasil',
      text: `Terima kasih! Tim konsultan kami akan menghubungi Anda melalui email dalam 1×24 jam kerja.`,
    },
    failed: {
      icon: icons.cross,
      title: 'Pembayaran Gagal',
      text: 'Transaksi tidak berhasil diproses. Silakan coba bayar kembali.',
    },
    cancelled: {
      icon: icons.cross,
      title: 'Pesanan Dibatalkan',
      text: 'Pesanan ini sudah dibatalkan dan tidak dapat dibayar.',
    },
  };
  const v = views[order.status];
  return `
    <div class="gateway__result">
      ${v.icon}
      <h3>${v.title}</h3>
      <p>${v.text}</p>
      <div class="gateway__actions">
        ${order.status === 'failed' ? '<button class="btn btn-primary btn-block" type="button" data-retry>Coba Bayar Lagi</button>' : ''}
        <a class="btn ${order.status === 'failed' ? 'btn-outline' : 'btn-primary'} btn-block" href="/orders">Lihat Pesanan Saya</a>
      </div>
    </div>`;
}

function pendingHtml(order) {
  return `
    <div class="gateway__code"><span>${escapeHtml(order.payment_ref || '-')}</span><small>Kode Bayar</small></div>
    <div class="gateway__actions">
      <button class="btn btn-primary btn-block" type="button" data-pay="success">Bayar Sekarang</button>
      <button class="btn btn-outline btn-block" type="button" data-pay="failed">Simulasikan Gagal</button>
      <button class="link-remove" type="button" data-cancel style="justify-self:center;margin-top:6px">Batalkan Pesanan</button>
    </div>
    <p class="gateway__warn">Mode simulasi: tidak ada uang sungguhan yang diproses. Integrasi gateway (Midtrans / Xendit) akan menggantikan langkah ini.</p>`;
}

function render(order, { retry = false } = {}) {
  const showPending = order.status === 'pending' || retry;
  root().innerHTML = `
    <div class="gateway chamfer">
      <div class="gateway__head"><span>Payment Gateway</span><strong>${escapeHtml(order.payment_provider || '')}</strong></div>
      <div class="gateway__body">
        <span class="eyebrow">Total Pembayaran</span>
        <div class="gateway__amount">${formatRupiah(order.total_amount)}</div>
        <dl>
          <dt>No. Pesanan</dt><dd>${escapeHtml(order.order_number)}</dd>
          <dt>Metode</dt><dd>${escapeHtml(methodLabels[order.payment_method] || order.payment_method)}</dd>
          <dt>Tanggal</dt><dd>${formatDate(order.created_at)}</dd>
          <dt>Status</dt><dd><span class="badge badge--${order.status}">${STATUS_LABEL[order.status] || escapeHtml(order.status)}</span></dd>
        </dl>
        ${showPending ? pendingHtml(order) : resultHtml(order)}
      </div>
    </div>`;
}

async function onClick(e, order) {
  if (e.target.closest('[data-retry]')) return render(order, { retry: true });

  const payBtn = e.target.closest('[data-pay]');
  const cancelBtn = e.target.closest('[data-cancel]');
  if (!payBtn && !cancelBtn) return;
  if (cancelBtn && !confirm('Batalkan pesanan ini?')) return;

  const button = payBtn || cancelBtn;
  setLoading(button, true);
  try {
    const path = payBtn ? 'pay' : 'cancel';
    const body = payBtn ? { simulate: payBtn.dataset.pay } : undefined;
    ({ order } = await api(`/orders/${encodeURIComponent(order.order_number)}/${path}`, { method: 'POST', body }));
    render(order);
  } catch (err) {
    toast(err.message, { type: 'error' });
    setLoading(button, false);
  }
  return order;
}

async function init() {
  await requireUser();
  initLayout();
  if (!number) return location.replace('/orders');

  try {
    const [{ order }, { methods }] = await Promise.all([
      api(`/orders/${encodeURIComponent(number)}`),
      api('/payments/methods'),
    ]);
    methodLabels = Object.fromEntries(methods.map((m) => [m.code, m.label]));
    let current = order;
    render(current);
    root().addEventListener('click', async (e) => {
      current = (await onClick(e, current)) || current;
    });
  } catch (err) {
    root().innerHTML = `
      <div class="empty chamfer" style="margin-top:clamp(32px,5vw,56px)">
        <h3>Pesanan tidak ditemukan</h3>
        <p>${escapeHtml(err.message)}</p>
        <a class="btn btn-primary btn-sm" href="/orders">Pesanan Saya</a>
      </div>`;
  }
}

init();

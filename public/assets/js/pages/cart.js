import { api } from '../core/api.js';
import { requireUser } from '../core/auth.js';
import { icons } from '../core/icons.js';
import { initLayout, refreshCartBadge } from '../core/layout.js';
import { escapeHtml, formatRupiah, qs, setLoading, toast } from '../core/ui.js';

const root = () => qs('[data-cart-root]');

function emptyHtml() {
  return `
    <div class="empty chamfer" style="margin-top:clamp(32px,5vw,56px)">
      ${icons.emptyCart}
      <h3>Keranjang masih kosong</h3>
      <p>Pilih paket layanan konsultasi yang sesuai dengan kebutuhan bisnis Anda.</p>
      <a class="btn btn-primary btn-sm" href="/#service">Lihat Layanan</a>
    </div>`;
}

function itemHtml(item, i) {
  return `
    <article class="cart-item chamfer" data-item="${item.id}" style="animation-delay:${i * 70}ms">
      <span class="cart-item__code">${escapeHtml(item.service_code)}</span>
      <div>
        <h4>${escapeHtml(item.service_name)}</h4>
        <div class="cart-item__meta">Paket <strong>${escapeHtml(item.package_name)}</strong> · ${escapeHtml(item.duration)}</div>
      </div>
      <div class="qty" aria-label="Jumlah">
        <button type="button" data-qty="-1" aria-label="Kurangi"${item.quantity <= 1 ? ' disabled' : ''}>−</button>
        <span>${item.quantity}</span>
        <button type="button" data-qty="1" aria-label="Tambah"${item.quantity >= 10 ? ' disabled' : ''}>+</button>
      </div>
      <div class="cart-item__right">
        <span class="cart-item__price">${formatRupiah(item.price * item.quantity)}</span>
        <button class="link-remove" type="button" data-remove>Hapus</button>
      </div>
    </article>`;
}

function render({ items, summary }) {
  refreshCartBadge(summary.count);
  if (!items.length) {
    root().innerHTML = emptyHtml();
    return;
  }
  root().innerHTML = `
    <div class="shop">
      <div class="cart-list">${items.map(itemHtml).join('')}</div>
      <aside class="summary card chamfer">
        <h3>Ringkasan</h3>
        <div class="summary__row"><span>Subtotal (${summary.count} item)</span><span>${formatRupiah(summary.subtotal)}</span></div>
        <div class="summary__row"><span>PPN 11%</span><span>${formatRupiah(summary.tax)}</span></div>
        <div class="summary__row summary__row--total"><span>Total</span><span>${formatRupiah(summary.total)}</span></div>
        <a class="btn btn-primary btn-block" href="/checkout">Lanjut ke Checkout</a>
        <a class="btn btn-outline btn-sm btn-block" href="/#service">Tambah Layanan Lain</a>
      </aside>
    </div>`;
}

async function onClick(e) {
  const itemEl = e.target.closest('[data-item]');
  if (!itemEl) return;
  const id = itemEl.dataset.item;

  const qtyBtn = e.target.closest('[data-qty]');
  if (qtyBtn) {
    const quantity = Number(qs('.qty span', itemEl).textContent) + Number(qtyBtn.dataset.qty);
    try {
      render(await api(`/cart/${id}`, { method: 'PATCH', body: { quantity } }));
    } catch (err) {
      toast(err.message, { type: 'error' });
    }
    return;
  }

  const removeBtn = e.target.closest('[data-remove]');
  if (removeBtn) {
    setLoading(removeBtn, true);
    try {
      const data = await api(`/cart/${id}`, { method: 'DELETE' });
      itemEl.classList.add('is-removing');
      setTimeout(() => render(data), 300);
    } catch (err) {
      toast(err.message, { type: 'error' });
      setLoading(removeBtn, false);
    }
  }
}

async function init() {
  await requireUser();
  initLayout();
  root().addEventListener('click', onClick);

  // ?add=<package_id> — datang dari "Tambah ke Keranjang" sebelum login
  const params = new URLSearchParams(location.search);
  const addId = Number(params.get('add'));
  if (params.has('add')) history.replaceState(null, '', '/cart');

  try {
    if (Number.isInteger(addId) && addId > 0) {
      render(await api('/cart', { method: 'POST', body: { package_id: addId } }));
      toast('Paket ditambahkan ke keranjang.');
    } else {
      render(await api('/cart'));
    }
  } catch (err) {
    toast(err.message, { type: 'error' });
    render(await api('/cart'));
  }
}

init();

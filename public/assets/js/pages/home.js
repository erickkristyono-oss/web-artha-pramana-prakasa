import { api } from '../core/api.js';
import { getUser, loginUrl } from '../core/auth.js';
import { COMPANY, SERVICE_NAMES, waLink } from '../core/config.js';
import { icons } from '../core/icons.js';
import { initLayout, refreshCartBadge } from '../core/layout.js';
import {
  escapeHtml, formData, formatRupiah, initReveal, keepVideoPlaying,
  prefersReducedMotion, qs, qsa, setLoading, showAlert, toast,
} from '../core/ui.js';

let services = [];

// ---------- Service ----------
function renderServices() {
  const grid = qs('[data-service-grid]');
  grid.innerHTML = services
    .map(
      (s, i) => `
      <article class="service-card chamfer" data-reveal style="--delay:${i * 90}ms">
        <span class="service-card__code">${escapeHtml(s.code)}</span>
        <h3>${escapeHtml(s.name)}</h3>
        <p>${escapeHtml(s.tagline)}</p>
        <div class="service-card__foot">
          <span class="service-card__price">Mulai dari <strong>${formatRupiah(s.price_from)}</strong></span>
          <button class="btn btn-primary btn-sm" type="button" data-open-service="${escapeHtml(s.slug)}">Pilih Paket</button>
        </div>
      </article>`
    )
    .join('');
  initReveal(grid);
}

async function loadServices() {
  const grid = qs('[data-service-grid]');
  try {
    ({ services } = await api('/services'));
    renderServices();
  } catch {
    grid.innerHTML = `<div class="empty chamfer" style="grid-column:1/-1">
      <h3>Layanan belum dapat dimuat</h3>
      <p>Silakan muat ulang halaman atau hubungi kami via WhatsApp.</p>
      <a class="btn btn-wa btn-sm" href="${waLink()}" target="_blank" rel="noopener">Chat WhatsApp</a></div>`;
  }
}

// ---------- Modal paket ----------
const modal = () => qs('[data-package-modal]');

function openPackages(slug) {
  const s = services.find((x) => x.slug === slug);
  if (!s) return;
  const featuredIndex = Math.min(1, s.packages.length - 1);
  qs('[data-package-content]').innerHTML = `
    <div class="packages__head">
      <span class="eyebrow">Layanan ${escapeHtml(s.code)}</span>
      <h3 id="pkg-title">${escapeHtml(s.name)}</h3>
      <p>${escapeHtml(s.description)}</p>
    </div>
    <div class="package-grid">
      ${s.packages
        .map(
          (p, i) => `
        <div class="package chamfer${i === featuredIndex ? ' package--featured' : ''}">
          ${i === featuredIndex ? '<span class="package__tag">Paling Diminati</span>' : ''}
          <h4>${escapeHtml(p.name)}</h4>
          <div class="package__price">${formatRupiah(p.price)}</div>
          <div class="package__duration">${escapeHtml(p.duration)}</div>
          <ul>${p.features.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
          <button class="btn btn-primary btn-sm btn-block" type="button" data-add-package="${p.id}">Tambah ke Keranjang</button>
        </div>`
        )
        .join('')}
    </div>`;
  modal().hidden = false;
  document.body.classList.add('is-locked');
  qs('[data-modal-close]').focus();
}

function closePackages() {
  modal().hidden = true;
  document.body.classList.remove('is-locked');
}

async function addToCart(packageId, button) {
  const user = await getUser();
  if (!user) {
    // wajib login: setelah login, cart otomatis menambahkan paket ini
    location.href = loginUrl(`/cart?add=${packageId}`);
    return;
  }
  setLoading(button, true);
  try {
    const { summary } = await api('/cart', { method: 'POST', body: { package_id: packageId } });
    refreshCartBadge(summary.count);
    closePackages();
    toast('Paket ditambahkan ke keranjang.', { action: { label: 'Lihat Keranjang', href: '/cart' } });
  } catch (err) {
    toast(err.message, { type: 'error' });
  } finally {
    setLoading(button, false);
  }
}

// ---------- About values ----------
function renderValues() {
  const values = [
    { icon: icons.target, title: 'Akurat & Terukur', text: 'Setiap angka diverifikasi dan disusun sesuai standar akuntansi yang berlaku.' },
    { icon: icons.shield, title: 'Patuh Regulasi', text: 'Pendekatan yang selaras dengan ketentuan perpajakan dan pelaporan di Indonesia.' },
    { icon: icons.chart, title: 'Berorientasi Pertumbuhan', text: 'Analisis dan rekomendasi yang mendorong keputusan bisnis yang lebih baik.' },
  ];
  qs('[data-values]').innerHTML = values
    .map(
      (v, i) => `<div class="value chamfer" data-reveal style="--delay:${i * 110}ms">${v.icon}<h4>${v.title}</h4><p>${v.text}</p></div>`
    )
    .join('');
}

// ---------- Contact ----------
function renderContact() {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(COMPANY.mapQuery)}&z=16&output=embed`;
  qs('[data-contact-list]').innerHTML = `
    <a class="contact-item chamfer" href="${waLink()}" target="_blank" rel="noopener">
      <span class="contact-item__icon">${icons.phone}</span>
      <div><small>WhatsApp / Telepon</small><span>${COMPANY.phoneDisplay}</span></div>
    </a>
    <a class="contact-item chamfer" href="mailto:${COMPANY.email}">
      <span class="contact-item__icon">${icons.email}</span>
      <div><small>Email</small><span>${COMPANY.email}</span></div>
    </a>
    <div class="contact-item chamfer">
      <span class="contact-item__icon">${icons.pin}</span>
      <div><small>Alamat</small><span>${escapeHtml(COMPANY.address)}</span></div>
    </div>
    <a class="btn btn-wa" href="${waLink()}" target="_blank" rel="noopener">Hubungi via WhatsApp</a>
    <div class="contact__map chamfer">
      <iframe title="Lokasi kantor ${COMPANY.name}" src="${mapSrc}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>`;

  qs('[data-subject-select]').insertAdjacentHTML(
    'beforeend',
    [...SERVICE_NAMES, 'Lainnya'].map((s) => `<option>${escapeHtml(s)}</option>`).join('')
  );
}

function bindContactForm() {
  const form = qs('[data-contact-form]');
  const alertEl = qs('[data-alert]', form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = formData(form);
    if (!data.name.trim() || !data.email.trim() || !data.message.trim()) {
      return showAlert(alertEl, 'Nama, email, dan pesan wajib diisi.');
    }
    const button = qs('button[type="submit"]', form);
    setLoading(button, true);
    try {
      const res = await api('/contact', { method: 'POST', body: data });
      form.reset();
      showAlert(alertEl, res.message, { success: true });
    } catch (err) {
      showAlert(alertEl, err.message);
    } finally {
      setLoading(button, false);
    }
  });
}

// ---------- Motion ----------
function bindActiveNav() {
  const links = qsa('[data-nav]');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('is-active', a.dataset.nav === entry.target.id));
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  ['home', 'service', 'about', 'contact'].forEach((id) => io.observe(document.getElementById(id)));
}

function bindHeroParallax() {
  if (prefersReducedMotion()) return;
  const video = qs('.hero__video');
  const hero = qs('.hero');
  let ticking = false;
  addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(scrollY, hero.offsetHeight);
        video.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
        ticking = false;
      });
    },
    { passive: true }
  );
}

// ---------- Init ----------
async function init() {
  initLayout({ variant: 'hero' }).then(bindActiveNav);
  qsa('video').forEach(keepVideoPlaying);
  renderValues();
  renderContact();
  bindContactForm();
  bindHeroParallax();
  initReveal();

  document.addEventListener('click', (e) => {
    const open = e.target.closest('[data-open-service]');
    if (open) return openPackages(open.dataset.openService);
    const add = e.target.closest('[data-add-package]');
    if (add) return addToCart(Number(add.dataset.addPackage), add);
    if (e.target.closest('[data-modal-close]') || e.target === modal()) closePackages();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal().hidden) closePackages();
  });

  await loadServices();
}

init();

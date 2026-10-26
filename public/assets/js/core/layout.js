// Header, footer, tombol WhatsApp — dirender sekali dan dipakai di semua halaman.
import { api } from './api.js';
import { getUser, loginUrl, logout } from './auth.js';
import { COMPANY, SERVICE_NAMES, waLink } from './config.js';
import { icons } from './icons.js';
import { escapeHtml, qs, qsa } from './ui.js';

const NAV = [
  { id: 'home', label: 'Home', href: '/#home' },
  { id: 'service', label: 'Service', href: '/#service' },
  { id: 'about', label: 'About Us', href: '/#about' },
  { id: 'contact', label: 'Contact Us', href: '/#contact' },
];

const brandHtml = (light = false) => `
  <a class="brand${light ? ' brand--light' : ''}" href="/" aria-label="${COMPANY.name} — beranda">
    ${icons.logo}
    <span class="brand__text"><span class="brand__name">artha</span><span class="brand__sub">Pramana Prakasa</span></span>
  </a>`;

function headerHtml(variant) {
  const links = NAV.map((l) => `<li><a href="${l.href}" data-nav="${l.id}">${l.label}</a></li>`).join('');
  return `
  <nav class="nav nav--${variant}" aria-label="Navigasi utama">
    ${brandHtml()}
    <ul class="nav__links">${links}</ul>
    <div class="nav__actions">
      <a class="nav__action nav__cart" href="/cart" aria-label="Keranjang">
        ${icons.cart}<span class="cart-badge" hidden>0</span>
      </a>
      <div class="nav__auth" data-auth-desktop></div>
      <a class="nav__action nav__contact" href="/#contact">${icons.mail}<span>Contact us</span></a>
    </div>
    <button class="nav__burger" type="button" aria-label="Buka menu" aria-expanded="false" aria-controls="mobile-menu">
      <span></span><span></span><span></span>
    </button>
    <div class="nav__mobile" id="mobile-menu" hidden>
      ${NAV.map((l) => `<a href="${l.href}">${l.label}</a>`).join('')}
      <hr />
      <div data-auth-mobile style="display:contents"></div>
    </div>
  </nav>`;
}

function footerHtml() {
  const year = new Date().getFullYear();
  return `
  <footer class="footer">
    <div class="footer__top">
      <div class="footer__brand">
        ${brandHtml(true)}
        <p>Konsultan keuangan profesional untuk laporan keuangan, sistem akuntansi, perpajakan, dan restrukturisasi bisnis Anda.</p>
        <a class="btn btn-wa btn-sm" href="${waLink()}" target="_blank" rel="noopener">Chat WhatsApp</a>
      </div>
      <div>
        <h4>Navigasi</h4>
        <ul>${NAV.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h4>Layanan</h4>
        <ul>${SERVICE_NAMES.map((s) => `<li><a href="/#service">${escapeHtml(s)}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h4>Kontak</h4>
        <address>
          <span>${escapeHtml(COMPANY.address)}</span>
          <span><a href="tel:${COMPANY.phone}">${COMPANY.phoneDisplay}</a></span>
          <span><a href="mailto:${COMPANY.email}">${COMPANY.email}</a></span>
        </address>
      </div>
    </div>
    <div class="footer__bottom">
      <span>© ${year} ${COMPANY.name}. All rights reserved.</span>
      <span>Financial Consulting · Jakarta</span>
    </div>
    <div class="footer__mark" aria-hidden="true">Artha Pramana</div>
  </footer>`;
}

const waFloatHtml = () => `
  <a class="wa-float" href="${waLink()}" target="_blank" rel="noopener" aria-label="Hubungi kami via WhatsApp">
    <span class="wa-float__label">Chat via WhatsApp</span>
    <span class="wa-float__btn">${icons.whatsapp}</span>
  </a>`;

function renderAuth(user) {
  const desktop = qs('[data-auth-desktop]');
  const mobile = qs('[data-auth-mobile]');
  if (!desktop || !mobile) return;

  if (!user) {
    desktop.innerHTML = `<a class="nav__action" href="${loginUrl()}">${icons.user}<span>Login</span></a>`;
    mobile.innerHTML = `<a href="${loginUrl()}">Login</a><a href="/register">Daftar Akun</a>`;
    return;
  }

  const firstName = escapeHtml(user.full_name.split(' ')[0]);
  desktop.innerHTML = `
    <button class="nav__action" type="button" aria-haspopup="true" aria-expanded="false" data-user-toggle>
      ${icons.user}<span>${firstName}</span>
    </button>
    <div class="dropdown" data-user-menu>
      <div class="dropdown__inner chamfer">
        <div class="dropdown__head"><strong>${escapeHtml(user.full_name)}</strong><span>${escapeHtml(user.email)}</span></div>
        <a href="/orders">Pesanan Saya</a>
        <a href="/cart">Keranjang</a>
        <button type="button" class="is-danger" data-logout>Logout</button>
      </div>
    </div>`;
  mobile.innerHTML = `
    <a href="/orders">Pesanan Saya</a>
    <a href="/cart">Keranjang</a>
    <button type="button" class="is-danger" data-logout>Logout (${firstName})</button>`;

  const toggle = qs('[data-user-toggle]');
  const menu = qs('[data-user-menu]');
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target)) {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
  qsa('[data-logout]').forEach((btn) => btn.addEventListener('click', logout));
}

function bindBurger() {
  const burger = qs('.nav__burger');
  const menu = qs('#mobile-menu');
  if (!burger || !menu) return;
  const setOpen = (open) => {
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
  };
  burger.addEventListener('click', () => setOpen(menu.hidden));
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
  // tutup otomatis jika layar melebar melewati breakpoint mobile
  addEventListener('resize', () => {
    if (window.innerWidth > 700) setOpen(false);
  });
}

export async function refreshCartBadge(count) {
  if (count === undefined) {
    try {
      count = (await api('/cart')).summary.count;
    } catch {
      count = 0;
    }
  }
  qsa('.cart-badge').forEach((badge) => {
    const changed = badge.textContent !== String(count);
    badge.textContent = count;
    badge.hidden = !count;
    if (changed && count) {
      badge.classList.remove('is-bump');
      void badge.offsetWidth; // restart animasi
      badge.classList.add('is-bump');
    }
  });
}

/**
 * Render layout umum. variant: 'hero' (navbar di atas video home) | 'solid' (halaman lain).
 * Mengembalikan user yang sedang login (atau null).
 */
export async function initLayout({ variant = 'solid' } = {}) {
  const header = qs('#site-header');
  const footer = qs('#site-footer');
  if (header) header.outerHTML = headerHtml(variant);
  if (footer) footer.outerHTML = footerHtml();
  document.body.insertAdjacentHTML('beforeend', waFloatHtml());
  bindBurger();

  const user = await getUser();
  renderAuth(user);
  if (user) refreshCartBadge();
  return user;
}

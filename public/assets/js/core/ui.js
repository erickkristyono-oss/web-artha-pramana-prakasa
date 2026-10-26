// Utilitas UI: format, escape, toast, reveal-on-scroll, video autoplay, loading button.

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
export const formatRupiah = (n) => rupiah.format(Number(n) || 0);

const dateFmt = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
export const formatDate = (d) => dateFmt.format(new Date(d));

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Toast ----------
export function toast(message, { type = 'info', action, duration = 4200 } = {}) {
  let stack = qs('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    stack.setAttribute('role', 'status');
    stack.setAttribute('aria-live', 'polite');
    document.body.append(stack);
  }
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `<span>${escapeHtml(message)}</span>${
    action ? `<a href="${escapeHtml(action.href)}">${escapeHtml(action.label)}</a>` : ''
  }`;
  stack.append(el);
  setTimeout(() => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 300);
  }, duration);
}

// ---------- Form helpers ----------
export function setLoading(button, loading) {
  if (!button) return;
  button.disabled = loading;
  button.classList.toggle('is-loading', loading);
  if (loading && !button.querySelector('.spinner')) {
    button.insertAdjacentHTML('beforeend', '<span class="spinner" aria-hidden="true"></span>');
  } else if (!loading) {
    button.querySelector('.spinner')?.remove();
  }
}

export function showAlert(el, message, { success = false } = {}) {
  if (!el) return;
  el.textContent = message || '';
  el.classList.toggle('is-visible', Boolean(message));
  el.classList.toggle('is-success', success);
}

export const formData = (form) => Object.fromEntries(new FormData(form).entries());

// ---------- Reveal on scroll ----------
export function initReveal(root = document) {
  const items = qsa('[data-reveal]:not(.is-visible)', root);
  if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  items.forEach((el) => io.observe(el));
}

// ---------- Video autoplay robust ----------
// Selalu muted sebelum play, telan penolakan, retry tiap 1 detik & saat interaksi pertama.
export function keepVideoPlaying(video) {
  if (!video) return;
  const tryPlay = () => {
    video.muted = true;
    const p = video.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  };
  video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
  tryPlay();
  setInterval(() => {
    if (video.paused) tryPlay();
  }, 1000);
  const onFirstInteraction = () => {
    tryPlay();
    document.removeEventListener('click', onFirstInteraction);
    document.removeEventListener('touchstart', onFirstInteraction);
  };
  document.addEventListener('click', onFirstInteraction);
  document.addEventListener('touchstart', onFirstInteraction, { passive: true });
}

export function bindPasswordToggles(root = document) {
  qsa('[data-pw-toggle]', root).forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? 'Sembunyi' : 'Lihat';
    });
  });
}

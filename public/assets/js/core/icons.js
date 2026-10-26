// Ikon SVG inline (stroke mengikuti currentColor)
const svg = (w, h, body, extra = '') =>
  `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true" ${extra}>${body}</svg>`;

export const icons = {
  logo: `<svg class="brand__mark" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#111"/>
      <path d="M11.5 28.5 20 11l8.5 17.5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="square"/>
      <path d="M13.6 24.6 26.4 19.6" fill="none" stroke="#15BCDF" stroke-width="2.4" stroke-linecap="square"/>
      <circle cx="28.2" cy="18.9" r="1.9" fill="#15BCDF"/>
    </svg>`,
  mail: svg(17, 13, '<rect x="0.7" y="0.7" width="15.6" height="11.6"/><path d="M0.7 0.7 8.5 7.2l7.8-6.5"/>'),
  cart: svg(22, 20, '<path d="M1 1.5h3.2l2.4 11.2h11.2l2.2-8H5.4"/><circle cx="8.3" cy="17" r="1.5"/><circle cx="16.3" cy="17" r="1.5"/>', 'stroke-width="1.6"'),
  user: svg(18, 18, '<circle cx="9" cy="5.5" r="3.8"/><path d="M1.5 17c.8-3.6 3.8-5.8 7.5-5.8s6.7 2.2 7.5 5.8"/>', 'stroke-width="1.6"'),
  phone: svg(20, 20, '<path d="M4.5 1.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 2.5 3.5a2 2 0 0 1 2-2Z"/>', 'stroke-width="1.6"'),
  email: svg(20, 16, '<rect x="1" y="1" width="18" height="14"/><path d="m1 1 9 7.5L19 1"/>', 'stroke-width="1.6"'),
  pin: svg(18, 22, '<path d="M9 21s7-6.6 7-12A7 7 0 0 0 2 9c0 5.4 7 12 7 12Z"/><circle cx="9" cy="9" r="2.6"/>', 'stroke-width="1.6"'),
  whatsapp: `<svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><path fill="#fff" d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.4.7 4.7 1.9 6.7L3 29l6.9-2.1a12.7 12.7 0 0 0 6.1 1.6c7 0 12.7-5.7 12.7-12.7S23 3 16 3Zm0 23.2c-2 0-3.9-.5-5.5-1.5l-.4-.2-4.1 1.2 1.2-4-.3-.4a10.4 10.4 0 0 1-1.6-5.6C5.3 9.9 10.1 5.2 16 5.2s10.6 4.7 10.6 10.5S21.9 26.2 16 26.2Zm5.8-7.8c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.6 8.6 0 0 1-4.3-3.7c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.7 3.7 0 0 0-1.1 2.7 6.5 6.5 0 0 0 1.3 3.4c.2.2 2.2 3.4 5.4 4.7 2 .9 2.8.9 3.8.8.6-.1 1.9-.8 2.2-1.5s.3-1.4.2-1.5-.3-.2-.6-.4Z"/></svg>`,
  shield: svg(30, 30, '<path d="M15 2 4 6v8c0 7 5 11.5 11 14 6-2.5 11-7 11-14V6L15 2Z"/><path d="m10 15 3.5 3.5L20 12"/>', 'stroke-width="1.6"'),
  target: svg(30, 30, '<circle cx="15" cy="15" r="12"/><circle cx="15" cy="15" r="7"/><circle cx="15" cy="15" r="2"/>', 'stroke-width="1.6"'),
  chart: svg(30, 30, '<path d="M3 27h24"/><path d="M7 22v-6M13 22V11M19 22v-8M25 22V5"/>', 'stroke-width="1.8"'),
  check: `<svg class="check-draw" width="72" height="72" viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="34" fill="rgba(31,157,107,.12)"/><path d="m22 37 9 9 19-20" fill="none" stroke="#1f9d6b" stroke-width="4" stroke-linecap="square"/></svg>`,
  cross: `<svg class="check-draw" width="72" height="72" viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="34" fill="rgba(214,69,79,.12)"/><path d="m25 25 22 22M47 25 25 47" fill="none" stroke="#d6454f" stroke-width="4" stroke-linecap="square"/></svg>`,
  emptyCart: svg(64, 58, '<path d="M2 4h9l7 33h33l6-24H15"/><circle cx="23" cy="50" r="4"/><circle cx="46" cy="50" r="4"/>', 'stroke-width="2"'),
};

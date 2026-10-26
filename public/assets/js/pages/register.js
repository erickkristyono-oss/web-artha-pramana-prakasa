import { getUser, register, safeNext } from '../core/auth.js';
import { initLayout } from '../core/layout.js';
import { bindPasswordToggles, formData, qs, setLoading, showAlert } from '../core/ui.js';

const next = safeNext(new URLSearchParams(location.search).get('next'));

async function init() {
  if (await getUser()) return location.replace(next);
  initLayout();
  bindPasswordToggles();
  qs('[data-login-link]').href = `/login?next=${encodeURIComponent(next)}`;

  const form = qs('[data-register-form]');
  const alertEl = qs('[data-alert]', form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = formData(form);
    if (!data.full_name.trim() || !data.email.trim() || !data.password) {
      return showAlert(alertEl, 'Nama, email, dan password wajib diisi.');
    }
    if (data.password.length < 8) return showAlert(alertEl, 'Password minimal 8 karakter.');

    const button = qs('button[type="submit"]', form);
    setLoading(button, true);
    showAlert(alertEl, '');
    try {
      await register(data);
      location.replace(next);
    } catch (err) {
      showAlert(alertEl, err.message);
      setLoading(button, false);
    }
  });
}

init();

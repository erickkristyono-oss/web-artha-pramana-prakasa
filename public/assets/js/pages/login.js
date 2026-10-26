import { getUser, login, safeNext } from '../core/auth.js';
import { initLayout } from '../core/layout.js';
import { bindPasswordToggles, formData, qs, setLoading, showAlert } from '../core/ui.js';

const next = safeNext(new URLSearchParams(location.search).get('next'));

async function init() {
  if (await getUser()) return location.replace(next);
  initLayout();
  bindPasswordToggles();
  qs('[data-register-link]').href = `/register?next=${encodeURIComponent(next)}`;

  const form = qs('[data-login-form]');
  const alertEl = qs('[data-alert]', form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { email, password } = formData(form);
    if (!email || !password) return showAlert(alertEl, 'Email dan password wajib diisi.');

    const button = qs('button[type="submit"]', form);
    setLoading(button, true);
    showAlert(alertEl, '');
    try {
      await login(email, password);
      location.replace(next);
    } catch (err) {
      showAlert(alertEl, err.message);
      setLoading(button, false);
    }
  });
}

init();

import { api } from './api.js';

let userPromise = null;

export function getUser({ refresh = false } = {}) {
  if (!userPromise || refresh) {
    userPromise = api('/auth/me')
      .then((d) => d.user)
      .catch(() => null);
  }
  return userPromise;
}

export async function login(email, password) {
  const { user } = await api('/auth/login', { method: 'POST', body: { email, password } });
  userPromise = Promise.resolve(user);
  return user;
}

export async function register(payload) {
  const { user } = await api('/auth/register', { method: 'POST', body: payload });
  userPromise = Promise.resolve(user);
  return user;
}

export async function logout() {
  try {
    await api('/auth/logout', { method: 'POST' });
  } finally {
    userPromise = Promise.resolve(null);
    location.href = '/';
  }
}

const currentPath = () => location.pathname + location.search + location.hash;

export const loginUrl = (next = currentPath()) => `/login?next=${encodeURIComponent(next)}`;

// Hanya izinkan redirect ke path internal (cegah open redirect)
export function safeNext(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

// Untuk halaman yang wajib login: redirect bila belum login.
export async function requireUser() {
  const user = await getUser();
  if (!user) {
    location.replace(loginUrl());
    return new Promise(() => {}); // hentikan eksekusi halaman
  }
  return user;
}

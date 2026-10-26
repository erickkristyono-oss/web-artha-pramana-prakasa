// Wrapper fetch ke backend /api — cookie sesi dikirim otomatis (same-origin).
export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* respons tanpa body JSON */
  }

  if (!res.ok) {
    const err = new Error(data?.error || `Permintaan gagal (${res.status}).`);
    err.status = res.status;
    throw err;
  }
  return data;
}

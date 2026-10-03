const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

if (!API_BASE) {
  console.error('VITE_API_URL no está definida. Revisa web/.env y reinicia el servidor de Vite.');
}

/**
 * Lee el cuerpo de la respuesta como JSON sin tronar si viene vacío o no es JSON.
 * @param {Response} response
 * @returns {Promise<object>}
 */
async function parseJson(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

/**
 * Envía las credenciales al endpoint de login.
 * @param {string} matricula Número de cuenta / matrícula
 * @param {string} nip
 * @returns {Promise<{token: string, token_type: string, expires_at: string, user: object}>}
 */
export async function login(matricula, nip) {
  let response;
  try {
    response = await fetch(`${API_BASE}/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify({ numero_cuenta: matricula, nip }),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }

  const data = await parseJson(response);

  if (!response.ok) {
    // Lanza el mensaje de error que regresa Laravel
    throw new Error(data.message ?? `Error al iniciar sesión (HTTP ${response.status}).`);
  }

  return data;
}

/**
 * Cierra la sesión revocando el token en la API.
 */
export async function logout() {
  const token = localStorage.getItem('token');
  try {
    if (!token) return;

    await fetch(`${API_BASE}/logout`, {
      method:  'POST',
      headers: {
        'Accept':        'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

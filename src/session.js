/**
 * Pantalla de inicio de cada rol.
 */
const RUTAS_POR_ROL = {
  administrador: '#/admin',
  docente:       '#/docente',
  alumno:        '#/alumno',
};

/**
 * Devuelve el usuario guardado al iniciar sesión, o null si no hay sesión.
 * Si lo guardado no tiene un rol conocido (por ejemplo, una sesión de una
 * versión anterior de la API), se descarta.
 * @returns {{id: number, numero_cuenta: string, nombre: string, rol: string} | null}
 */
export function getUsuario() {
  if (!localStorage.getItem('token')) return null;

  let usuario = null;
  try {
    usuario = JSON.parse(localStorage.getItem('user'));
  } catch {
    // se descarta abajo
  }

  if (!Object.hasOwn(RUTAS_POR_ROL, usuario?.rol)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }

  return usuario;
}

/**
 * @param {string} rol
 * @returns {string}
 */
export function rutaInicio(rol) {
  return RUTAS_POR_ROL[rol] ?? '#/login';
}

/**
 * @param {string} hash
 * @returns {string | undefined} El rol al que pertenece la ruta.
 */
export function rolDeRuta(hash) {
  return Object.keys(RUTAS_POR_ROL).find(rol => RUTAS_POR_ROL[rol] === hash);
}

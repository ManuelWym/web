import { logout } from '../../api/auth.js';
import './inicio.css';


const TITULOS = {
  administrador: 'Panel de administración',
  docente:       'Mis cursos',
  alumno:        'Mis cursos',
};

/**
 * Pantalla provisional de inicio por rol (HU-01). Se reemplaza con
 * "Mis cursos" (HU-18) y el panel del administrador.
 */
export function renderInicio(container, usuario) {
  container.innerHTML = `
    <main class="inicio">
      <div class="inicio-header" >
        <h1 class="inicio-titulo">${TITULOS[usuario.rol]}</h1>
        <button id="btn-logout" class="btn-logout" >
          Cerrar sesión
        </button>
      </div>
      <p class="inicio-usuario"></p>
    </main>
  `;

  // textContent para no interpretar el nombre como HTML
  container.querySelector('.inicio-usuario').textContent =
    `${usuario.nombre} · ${usuario.numero_cuenta} · ${usuario.rol}`;

  // Manejador del evento para el botón de cerrar sesión
  const btnLogout = container.querySelector('#btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      try {
        await logout();
      } catch (error) {
        console.error('No se pudo revocar la sesión en la API:', error);
      }
      window.location.hash = '#/login';
    });
  }
}

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
      </div>
      <p class="inicio-usuario"></p>
    </main>
  `;

  // textContent para no interpretar el nombre como HTML
  container.querySelector('.inicio-usuario').textContent =
    `${usuario.nombre} · ${usuario.numero_cuenta} · ${usuario.rol}`;
}
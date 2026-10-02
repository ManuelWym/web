import "./styles/main.css";
import { renderLogin } from "./pages/login/login.js";
import { renderInicio } from "./pages/inicio/inicio.js";
import { getUsuario, rutaInicio, rolDeRuta } from "./session.js";

const app = document.getElementById("app");

// Router minimalista basado en el hash
function router() {
  const hash = window.location.hash || "#/login";
  const usuario = getUsuario();

  // Sin sesión solo se puede ver el login
  if (!usuario) {
    if (hash !== "#/login") {
      window.location.hash = "#/login";
      return;
    }
    renderLogin(app);
    return;
  }

  // Con sesión, cada usuario va a la pantalla de su rol
  if (rolDeRuta(hash) !== usuario.rol) {
    window.location.hash = rutaInicio(usuario.rol);
    return;
  }

  renderInicio(app, usuario);
}

window.addEventListener("hashchange", router);
router();

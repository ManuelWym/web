import { login } from "../../api/auth.js";
import { rutaInicio } from "../../session.js";
import logoAula from "../../assets/logo-aula-uas.png";

import "./login.css";

export function renderLogin(container) {
  container.innerHTML = `
    <div class="login-container">
      
      <!-- Lado Izquierdo (Imagen de fondo + Textos) -->
      <div class="login-left">
        <div class="login-left-content">
          <h1 class="login-left-title">Bienvenido a<br>Aula UAS</h1>
          <p class="login-left-desc">
            Accede a tus cursos y gestiona tu aprendizaje de forma rápida y sencilla.
            ¡Todo en un solo lugar!
          </p>
        </div>
        <div class="login-left-footer">
          &copy; ${new Date().getFullYear()} Universidad Autónoma de Sinaloa.
        </div>
      </div>

      <!-- Lado Derecho (Formulario) -->
      <div class="login-right">
        
        <div class="login-form-wrapper">
          <img src="${logoAula}" alt="Aula Virtual UAS" class="login-heading-logo" />
 

          <!-- Alerta de error de API -->
          <div id="alert-api" class="alert alert-error" role="alert">
            <span id="alert-api-msg"></span>
          </div>

          <form class="login-form" id="login-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="matricula">Número de cuenta / Matrícula</label>
              <input
                id="matricula"
                class="form-input"
                type="text"
                name="matricula"
                placeholder="Ingrese su número de cuenta"
                inputmode="numeric"
                autocomplete="username"
                required
              />
              <span class="form-error" id="error-matricula">Ingresa un número de cuenta válido (solo dígitos).</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="nip">NIP</label>
              <input
                id="nip"
                class="form-input"
                type="password"
                name="nip"
                placeholder="Ingrese su NIP"
                autocomplete="current-password"
                required
              />
              <span class="form-error" id="error-nip">El NIP es obligatorio.</span>
            </div>

            <button type="submit" class="btn-primary" id="btn-submit">
              <span class="btn-text">Iniciar Sesión</span>
              <div class="spinner"></div>
            </button>
          </form>

          <p class="login-extra">
            ¿Olvidaste tu NIP? Contacta a soporte
          </p>
          <p class="login-extra">
            ¿No tienes cuenta? <a href="#/solicitar-acceso">Solicitar acceso</a>
          </p>
        </div>
      </div>

    </div>
  `;

  attachLoginHandlers();
}

function attachLoginHandlers() {
  const form = document.getElementById("login-form");
  const btnSubmit = document.getElementById("btn-submit");
  const alertApi = document.getElementById("alert-api");
  const alertMsg = document.getElementById("alert-api-msg");

  ["matricula", "nip"].forEach((field) => {
    document
      .getElementById(field)
      .addEventListener("input", () => clearFieldError(field));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const matricula = document.getElementById("matricula").value.trim();
    const nip = document.getElementById("nip").value;

    if (!validateForm(matricula, nip)) return;

    setLoading(true);
    hideAlert();

    try {
      const data = await login(matricula, nip);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.hash = rutaInicio(data.user.rol);
    } catch (err) {
      showAlert(err.message);
    } finally {
      setLoading(false);
    }
  });

  // ── Helpers ──────────────────────────────────────────

  function validateForm(matricula, nip) {
    let valid = true;

    if (!/^\d+$/.test(matricula)) {
      setFieldError("matricula");
      valid = false;
    }
    if (!nip) {
      setFieldError("nip");
      valid = false;
    }
    return valid;
  }

  function setFieldError(field) {
    document.getElementById(field).classList.add("is-error");
    document.getElementById(`error-${field}`).classList.add("visible");
  }

  function clearFieldError(field) {
    document.getElementById(field).classList.remove("is-error");
    document.getElementById(`error-${field}`).classList.remove("visible");
    hideAlert();
  }

  function setLoading(state) {
    btnSubmit.disabled = state;
    btnSubmit.classList.toggle("loading", state);
  }

  function showAlert(message, type = "error") {
    alertApi.className = `alert alert-${type} visible`;
    alertMsg.textContent = message;
  }

  function hideAlert() {
    alertApi.classList.remove("visible");
  }
}

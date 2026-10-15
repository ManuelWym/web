import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router";
import logoAula from "@/assets/LogoAulaUas.png";

import "./Login.css";
import { login } from "@/features/auth/services/LoginService";
import { getDashboardRouteByRole } from "@/features/auth/services/DashboardRouteService";

interface LoginProps {
  onAuthenticated: (token: string) => void;
}

export function Login({ onAuthenticated }: LoginProps) {
  const navigate = useNavigate();

  // Estado para controlar los campos del formulario
  const [formData, setFormData] = useState({
    matricula: "",
    nip: "",
  });

  // Estado para errores de validación de los campos
  const [errors, setErrors] = useState({
    matricula: false,
    nip: false,
  });

  // Estado para las alertas globales de la API
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "error",
  });

  // Estado de carga del botón submit
  const [loading, setLoading] = useState(false);

  // Manejar el cambio en los inputs y ocultar errores/alertas activas
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: false,
      }));
    }

    if (alert.show) {
      setAlert((prev) => ({
        ...prev,
        show: false,
      }));
    }
  };

  // Validar datos ingresados
  const validateForm = () => {
    const isMatriculaValid = /^\d+$/.test(formData.matricula.trim());
    const isNipValid = Boolean(formData.nip);

    setErrors({
      matricula: !isMatriculaValid,
      nip: !isNipValid,
    });

    return isMatriculaValid && isNipValid;
  };

  // Envío del formulario
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setAlert((prev) => ({ ...prev, show: false }));

    try {
      const data = await login(formData.matricula.trim(), formData.nip);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("aula-role");
      onAuthenticated(data.token);

      // Redirecciona según el rol retornado por la API
      const rutaDestino = getDashboardRouteByRole(data.user.rol);
      navigate(rutaDestino, { replace: true });
    } catch (err: any) {
      setAlert({
        show: true,
        message: err.message || "Ocurrió un error inesperado.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Lado Izquierdo (Imagen de fondo + Textos) */}
      <div className="login-left">
        <div className="login-left-content">
          <h1 className="login-left-title">
            Bienvenido a<br />
            Aula UAS
          </h1>
          <p className="login-left-desc">
            Accede a tus cursos y gestiona tu aprendizaje de forma rápida y
            sencilla. ¡Todo en un solo lugar!
          </p>
        </div>
        <div className="login-left-footer">
          &copy; {new Date().getFullYear()} Universidad Autónoma de Sinaloa.
        </div>
      </div>

      {/* Lado Derecho (Formulario) */}
      <div className="login-right">
        <div className="login-form-wrapper">
          <img
            src={logoAula}
            alt="Aula Virtual UAS"
            className="login-heading-logo"
          />

          {/* Alerta de error/éxito de la API */}
          {alert.show && (
            <div className={`alert alert-${alert.type} visible`} role="alert">
              <span>{alert.message}</span>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="matricula">
                Número de cuenta / Matrícula
              </label>
              <input
                id="matricula"
                name="matricula"
                type="text"
                className={`form-input ${errors.matricula ? "is-error" : ""}`}
                value={formData.matricula}
                onChange={handleChange}
                placeholder="Ingrese su número de cuenta"
                inputMode="numeric"
                autoComplete="username"
                required
              />
              <span
                className={`form-error ${errors.matricula ? "visible" : ""}`}
              >
                Ingresa un número de cuenta válido (solo dígitos).
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="nip">
                NIP
              </label>
              <input
                id="nip"
                name="nip"
                type="password"
                className={`form-input ${errors.nip ? "is-error" : ""}`}
                value={formData.nip}
                onChange={handleChange}
                placeholder="Ingrese su NIP"
                autoComplete="current-password"
                required
              />
              <span className={`form-error ${errors.nip ? "visible" : ""}`}>
                El NIP es obligatorio.
              </span>
            </div>

            <button
              type="submit"
              className={`btn-primary ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              <span className="btn-text">Iniciar Sesión</span>
              <div className="spinner"></div>
            </button>
          </form>

          <p className="login-extra">¿Olvidaste tu NIP? Contacta a soporte</p>
          <p className="login-extra">
            ¿No tienes cuenta?{" "}
            <a href="#/solicitar-acceso">Solicitar acceso</a>
          </p>
        </div>
      </div>
    </div>
  );
}
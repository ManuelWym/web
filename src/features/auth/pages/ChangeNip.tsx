import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  KeyRound,
  Save,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/Button";
import { changeNip } from "@/features/auth/services/ChangeNipService";
import "./ChangeNip.css";

export function ChangeNip() {
  const [currentNip, setCurrentNip] = useState("");
  const [newNip, setNewNip] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleNipChange =
    (setValue: (value: string) => void) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value.slice(0, 8));
      setSaved(false);
      setError("");
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(false);

    if (!currentNip) {
      setError("Escribe tu NIP actual.");
      return;
    }
    if (newNip.length < 4 || newNip.length > 8) {
      setError("El NIP nuevo debe tener de 4 a 8 caracteres.");
      return;
    }
    if (newNip === currentNip) {
      setError("El NIP nuevo debe ser distinto al actual.");
      return;
    }
    if (newNip !== confirmation) {
      setError("Los NIP nuevos no coinciden.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await changeNip({
        nip_actual: currentNip,
        nip: newNip,
        nip_confirmation: confirmation,
      });
      setSaved(true);
      setCurrentNip("");
      setNewNip("");
      setConfirmation("");
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo cambiar la contraseña.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="change-nip-page">
      <Link to="/perfil" className="change-nip-back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Mi perfil
      </Link>

      <header className="change-nip-heading">
        <div className="profile-eyebrow">SEGURIDAD</div>
        <h1>Cambiar contraseña</h1>
        <p>
          Escribe tu NIP actual y el nuevo dos veces. Al cambiarlo se cerrarán
          tus otras sesiones.
        </p>
      </header>

      <form className="change-nip-form" onSubmit={handleSubmit}>
        <h2>
          <KeyRound size={18} aria-hidden="true" />
          Datos de acceso
        </h2>
        <label>
          NIP actual
          <input
            type="password"
            autoComplete="current-password"
            maxLength={50}
            value={currentNip}
            onChange={handleNipChange(setCurrentNip)}
            required
          />
        </label>
        <label>
          NIP nuevo
          <input
            type="password"
            autoComplete="new-password"
            maxLength={50}
            value={newNip}
            onChange={handleNipChange(setNewNip)}
            required
          />
        </label>
        <label>
          Confirmar NIP nuevo
          <input
            type="password"
            autoComplete="new-password"
            maxLength={50}
            value={confirmation}
            onChange={handleNipChange(setConfirmation)}
            required
          />
        </label>
        {error && (
          <p className="change-nip-message change-nip-error" role="alert">
            <CircleAlert size={14} aria-hidden="true" />
            {error}
          </p>
        )}
        {saved && (
          <p className="change-nip-message change-nip-success" role="status">
            <CircleCheck size={14} aria-hidden="true" />
            Contraseña actualizada.
          </p>
        )}
        <Button type="submit" disabled={saving}>
          <Save aria-hidden="true" />
          {saving ? "Guardando..." : "Guardar contraseña"}
        </Button>
      </form>
    </main>
  );
}

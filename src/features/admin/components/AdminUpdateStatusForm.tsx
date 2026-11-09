import { CircleAlert, Save, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AdminUpdateStatusFormProps {
  currentStatus?: boolean;
  activeStatus: boolean;
  error: string;
  saving: boolean;
  loading: boolean;
  loadError: string;
  canSave: boolean;
  onStatusChange: (status: boolean) => void;
  onErrorChange: (error: string) => void;
  onSubmit: () => void;
}

export function AdminUpdateStatusForm({
  currentStatus,
  activeStatus,
  error,
  saving,
  loading,
  loadError,
  canSave,
  onStatusChange,
  onErrorChange,
  onSubmit,
}: AdminUpdateStatusFormProps) {
  return (
    <section className="admin-card admin-update-form">
      <h2>
        <ToggleRight size={18} aria-hidden="true" />
        Estado del usuario
      </h2>
      <p className="admin-update-state-current">
        Estado actual: <strong>{currentStatus ? "Activo" : "Inactivo"}</strong>
      </p>
      <div
        className="admin-update-state-options"
        role="radiogroup"
        aria-label="Estado del usuario"
      >
        <button
          type="button"
          role="radio"
          aria-checked={activeStatus}
          className={
            activeStatus
              ? "admin-update-state-option is-active"
              : "admin-update-state-option"
          }
          disabled={!canSave || saving}
          onClick={() => {
            onStatusChange(true);
            onErrorChange("");
          }}
        >
          <i aria-hidden="true" />
          Activo
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={!activeStatus}
          className={
            !activeStatus
              ? "admin-update-state-option is-inactive"
              : "admin-update-state-option"
          }
          disabled={!canSave || saving}
          onClick={() => {
            onStatusChange(false);
            onErrorChange("");
          }}
        >
          <i aria-hidden="true" />
          Inactivo
        </button>
      </div>
      <p className="admin-update-state-hint">
        {activeStatus
          ? "El usuario puede ingresar a la plataforma."
          : "El usuario no podrá ingresar hasta que se active de nuevo."}
      </p>
      {error && (
        <p className="admin-update-message admin-update-error" role="alert">
          <CircleAlert size={14} aria-hidden="true" />
          {error}
        </p>
      )}
      <Button
        type="button"
        disabled={
          saving ||
          loading ||
          Boolean(loadError) ||
          !canSave ||
          currentStatus === activeStatus
        }
        onClick={onSubmit}
      >
        <Save />
        {saving ? "Guardando..." : "Guardar estado"}
      </Button>
    </section>
  );
}

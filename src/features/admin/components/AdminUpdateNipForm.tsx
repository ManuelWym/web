import type { FormEvent } from "react";
import { CircleAlert, KeyRound, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AdminUpdateNipFormProps {
  userName?: string;
  value: string;
  error: string;
  saving: boolean;
  loading: boolean;
  loadError: string;
  canSave: boolean;
  onChange: (value: string) => void;
  onErrorChange: (error: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function AdminUpdateNipForm({
  userName,
  value,
  error,
  saving,
  loading,
  loadError,
  canSave,
  onChange,
  onErrorChange,
  onSubmit,
}: AdminUpdateNipFormProps) {
  return (
    <form className="admin-card admin-update-form" onSubmit={onSubmit}>
      <h2>
        <KeyRound size={18} aria-hidden="true" />
        Asignar NIP nuevo
      </h2>
      <p className="admin-update-state-hint">
        Asigna un NIP nuevo a {userName ?? "este usuario"}. Acepta cualquier
        carácter.
      </p>
      <label>
        NIP nuevo
        <input
          type="password"
          autoComplete="new-password"
          value={value}
          disabled={!canSave}
          onChange={(event) => {
            onChange(event.target.value);
            onErrorChange("");
          }}
        />
      </label>
      {error && (
        <p className="admin-update-message admin-update-error" role="alert">
          <CircleAlert size={14} aria-hidden="true" />
          {error}
        </p>
      )}
      <Button
        type="submit"
        disabled={
          saving || loading || Boolean(loadError) || !canSave
        }
      >
        <Save />
        {saving ? "Asignando..." : "Asignar nuevo NIP"}
      </Button>
    </form>
  );
}

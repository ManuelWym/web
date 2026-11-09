import type { FormEvent } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { adminUserRoleLabels } from "@/features/admin/components/AdminUserColumns";
import type {
  AdminUserRole,
  CreateUserPayload,
} from "@/features/admin/types/AdminUser";

interface AdminUserFormProps {
  form: CreateUserPayload;
  saving: boolean;
  onChange: <K extends keyof CreateUserPayload>(
    key: K,
    value: CreateUserPayload[K],
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function AdminUserForm({
  form,
  saving,
  onChange,
  onSubmit,
}: AdminUserFormProps) {
  return (
    <section className="admin-card">
      <h2>Registrar usuario</h2>
      <form className="admin-user-form" onSubmit={onSubmit}>
        <label>
          Número de cuenta
          <input
            name="numero_cuenta"
            value={form.numero_cuenta}
            onChange={(event) => onChange("numero_cuenta", event.target.value)}
            required
          />
        </label>
        <label>
          Nombre completo
          <input
            name="nombre"
            value={form.nombre}
            onChange={(event) => onChange("nombre", event.target.value)}
            required
          />
        </label>
        <label>
          Correo
          <input
            name="correo"
            type="email"
            value={form.correo}
            onChange={(event) => onChange("correo", event.target.value)}
          />
        </label>
        <label>
          Rol
          <select
            name="rol"
            value={form.rol}
            onChange={(event) =>
              onChange("rol", event.target.value as AdminUserRole)
            }
          >
            {Object.entries(adminUserRoleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          NIP temporal
          <input
            name="nip"
            type="password"
            autoComplete="new-password"
            value={form.nip}
            onChange={(event) => onChange("nip", event.target.value)}
            required
          />
        </label>
        <Button type="submit" disabled={saving}>
          <UserPlus />
          {saving ? "Registrando..." : "Registrar usuario"}
        </Button>
      </form>
    </section>
  );
}

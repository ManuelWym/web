import type { FormEvent } from "react";
import { CircleAlert, Save, UserCog } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { adminUserRoles, isAdminUserRole } from "@/features/admin/utils/AdminUserUtils";
import type {
  AdminUser,
  AdminUserRole,
} from "@/features/admin/types/AdminUser";

interface AdminUpdateProfileFormProps {
  selectedUser: AdminUser | null;
  name: string;
  email: string;
  role: AdminUserRole;
  error: string;
  saving: boolean;
  loading: boolean;
  loadError: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onRoleChange: (value: AdminUserRole) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function AdminUpdateProfileForm({
  selectedUser,
  name,
  email,
  role,
  error,
  saving,
  loading,
  loadError,
  onNameChange,
  onEmailChange,
  onRoleChange,
  onSubmit,
}: AdminUpdateProfileFormProps) {
  return (
    <form className="admin-card admin-update-form" onSubmit={onSubmit}>
      <h2>
        <UserCog size={18} aria-hidden="true" />
        Datos del usuario
      </h2>
      <label>
        Número de cuenta
        <input value={selectedUser?.numero_cuenta ?? ""} disabled readOnly />
      </label>
      <label>
        Nombre
        <input
          value={name}
          required
          disabled={!selectedUser}
          onChange={(event) => onNameChange(event.target.value)}
        />
      </label>
      <label>
        Correo
        <input
          type="email"
          value={email}
          disabled={!selectedUser}
          onChange={(event) => onEmailChange(event.target.value)}
        />
      </label>
      <label>
        Rol
        <select
          value={role}
          disabled={!selectedUser}
          onChange={(event) => {
            if (isAdminUserRole(event.target.value)) {
              onRoleChange(event.target.value);
            }
          }}
        >
          {adminUserRoles.map((userRole) => (
            <option key={userRole} value={userRole}>
              {userRole}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <p className="admin-update-message admin-update-error" role="alert">
          <CircleAlert size={14} aria-hidden="true" />
          {error}
        </p>
      )}
      <Button
        type="submit"
        disabled={saving || loading || Boolean(loadError) || !selectedUser}
      >
        <Save />
        {saving ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}

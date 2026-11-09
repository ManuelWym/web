import { useTable } from "@tanstack/react-table";
import {
  adminUserColumns,
  adminUserTableFeatures,
} from "@/features/admin/components/AdminUserColumns";
import type { AdminUser } from "@/features/admin/types/AdminUser";

interface AdminUsersTableProps {
  users: AdminUser[];
}

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  const table = useTable({
    features: adminUserTableFeatures,
    columns: adminUserColumns,
    data: users,
  });

  return (
    <div className="admin-table-scroll">
      <table className="admin-table">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getAllCells().map((cell) => (
                <td key={cell.id}>
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

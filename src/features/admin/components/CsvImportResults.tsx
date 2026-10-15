import {
  AlertTriangle,
  UserPlus,
  UserX,
} from "lucide-react";
import type {
  ImportResult,
  ImportTab,
  UserImportRow,
} from "@/features/admin/types/UserImport";

interface CsvImportResultsProps {
  result: ImportResult;
  tab: ImportTab;
  onTabChange: (tab: ImportTab) => void;
}

const tabs: { key: ImportTab; label: string; icon: typeof UserPlus }[] = [
  { key: "created", label: "Creados", icon: UserPlus },
  { key: "skipped", label: "Omitidos", icon: UserX },
  { key: "errors", label: "Con error", icon: AlertTriangle },
];

function ImportTable({
  rows,
  showReason,
}: {
  rows: UserImportRow[];
  showReason: boolean;
}) {
  if (rows.length === 0) {
    return <p className="admin-empty-state">Sin registros en esta lista.</p>;
  }

  return (
    <div className="admin-table-scroll">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Línea</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            {showReason && <th>Motivo</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.line}>
              <td>{row.line}</td>
              <td>{row.name || "—"}</td>
              <td>{row.email || "—"}</td>
              <td>{row.role || "—"}</td>
              {showReason && <td>{row.reason}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CsvImportResults({
  result,
  tab,
  onTabChange,
}: CsvImportResultsProps) {
  return (
    <section className="admin-card">
      <div className="admin-tabs" role="tablist" aria-label="Resultados de carga">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={tab === key ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => onTabChange(key)}
          >
            <Icon size={16} />
            {label}
            <span className="admin-count-pill">{result[key].length}</span>
          </button>
        ))}
      </div>
      <ImportTable rows={result[tab]} showReason={tab !== "created"} />
    </section>
  );
}

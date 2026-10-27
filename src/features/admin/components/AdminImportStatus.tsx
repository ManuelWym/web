import { Button } from "@/components/ui/Button";
import {
  formatImportReportItem,
  formatImportReportKey,
  getImportReportEntries,
  isRecord,
} from "@/features/admin/utils/AdminImportReport";
import type { ImportStatusResponse } from "@/features/admin/types/UserImport";

interface AdminImportStatusProps {
  status: ImportStatusResponse | null;
  error: string;
  onRetry: () => void;
}

export function AdminImportStatus({
  status,
  error,
  onRetry,
}: AdminImportStatusProps) {
  if (!status) return null;

  if (status.estado === "en_proceso") {
    return error ? (
      <section className="admin-card">
        <p className="admin-form-error" role="alert">
          {error}
        </p>
        <Button type="button" variant="outline" onClick={onRetry}>
          Reintentar consulta del estado
        </Button>
      </section>
    ) : null;
  }

  const reportEntries = getImportReportEntries(status);

  return (
    <section className="admin-card" aria-live="polite">
      <h2>
        {status.estado === "terminada"
          ? "Importación terminada"
          : "Importación fallida"}
      </h2>
      {status.mensaje && <p>{status.mensaje}</p>}
      {status.estado === "fallida" && (
        <p className="admin-form-error">
          El servidor no pudo completar la importación.
        </p>
      )}
      {reportEntries.length > 0 && (
        <div className="admin-import-summary">
          <h3>Resumen de importación</h3>
          <dl>
            {reportEntries.map(([key, value]) => (
              <div key={key}>
                <dt>{formatImportReportKey(key)}</dt>
                <dd>
                  {Array.isArray(value) ? (
                    value.length ? (
                      <ul>
                        {value.map((item, index) => (
                          <li key={`${key}-${index}`}>
                            {formatImportReportItem(item)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "Ninguno"
                    )
                  ) : isRecord(value) ? (
                    <ul>
                      {Object.entries(value).map(
                        ([detailKey, detailValue]) => (
                          <li key={detailKey}>
                            {formatImportReportKey(detailKey)}{" "}
                            {formatImportReportItem(detailValue)}
                          </li>
                        ),
                      )}
                    </ul>
                  ) : (
                    String(value)
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}

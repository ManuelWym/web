import { useState } from "react";
import { CsvImportForm } from "@/features/admin/components/CsvImportForm";
import { CsvImportResults } from "@/features/admin/components/CsvImportResults";
import { processUsersCsv } from "@/features/admin/services/ProcessUsersCsv";
import type {
  ImportResult,
  ImportTab,
} from "@/features/admin/types/UserImport";
import "./AdminDashboard.css";

const sample = `nombre,correo,rol
María López,maria.lopez@ejemplo.edu,estudiante
Alex Villa,alex.villa@ejemplo.edu,estudiante
Pedro Ruiz,pedro.ruiz@ejemplo,docente
Lucía Gómez,lucia.gomez@ejemplo.edu,administrador`;

export function AdminDashboard() {
  const [text, setText] = useState(sample);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [tab, setTab] = useState<ImportTab>("created");
  const [fileError, setFileError] = useState("");

  const handleFile = async (file?: File) => {
    if (!file) return;

    try {
      setText(await file.text());
      setFileError("");
    } catch {
      setFileError("No se pudo leer el archivo seleccionado.");
    }
  };

  const handleImport = () => {
    setResult(processUsersCsv(text));
    setTab("created");
  };

  return (
    <main className="admin-page">
      <div className="admin-page-heading">
        <div className="admin-eyebrow">ADMINISTRACIÓN</div>
        <h1>Panel de administrador</h1>
        <p>Carga usuarios nuevos desde un archivo CSV (nombre, correo, rol).</p>
      </div>

      <CsvImportForm
        text={text}
        fileError={fileError}
        onTextChange={setText}
        onFile={handleFile}
        onImport={handleImport}
      />

      {result && (
        <CsvImportResults result={result} tab={tab} onTabChange={setTab} />
      )}

      <p className="admin-sample-note">
        Vista de ejemplo · Los usuarios no se guardan en un sistema real
      </p>
    </main>
  );
}

import { useRef, type FormEvent } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CsvImportFormProps {
  file?: File;
  fileError: string;
  busy: boolean;
  processing: boolean;
  onFile: (file?: File) => void;
  onImport: () => Promise<void>;
}

export function CsvImportForm({
  file,
  fileError,
  busy,
  processing,
  onFile,
  onImport,
}: CsvImportFormProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onImport();
    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <section className="admin-card">
      <h2>Importar usuarios desde CSV</h2>
      <p>
        El archivo debe incluir las columnas{" "}
        <code>numero_cuenta,nombre,rol,nip,correo</code>. El correo es
        opcional; usa <code>alumno</code>, <code>docente</code> o{" "}
        <code>administrador</code> para el rol. El número de cuenta admite
        hasta 20 caracteres, el nombre hasta 100 y el NIP debe tener de 4 a 6
        letras o números, sin espacios ni símbolos.
      </p>
      <pre className="admin-csv-example">{`numero_cuenta,nombre,rol,nip,correo
20990001,Ana López Hernández,alumno,AB12,a.lopez@info.uas.edu.mx
20990002,José Luis Pérez Martínez,docente,XY99,`}</pre>
      <form className="admin-import-form" onSubmit={handleSubmit}>
        <label className="admin-file">
          <Upload size={18} />
          Seleccionar archivo CSV
          <input
            ref={fileInput}
            className="admin-file-input"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              onFile(event.currentTarget.files?.[0]);
              event.currentTarget.value = "";
            }}
            disabled={busy || processing}
          />
        </label>
        <span className="admin-file-name">
          {file?.name ?? "Ningún archivo seleccionado"}
        </span>
        {fileError && (
          <p className="admin-file-error" role="alert">
            {fileError}
          </p>
        )}
        <Button type="submit" disabled={!file || busy || processing}>
          <Upload />
          {busy ? "Subiendo archivo..." : "Subir e importar usuarios"}
        </Button>
      </form>
      {processing && (
        <p className="admin-empty-state" role="status">
          El archivo se está procesando en segundo plano. Esta página consultará
          el estado automáticamente.
        </p>
      )}
    </section>
  );
}

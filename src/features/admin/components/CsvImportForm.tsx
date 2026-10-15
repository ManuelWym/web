import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CsvImportFormProps {
  text: string;
  fileError: string;
  onTextChange: (text: string) => void;
  onFile: (file?: File) => void;
  onImport: () => void;
}

export function CsvImportForm({
  text,
  fileError,
  onTextChange,
  onFile,
  onImport,
}: CsvImportFormProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <section className="admin-card">
      <button
        className="admin-file"
        type="button"
        onClick={() => fileInput.current?.click()}
      >
        <Upload size={18} />
        Seleccionar archivo CSV
      </button>
      <input
        ref={fileInput}
        className="admin-file-input"
        type="file"
        accept=".csv,text/csv"
        onChange={(event) => onFile(event.target.files?.[0])}
      />
      {fileError && (
        <p className="admin-file-error" role="alert">
          {fileError}
        </p>
      )}
      <textarea
        aria-label="Contenido CSV"
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
        rows={7}
      />
      <Button type="button" onClick={onImport}>
        <Upload />
        Cargar usuarios
      </Button>
    </section>
  );
}

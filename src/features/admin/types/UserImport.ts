export type UserImportRow = {
  line: number;
  name: string;
  email: string;
  role: string;
  reason?: string;
};

export type ImportTab = "created" | "skipped" | "errors";

export type ImportResult = Record<ImportTab, UserImportRow[]>;

export interface ImportStatusResponse {
  id: string;
  estado: "en_proceso" | "terminada" | "fallida" | string;
  mensaje?: string;
  [key: string]: unknown;
}

export interface ImportUploadResponse extends ImportStatusResponse {
  estado: "en_proceso";
}

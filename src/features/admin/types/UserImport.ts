export type UserImportRow = {
  line: number;
  name: string;
  email: string;
  role: string;
  reason?: string;
};

export type ImportTab = "created" | "skipped" | "errors";

export type ImportResult = Record<ImportTab, UserImportRow[]>;

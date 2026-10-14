import axios from "axios";

const API_BASE: string = import.meta.env.VITE_API_URL ?? "";

if (!API_BASE) {
  console.error(
    "VITE_API_URL no está definida. Revisa web/.env y reinicia el servidor de Vite.",
  );
}

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem("token")),
  set: (t: string) => localStorage.setItem("token", t),
  clear: () => localStorage.removeItem("token"),
};

/* Axios instance: default export, used by stations / owner pages */
const http = axios.create({ baseURL: BASE });

http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default http;

/* fetch helper: used by AuthContext */
interface Options {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
}

export async function api<T = unknown>(
  path: string,
  { method = "GET", body, auth = false }: Options = {}
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.message || "Request failed", res.status);
  return json as T;
}

export function getErrorMessage(err: unknown, fallback = "Something went wrong") {
  if (err instanceof ApiError) return err.message;
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || "Cannot reach the server. Is the backend running?";
  }
  if (err instanceof TypeError) return "Cannot reach the server. Is the backend running?";
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
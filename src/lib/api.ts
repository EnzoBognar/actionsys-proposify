// src/lib/api.ts
type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

const BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

async function request<T>(path: string, method: HttpMethod, body?: unknown): Promise<T> {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!res.ok) {
    // 401 Unauthorized - redirecionar para login
    if (res.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      throw new Error("Sessão expirada. Por favor, faça login novamente.");
    }
    
    // 403 Forbidden - permissão insuficiente
    if (res.status === 403) {
      throw new Error("Permissão insuficiente para realizar esta ação.");
    }
    
    const detail = await res.text().catch(() => "");
    throw new Error(detail || `HTTP ${res.status}`);
  }
  
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, "GET"),
  post: <T>(path: string, body?: unknown) => request<T>(path, "POST", body),
  patch: <T>(path: string, body?: unknown) => request<T>(path, "PATCH", body),
  delete: <T>(path: string) => request<T>(path, "DELETE"),
};

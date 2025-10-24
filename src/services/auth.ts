// src/services/auth.ts
import { API_CONFIG } from "@/config/api";

export interface LoginResponse {
  access_token?: string;
  token_type?: string;
  mfa_required?: boolean;
}

export interface UserData {
  id_user: number;
  nome_user?: string | null;
  email_user: string;
  telefone_user?: string | null;
  status_user: string;
  data_ult_login?: string | null;
  url_avatar_user?: string | null;
}

/**
 * Realiza login usando OAuth2 password flow
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  return await response.json();
}

/**
 * Realiza logout
 */
export async function logout(): Promise<void> {
  const token = localStorage.getItem("access_token");
  if (!token) return;

  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    console.error("Logout error:", response.status);
  }

  // Limpa o token localmente independente da resposta
  localStorage.removeItem("access_token");
}

/**
 * Obtém dados do usuário autenticado
 */
export async function getCurrentUser(): Promise<UserData> {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No access token found");
  }

  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ME}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  return await response.json();
}

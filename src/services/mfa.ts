// src/services/mfa.ts
import { API_CONFIG } from "@/config/api";

export interface MfaVerifyRequest {
  email: string;
  code: string;
}

export interface MfaVerifyResponse {
  verified: boolean;
}

export interface MfaSendRequest {
  email: string;
  channel: "email" | "sms";
}

export interface MfaPreferenceRequest {
  email: string;
  preference: "email" | "sms";
}

/**
 * Verifica o código MFA
 */
export async function verifyMfaCode(data: MfaVerifyRequest): Promise<MfaVerifyResponse> {
  const response = await fetch(`${API_CONFIG.BASE_URL}/auth/mfa/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    if (response.status === 400 && errorText.includes("INVALID_OR_EXPIRED_CODE")) {
      throw new Error("Código inválido ou expirado");
    }
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  return await response.json();
}

/**
 * Reenvia código MFA
 */
export async function sendMfaCode(data: MfaSendRequest): Promise<void> {
  const response = await fetch(`${API_CONFIG.BASE_URL}/auth/mfa/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `HTTP ${response.status}`);
  }
}

/**
 * Define preferência de MFA
 */
export async function setMfaPreference(data: MfaPreferenceRequest): Promise<void> {
  const response = await fetch(`${API_CONFIG.BASE_URL}/auth/mfa/preference`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `HTTP ${response.status}`);
  }
}

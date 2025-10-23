// src/config/api.ts
/**
 * Configuração centralizada dos endpoints da API
 */

export const API_CONFIG = {
  BASE_URL: (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL)?.replace(/\/$/, "") || "http://localhost:8000",
  
  ENDPOINTS: {
    // System
    HEALTH: "/health",
    
    // Auth
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    MFA_VERIFY: "/auth/mfa/verify",
    MFA_SEND: "/auth/mfa/send",
    MFA_PREFERENCE: "/auth/mfa/preference",
    
    // Usuários
    USUARIOS: "/usuarios",
    USUARIOS_CREATE: "/usuarios/",
    USUARIO_BY_ID: (id: number) => `/usuarios/${id}`,
    USUARIO_APPROVE: (id: number) => `/usuarios/${id}/approve`,
    USUARIOS_HOUSEKEEPING: "/usuarios/housekeeping",
    
    // Perfis/Roles
    ROLES: "/roles",
    ROLE_BY_ID: (id: number) => `/roles/${id}`,
    ROLE_STATUS: (id: number) => `/roles/${id}/status`,
    ROLE_USERS: (id: number) => `/roles/${id}/users`,
    ROLE_USER: (perfilId: number, userId: number) => `/roles/${perfilId}/users/${userId}`,
    
    // Permissões
    PERMISSIONS: "/permissions",
    PERMISSION_BY_ID: (id: number) => `/permissions/${id}`,
    PERMISSION_STATUS: (id: number) => `/permissions/${id}/status`,
    PERMISSION_ROLES: (id: number) => `/permissions/${id}/roles`,
    PERMISSION_ROLE: (permId: number, perfilId: number) => `/permissions/${permId}/roles/${perfilId}`,
    
    // Auditoria
    AUDIT_LOGS: "/auditoria/logs",
  }
} as const;

export default API_CONFIG;

// src/services/roles.ts
import { api } from "@/lib/api";
import { API_CONFIG } from "@/config/api";

export interface PerfilRead {
  id_perfil: number;
  desc_perfil: string;
  status_perfil: string;
  data_cadastro: string;
  data_status: string;
  ip_atualizacao: string;
  atualizado_por: string | null;
}

export interface PerfilWithUsersRead extends PerfilRead {
  user_ids: number[];
}

export interface PerfilCreate {
  desc_perfil: string;
  status_perfil?: "A" | "I";
}

export interface PerfilUpdate {
  desc_perfil?: string;
}

export interface PerfilStatusUpdate {
  status_perfil: "A" | "I";
}

export interface PerfilListParams {
  q?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

/**
 * Lista perfis com filtros opcionais
 */
export async function listPerfis(params?: PerfilListParams) {
  const queryParams = new URLSearchParams();
  if (params?.q) queryParams.append("q", params.q);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());
  
  const query = queryParams.toString();
  const url = `${API_CONFIG.ENDPOINTS.ROLES}${query ? `?${query}` : ""}`;
  return await api.get<PerfilRead[]>(url);
}

/**
 * Obtém um perfil por ID (com lista de user_ids)
 */
export async function getPerfil(id: number) {
  return await api.get<PerfilWithUsersRead>(API_CONFIG.ENDPOINTS.ROLE_BY_ID(id));
}

/**
 * Cria um novo perfil
 */
export async function createPerfil(data: PerfilCreate) {
  return await api.post<PerfilRead>(API_CONFIG.ENDPOINTS.ROLES, data);
}

/**
 * Atualiza a descrição de um perfil
 */
export async function patchPerfil(id: number, data: PerfilUpdate) {
  return await api.patch<PerfilRead>(API_CONFIG.ENDPOINTS.ROLE_BY_ID(id), data);
}

/**
 * Atualiza o status de um perfil (A/I)
 */
export async function setPerfilStatus(id: number, status: "A" | "I") {
  return await api.patch<PerfilRead>(
    API_CONFIG.ENDPOINTS.ROLE_STATUS(id),
    { status_perfil: status }
  );
}

/**
 * Suspende um perfil (soft delete)
 */
export async function suspendPerfil(id: number) {
  await api.delete(API_CONFIG.ENDPOINTS.ROLE_BY_ID(id));
}

/**
 * Adiciona um usuário a um perfil
 * POST /roles/{perfil_id}/users?user_id={userId}
 */
export async function addUserToRole(perfilId: number, userId: number) {
  await api.post(`/roles/${perfilId}/users?user_id=${userId}`, null);
}

/**
 * Remove um usuário de um perfil
 * DELETE /roles/{perfil_id}/users/{userId}
 */
export async function removeUserFromRole(perfilId: number, userId: number) {
  await api.delete(`/roles/${perfilId}/users/${userId}`);
}

/**
 * Lista permissões atribuídas a um perfil
 * GET /roles/{perfil_id}/permissions
 */
export async function listRolePermissions(perfilId: number): Promise<any[]> {
  return await api.get(`/roles/${perfilId}/permissions`);
}

/**
 * Lista permissões disponíveis (não atribuídas) para um perfil
 * GET /roles/{perfil_id}/permissions/available
 */
export async function listAvailablePermissions(perfilId: number): Promise<any[]> {
  return await api.get(`/roles/${perfilId}/permissions/available`);
}

/**
 * Adiciona uma permissão a um perfil
 * POST /roles/{perfil_id}/permissions?perm_id={permId}
 */
export async function addPermissionToRole(perfilId: number, permId: number) {
  await api.post(`/roles/${perfilId}/permissions?perm_id=${permId}`, null);
}

/**
 * Remove uma permissão de um perfil
 * DELETE /roles/{perfil_id}/permissions/{permId}
 */
export async function removePermissionFromRole(perfilId: number, permId: number) {
  await api.delete(`/roles/${perfilId}/permissions/${permId}`);
}

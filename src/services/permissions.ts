// src/services/permissions.ts
import { api } from "@/lib/api";
import { API_CONFIG } from "@/config/api";

export interface PermissaoRead {
  id_permissao: number;
  nome_permissao: string;
  desc_permissao: string | null;
  status_permissao: string;
  data_cadastro: string;
  data_status: string;
  ip_atualizacao: string;
  atualizado_por: string | null;
}

export interface PermissaoWithRolesRead extends PermissaoRead {
  role_ids: number[];
}

export interface PermissaoCreate {
  nome_permissao: string;
  desc_permissao?: string;
  status_permissao?: "A" | "I";
}

export interface PermissaoUpdate {
  desc_permissao?: string;
}

export interface PermissaoStatusUpdate {
  status_permissao: "A" | "I";
}

export interface PermissaoListParams {
  q?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

/**
 * Lista permissões com filtros opcionais
 */
export async function listPermissoes(params?: PermissaoListParams) {
  const queryParams = new URLSearchParams();
  if (params?.q) queryParams.append("q", params.q);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());
  
  const query = queryParams.toString();
  const url = `${API_CONFIG.ENDPOINTS.PERMISSIONS}${query ? `?${query}` : ""}`;
  return await api.get<PermissaoRead[]>(url);
}

/**
 * Obtém uma permissão por ID (com lista de role_ids)
 */
export async function getPermissao(id: number) {
  return await api.get<PermissaoWithRolesRead>(API_CONFIG.ENDPOINTS.PERMISSION_BY_ID(id));
}

/**
 * Cria uma nova permissão
 */
export async function createPermissao(data: PermissaoCreate) {
  return await api.post<PermissaoRead>(API_CONFIG.ENDPOINTS.PERMISSIONS, data);
}

/**
 * Atualiza a descrição de uma permissão
 */
export async function patchPermissao(id: number, data: PermissaoUpdate) {
  return await api.patch<PermissaoRead>(API_CONFIG.ENDPOINTS.PERMISSION_BY_ID(id), data);
}

/**
 * Atualiza o status de uma permissão (A/I)
 */
export async function setPermissaoStatus(id: number, status: "A" | "I") {
  return await api.patch<PermissaoRead>(
    API_CONFIG.ENDPOINTS.PERMISSION_STATUS(id),
    { status_permissao: status }
  );
}

/**
 * Suspende uma permissão (soft delete)
 */
export async function suspendPermissao(id: number) {
  await api.delete(API_CONFIG.ENDPOINTS.PERMISSION_BY_ID(id));
}

/**
 * Vincula um perfil a uma permissão
 */
export async function addRoleToPermission(permId: number, perfilId: number) {
  await api.post(API_CONFIG.ENDPOINTS.PERMISSION_ROLES(permId), { id_perfil: perfilId });
}

/**
 * Remove um perfil de uma permissão
 */
export async function removeRoleFromPermission(permId: number, perfilId: number) {
  await api.delete(API_CONFIG.ENDPOINTS.PERMISSION_ROLE(permId, perfilId));
}

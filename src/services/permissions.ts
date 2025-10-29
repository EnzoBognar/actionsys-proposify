// src/services/permissions.ts
import { api } from "@/lib/api";

export interface PermissaoRead {
  id_permissao: number;
  nome_permissao: string;
  descricao?: string;
  status: "A" | "S";
  criado_em: string;
  atualizado_em: string;
}

export interface PermissaoListResponse {
  items: PermissaoRead[];
  total: number;
}

export interface PermissaoCreate {
  nome_permissao: string;
  descricao?: string;
}

export interface PermissaoUpdate {
  nome_permissao?: string;
  descricao?: string;
  status?: "A" | "S";
}

export interface PermissaoListParams {
  q?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

/**
 * Lista permissões com filtros opcionais e paginação
 */
export async function listPermissoes(params?: PermissaoListParams) {
  const queryParams = new URLSearchParams();
  if (params?.q) queryParams.append("q", params.q);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());
  
  const query = queryParams.toString();
  const url = `/permissoes${query ? `?${query}` : ""}`;
  return await api.get<PermissaoListResponse>(url);
}

/**
 * Obtém uma permissão por ID
 */
export async function getPermissao(id: number) {
  return await api.get<PermissaoRead>(`/permissoes/${id}`);
}

/**
 * Cria uma nova permissão
 */
export async function createPermissao(data: PermissaoCreate) {
  return await api.post<PermissaoRead>("/permissoes", data);
}

/**
 * Atualiza uma permissão (PATCH parcial)
 */
export async function updatePermissao(id: number, data: PermissaoUpdate) {
  return await api.patch<PermissaoRead>(`/permissoes/${id}`, data);
}

/**
 * Suspende uma permissão (soft delete)
 */
export async function softDeletePermissao(id: number) {
  return await api.delete<PermissaoRead>(`/permissoes/${id}`);
}

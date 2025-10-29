// src/services/permissions.ts
import { api } from "@/lib/api";

export interface Permissao {
  id_permissao?: number;
  nome_permissao: string;
  desc_permissao?: string | null;
  status_permissao?: "A" | "S";
  data_cadastro: string;
  data_status: string;
  ip_atualizacao: string;
  atualizado_por?: string | null;
}

export interface PermissaoCreate {
  nome_permissao: string;
  desc_permissao?: string | null;
  status_permissao?: "A" | "S";
}

export interface PermissaoUpdate {
  nome_permissao?: string;
  desc_permissao?: string | null;
  status_permissao?: "A" | "S";
}

/**
 * Lista todas as permissões (sem paginação no backend)
 */
export async function listPermissions(): Promise<Permissao[]> {
  return await api.get<Permissao[]>("/permissions/");
}

/**
 * Obtém uma permissão por ID
 */
export async function getPermission(id: number): Promise<Permissao> {
  return await api.get<Permissao>(`/permissions/${id}`);
}

/**
 * Cria uma nova permissão
 */
export async function createPermission(data: PermissaoCreate): Promise<Permissao> {
  return await api.post<Permissao>("/permissions/", data);
}

/**
 * Atualiza uma permissão (PATCH parcial)
 */
export async function updatePermission(id: number, data: PermissaoUpdate): Promise<Permissao> {
  return await api.patch<Permissao>(`/permissions/${id}`, data);
}

/**
 * Exclui uma permissão (DELETE retorna 204)
 */
export async function deletePermission(id: number): Promise<void> {
  return await api.delete<void>(`/permissions/${id}`);
}

/**
 * Vincula uma permissão a um perfil
 */
export async function linkPermissionToRole(id_perfil: number, id_permissao: number): Promise<void> {
  return await api.post<void>(`/permissions/link?id_perfil=${id_perfil}&id_permissao=${id_permissao}`);
}

/**
 * Remove vínculo de permissão de um perfil
 */
export async function unlinkPermissionFromRole(id_perfil: number, id_permissao: number): Promise<void> {
  return await api.delete<void>(`/permissions/link?id_perfil=${id_perfil}&id_permissao=${id_permissao}`);
}

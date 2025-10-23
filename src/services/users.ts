// src/services/users.ts
import { api } from "../lib/api";

export type Usuario = {
  id_user: number;
  nome_user?: string | null;
  telefone_user?: string | null;
  email_user: string;
  status_user: string;
  data_ult_login?: string | null;
  url_avatar_user?: string | null;
};

export async function listUsuarios() {
  return await api.get<Usuario[]>("/usuarios");
}

export async function getUsuario(id: number) {
  return await api.get<Usuario>(`/usuarios/${id}`);
}

export async function createUsuario(input: {
  nome_user?: string;
  email_user: string;
  telefone_user?: string;
  senha_user: string;
}) {
  await api.post("/usuarios", input);
}

export async function updateUsuario(
  id: number,
  input: { nome_user?: string; telefone_user?: string; url_avatar_user?: string }
) {
  await api.patch(`/usuarios/${id}`, input);
}

export async function deleteUsuario(id: number) {
  await api.delete(`/usuarios/${id}`);
}

/**
 * Adiciona um perfil a um usuário
 * (internamente usa POST /roles/{perfilId}/users)
 */
export async function addRoleToUser(userId: number, perfilId: number) {
  await api.post(`/roles/${perfilId}/users`, { id_user: userId });
}

/**
 * Remove um perfil de um usuário
 * (internamente usa DELETE /roles/{perfilId}/users/{userId})
 */
export async function removeRoleFromUser(userId: number, perfilId: number) {
  await api.delete(`/roles/${perfilId}/users/${userId}`);
}

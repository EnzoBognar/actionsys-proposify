import { api } from "../lib/api"; // use caminho relativo para evitar problemas de alias

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
  const { data } = await api.get<Usuario[]>("/usuarios");
  return data;
}

export async function getUsuario(id: number) {
  const { data } = await api.get<Usuario>(`/usuarios/${id}`);
  return data;
}

// POST sem status e sem ip_atualizacao (conforme seu backend)
export async function createUsuario(input: {
  nome_user?: string;
  email_user: string;
  telefone_user?: string;
  senha_user: string;
}) {
  await api.post("/usuarios", input);
}

// PATCH sem status_user
export async function updateUsuario(id: number, input: {
  nome_user?: string;
  telefone_user?: string;
  url_avatar_user?: string;
}) {
  await api.patch(`/usuarios/${id}`, input);
}

export async function deleteUsuario(id: number) {
  await api.delete(`/usuarios/${id}`);
}

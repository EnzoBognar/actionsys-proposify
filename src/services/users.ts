import { api } from "../lib/api";

export type Usuario = {
  id_user: number;
  nome_user?: string | null;
  telefone_user?: string | null;
  email_user: string;
  status_user: string;          // códigos: A/I/B/C/P/V
  data_ult_login?: string | null;
  url_avatar_user?: string | null;
  // o backend também envia data_cadastro (usado na tela)
};

export async function listUsuarios() {
  const { data } = await api.get<Usuario[]>("/usuarios");
  return data;
}

export async function getUsuario(id: number) {
  const { data } = await api.get<Usuario>(`/usuarios/${id}`);
  return data;
}

// POST sem status_user e sem ip_atualizacao (conforme backend atual)
export async function createUsuario(input: {
  nome_user?: string;
  email_user: string;
  telefone_user?: string;
  senha_user: string;
}) {
  await api.post("/usuarios", input);
}

// PATCH sem status_user (apenas campos permitidos)
export async function updateUsuario(
  id: number,
  input: {
    nome_user?: string;
    telefone_user?: string;
    url_avatar_user?: string;
  }
) {
  await api.patch(`/usuarios/${id}`, input);
}

export async function deleteUsuario(id: number) {
  await api.delete(`/usuarios/${id}`);
}

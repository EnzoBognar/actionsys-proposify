// src/types/domains.ts
export type DominioStatus = "A" | "S";

export interface Dominio {
  id_dominio?: number;
  nome_dominio: string;
  desc_dominio?: string | null;
  status_dominio?: DominioStatus;
  data_cadastro?: string;
  data_status?: string;
  ip_atualizacao?: string;
  atualizado_por?: string | null;
}

export interface DominioValor {
  id_valor?: number;
  id_dominio: number;
  codigo: string;
  rotulo: string;
  descricao?: string | null;
  ordem?: number | null;
  status?: DominioStatus;
  data_cadastro?: string;
  data_status?: string;
  ip_atualizacao?: string;
  atualizado_por?: string | null;
}

export interface DominioListParams {
  q?: string;
  all?: boolean;
}

export interface DominioValorListParams {
  all?: boolean;
}

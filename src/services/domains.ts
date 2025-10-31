// src/services/domains.ts
import { api } from "@/lib/api";
import { Dominio, DominioValor, DominioListParams, DominioValorListParams } from "@/types/domains";

export type { DominioValor, DominioValorListParams };

const BASE_PATH = "/domains";

// ========== Domínios ==========

export async function listDomains(params?: DominioListParams): Promise<Dominio[]> {
  const queryParams = new URLSearchParams();
  if (params?.q) queryParams.append("q", params.q);
  if (params?.all !== undefined) queryParams.append("all", String(params.all));
  
  const query = queryParams.toString();
  return api.get<Dominio[]>(`${BASE_PATH}/${query ? `?${query}` : ""}`);
}

export async function getDomain(id: number): Promise<Dominio> {
  return api.get<Dominio>(`${BASE_PATH}/${id}`);
}

export async function createDomain(payload: Omit<Dominio, "id_dominio">): Promise<Dominio> {
  return api.post<Dominio>(`${BASE_PATH}/`, payload);
}

export async function patchDomain(id: number, payload: Partial<Dominio>): Promise<Dominio> {
  return api.patch<Dominio>(`${BASE_PATH}/${id}`, payload);
}

export async function deleteDomain(id: number): Promise<void> {
  return api.delete<void>(`${BASE_PATH}/${id}`);
}

export async function findDomainByName(name: string): Promise<Dominio | null> {
  const domains = await listDomains({ q: name, all: true });
  return domains.find(d => d.nome_dominio === name) || null;
}

// ========== Valores do Domínio ==========

export async function listDomainValues(
  domainName: string,
  params?: DominioValorListParams
): Promise<DominioValor[]> {
  const queryParams = new URLSearchParams();
  if (params?.all !== undefined) queryParams.append("all", String(params.all));
  
  const query = queryParams.toString();
  return api.get<DominioValor[]>(`${BASE_PATH}/${domainName}/values${query ? `?${query}` : ""}`);
}

export async function createDomainValue(
  domainId: number,
  payload: Omit<DominioValor, "id_valor" | "id_dominio">
): Promise<DominioValor> {
  return api.post<DominioValor>(`${BASE_PATH}/${domainId}/values`, payload);
}

export async function patchDomainValue(
  valueId: number,
  payload: Partial<DominioValor>
): Promise<DominioValor> {
  return api.patch<DominioValor>(`${BASE_PATH}/values/${valueId}`, payload);
}

export async function deleteDomainValue(valueId: number): Promise<void> {
  return api.delete<void>(`${BASE_PATH}/values/${valueId}`);
}

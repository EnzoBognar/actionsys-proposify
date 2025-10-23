// src/services/audit.ts
import { api } from "@/lib/api";
import { API_CONFIG } from "@/config/api";

export interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  ip: string;
  action: string;
  result: string;
  details: string;
}

export interface ListAuditLogsParams {
  q?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface ListAuditLogsResponse {
  logs: AuditLog[];
  total: number;
}

export async function listAuditLogs(params?: ListAuditLogsParams): Promise<ListAuditLogsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.q) queryParams.append("q", params.q);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());
  
  const queryString = queryParams.toString();
  const path = queryString ? `${API_CONFIG.ENDPOINTS.AUDIT_LOGS}?${queryString}` : API_CONFIG.ENDPOINTS.AUDIT_LOGS;
  
  return api.get<ListAuditLogsResponse>(path);
}

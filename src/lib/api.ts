import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// (opcional) injeta JWT se você salvar o token no front
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("access_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// (opcional) anexa o JWT em todas as requisições
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("access_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// (opcional) trate erros globais aqui
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // exemplo: redirecionar para login em 401
    // if (err?.response?.status === 401) window.location.href = "/login";
    return Promise.reject(err);
  }
);

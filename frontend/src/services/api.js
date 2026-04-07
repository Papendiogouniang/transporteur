import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Intercepteur requêtes — ajouter token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercepteur réponses — gérer 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gp_token');
      localStorage.removeItem('gp_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── AUTH ─────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ── TRANSPORTEURS ────────────────────────────
export const transporteursService = {
  getAll: (params) => api.get('/transporteurs', { params }),
  getById: (id) => api.get(`/transporteurs/${id}`),
  update: (id, data) => api.put(`/transporteurs/${id}`, data),
  getStats: (id) => api.get(`/transporteurs/${id}/stats`),
  laisserAvis: (id, data) => api.post(`/transporteurs/${id}/avis`, data),
};

// ── COMMANDES ─────────────────────────────────
export const commandesService = {
  getAll: (params) => api.get('/commandes', { params }),
  getById: (id) => api.get(`/commandes/${id}`),
  create: (data) => api.post('/commandes', data),
  updateStatut: (id, data) => api.put(`/commandes/${id}/statut`, data),
  getByNumero: (numero) => api.get(`/commandes/numero/${numero}`),
};

// ── RENDEZ-VOUS ───────────────────────────────
export const rendezvousService = {
  getAll: () => api.get('/rendezvous'),
  create: (data) => api.post('/rendezvous', data),
  updateStatut: (id, data) => api.put(`/rendezvous/${id}/statut`, data),
};

export default api;

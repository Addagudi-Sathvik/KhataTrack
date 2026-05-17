import axios from 'axios';
import { clearAccessToken, getAccessToken, setAccessToken } from './tokenStore.js';

const apiRoot = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const API_BASE_URL = apiRoot ? `${apiRoot}/api` : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        clearAccessToken();
      }
    }
    return Promise.reject(error);
  }
);

export default api;

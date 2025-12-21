import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Добавляем JWT токен в каждый запрос, если он есть
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Глобальная обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Можно добавить обработку 401/403 для logout
    if (error.response && error.response.status === 401) {
      // Например, редирект на /login или очистка токена
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

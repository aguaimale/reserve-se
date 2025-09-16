import axios from 'axios';
import router from '@/router';

const api = axios.create({
   baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000/api/v1',
   timeout: 10000,
   headers: {
      'Content-Type': 'application/json',
   },
});

// Request interceptor
api.interceptors.request.use(
   (config) => {
      // Add auth token if available
      const token = localStorage.getItem('auth_token');
      if (token) {
         config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
   },
   (error) => {
      return Promise.reject(error);
   }
);

// Response interceptor
api.interceptors.response.use(
   (response) => {
      return response;
   },
   (error) => {
      // Handle auth errors
      if (error.response?.status === 401) {
         // Token expired or invalid
         localStorage.removeItem('auth_token');
         router.push('/login');
      }

      // Handle rate limiting
      if (error.response?.status === 429) {
         const retryAfter = error.response.headers['retry-after'];
         const message = retryAfter
            ? `Demasiadas peticiones. Intenta nuevamente en ${retryAfter} segundos.`
            : 'Demasiadas peticiones. Por favor, espera antes de intentar nuevamente.';

         return Promise.reject({
            ...error,
            message,
         });
      }

      // Handle other errors
      const message =
         error.response?.data?.error || error.message || 'Error desconocido';

      return Promise.reject({
         ...error,
         message,
      });
   }
);

export default api;

import axios from 'axios';

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
      // Handle errors
      const message =
         error.response?.data?.error || error.message || 'Error desconocido';

      return Promise.reject({
         ...error,
         message,
      });
   }
);

export default api;

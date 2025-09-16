import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';

export interface User {
   id: string;
   email: string;
   name: string;
   role: string;
   tenant: {
      id: string;
      name: string;
      slug: string;
   };
}

export const useAuthStore = defineStore('auth', () => {
   // State
   const token = ref<string | null>(localStorage.getItem('auth_token'));
   const user = ref<User | null>(null);
   const loading = ref(false);

   // Getters
   const isAuthenticated = computed(() => !!token.value && !!user.value);

   // Actions
   const login = async (email: string, password: string) => {
      loading.value = true;
      try {
         const response = await api.post('/auth/login', { email, password });

         token.value = response.data.token;
         user.value = response.data.user;

         localStorage.setItem('auth_token', token.value!);

         // Set axios default header
         api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;

         return response.data;
      } catch (error) {
         throw error;
      } finally {
         loading.value = false;
      }
   };

   const logout = () => {
      token.value = null;
      user.value = null;
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
   };

   const fetchMe = async () => {
      if (!token.value) return;

      try {
         const response = await api.get('/auth/me');
         user.value = response.data;
         return response.data;
      } catch (error) {
         // Token invalid, logout
         logout();
         throw error;
      }
   };

   // Initialize auth on store creation
   const init = async () => {
      if (token.value) {
         api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
         try {
            await fetchMe();
         } catch (error) {
            console.warn('Failed to restore auth state:', error);
            logout();
         }
      }
   };

   return {
      // State
      token,
      user,
      loading,
      // Getters
      isAuthenticated,
      // Actions
      login,
      logout,
      fetchMe,
      init,
   };
});

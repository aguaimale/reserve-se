import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// Views
import Login from '@/views/Login.vue';
import Dashboard from '@/views/Dashboard.vue';
import Inventory from '@/views/Inventory.vue';
import Bookings from '@/views/Bookings.vue';
import Settings from '@/views/Settings.vue';

const router = createRouter({
   history: createWebHistory(),
   routes: [
      {
         path: '/login',
         name: 'login',
         component: Login,
         meta: { requiresAuth: false },
      },
      {
         path: '/',
         redirect: '/dashboard',
      },
      {
         path: '/dashboard',
         name: 'dashboard',
         component: Dashboard,
         meta: { requiresAuth: true, title: 'Dashboard' },
      },
      {
         path: '/inventory',
         name: 'inventory',
         component: Inventory,
         meta: { requiresAuth: true, title: 'Inventario' },
      },
      {
         path: '/bookings',
         name: 'bookings',
         component: Bookings,
         meta: { requiresAuth: true, title: 'Reservas' },
      },
      {
         path: '/settings',
         name: 'settings',
         component: Settings,
         meta: { requiresAuth: true, title: 'Configuración' },
      },
   ],
});

// Navigation guard
router.beforeEach((to, _from, next) => {
   const authStore = useAuthStore();

   if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next('/login');
   } else if (to.name === 'login' && authStore.isAuthenticated) {
      next('/dashboard');
   } else {
      next();
   }
});

export default router;

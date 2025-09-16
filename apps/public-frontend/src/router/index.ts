import { createRouter, createWebHistory } from 'vue-router';

// Views
import HotelView from '@/views/HotelView.vue';
import NotFound from '@/views/NotFound.vue';

const router = createRouter({
   history: createWebHistory(),
   routes: [
      {
         path: '/',
         redirect: '/hotel-luna', // Redirigir a un hotel por defecto
      },
      {
         path: '/:tenant',
         name: 'hotel',
         component: HotelView,
         props: true,
         meta: {
            title: 'Hotel - Reserve-SE',
            description: 'Reserva tu habitación online',
         },
      },
      {
         path: '/:pathMatch(.*)*',
         name: 'not-found',
         component: NotFound,
         meta: {
            title: 'Página no encontrada - Reserve-SE',
         },
      },
   ],
});

// Meta tags dinámicos
router.beforeEach((to: any, _from: any, next: any) => {
   // Actualizar título de la página
   if (to.meta.title) {
      document.title = to.meta.title as string;
   }

   // Actualizar meta description
   if (to.meta.description) {
      const metaDescription = document.querySelector(
         'meta[name="description"]'
      );
      if (metaDescription) {
         metaDescription.setAttribute('content', to.meta.description as string);
      }
   }

   next();
});

export default router;

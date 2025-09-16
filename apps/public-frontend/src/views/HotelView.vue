<template>
   <div class="hotel-view">
      <!-- Header del Hotel -->
      <header class="hotel-header bg-white shadow-sm">
         <div class="container mx-auto px-4 py-6">
            <div class="flex items-center justify-between">
               <div class="flex items-center space-x-4">
                  <div
                     v-if="hotelConfig?.brand_logo"
                     class="w-12 h-12 rounded-lg overflow-hidden"
                  >
                     <img
                        :src="hotelConfig.brand_logo"
                        :alt="hotelConfig.name"
                        class="w-full h-full object-cover"
                     />
                  </div>
                  <div>
                     <h1 class="text-2xl font-bold text-gray-900">
                        {{ hotelConfig?.name || 'Hotel' }}
                     </h1>
                     <p class="text-gray-600">Reservas Online</p>
                  </div>
               </div>

               <div class="flex items-center space-x-4">
                  <Button
                     icon="pi pi-phone"
                     label="Contacto"
                     class="p-button-outlined"
                     @click="showContact = true"
                  />
               </div>
            </div>
         </div>
      </header>

      <!-- Contenido Principal -->
      <main class="container mx-auto px-4 py-8">
         <!-- Información del Hotel -->
         <section class="mb-12">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <!-- Galería de Fotos -->
               <div class="space-y-4">
                  <h2 class="text-xl font-semibold text-gray-900">
                     Nuestras Instalaciones
                  </h2>
                  <div class="grid grid-cols-2 gap-4">
                     <div
                        v-for="(image, index) in hotelImages"
                        :key="index"
                        class="aspect-square bg-gray-200 rounded-lg overflow-hidden"
                     >
                        <img
                           :src="image"
                           :alt="`Imagen ${index + 1} del hotel`"
                           class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                     </div>
                  </div>
               </div>

               <!-- Información del Hotel -->
               <div class="space-y-6">
                  <div>
                     <h2 class="text-xl font-semibold text-gray-900 mb-4">
                        Sobre Nosotros
                     </h2>
                     <p class="text-gray-700 leading-relaxed">
                        {{ hotelDescription }}
                     </p>
                  </div>

                  <!-- Servicios -->
                  <div>
                     <h3 class="text-lg font-semibold text-gray-900 mb-3">
                        Servicios
                     </h3>
                     <div class="grid grid-cols-2 gap-3">
                        <div
                           v-for="service in hotelServices"
                           :key="service"
                           class="flex items-center space-x-2"
                        >
                           <i class="pi pi-check text-green-600"></i>
                           <span class="text-gray-700">{{ service }}</span>
                        </div>
                     </div>
                  </div>

                  <!-- Ubicación -->
                  <div>
                     <h3 class="text-lg font-semibold text-gray-900 mb-3">
                        Ubicación
                     </h3>
                     <div class="flex items-start space-x-3">
                        <i class="pi pi-map-marker text-blue-600 mt-1"></i>
                        <div>
                           <p class="text-gray-700">{{ hotelLocation }}</p>
                           <Button
                              icon="pi pi-external-link"
                              label="Ver en Google Maps"
                              class="p-button-text p-button-sm mt-2"
                              @click="openGoogleMaps"
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         <!-- Widget de Reservas -->
         <section class="mb-12">
            <Card class="shadow-lg">
               <template #title>
                  <div class="text-center">
                     <h2 class="text-2xl font-bold text-gray-900">
                        Reserva tu Habitación
                     </h2>
                     <p class="text-gray-600 mt-2">
                        Encuentra la mejor tarifa para tu estadía
                     </p>
                  </div>
               </template>
               <template #content>
                  <div id="booking-widget-container">
                     <!-- Aquí se montará el widget -->
                     <div v-if="loading" class="text-center py-8">
                        <i
                           class="pi pi-spin pi-spinner text-2xl text-blue-600"
                        ></i>
                        <p class="text-gray-600 mt-2">
                           Cargando sistema de reservas...
                        </p>
                     </div>
                     <div v-else-if="error" class="text-center py-8">
                        <i
                           class="pi pi-exclamation-triangle text-2xl text-red-600"
                        ></i>
                        <p class="text-red-600 mt-2">{{ error }}</p>
                        <Button
                           label="Reintentar"
                           class="p-button-outlined mt-4"
                           @click="loadWidget"
                        />
                     </div>
                  </div>
               </template>
            </Card>
         </section>

         <!-- Información Adicional -->
         <section class="mb-12">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card class="text-center">
                  <template #content>
                     <i class="pi pi-shield text-3xl text-green-600 mb-4"></i>
                     <h3 class="text-lg font-semibold text-gray-900 mb-2">
                        Reserva Segura
                     </h3>
                     <p class="text-gray-600">
                        Protegemos tu información personal y de pago
                     </p>
                  </template>
               </Card>

               <Card class="text-center">
                  <template #content>
                     <i class="pi pi-clock text-3xl text-blue-600 mb-4"></i>
                     <h3 class="text-lg font-semibold text-gray-900 mb-2">
                        Disponible 24/7
                     </h3>
                     <p class="text-gray-600">
                        Reserva en cualquier momento del día
                     </p>
                  </template>
               </Card>

               <Card class="text-center">
                  <template #content>
                     <i class="pi pi-phone text-3xl text-purple-600 mb-4"></i>
                     <h3 class="text-lg font-semibold text-gray-900 mb-2">
                        Soporte
                     </h3>
                     <p class="text-gray-600">Estamos aquí para ayudarte</p>
                  </template>
               </Card>
            </div>
         </section>
      </main>

      <!-- Footer -->
      <footer class="bg-gray-900 text-white py-8">
         <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div>
                  <h3 class="text-lg font-semibold mb-4">
                     {{ hotelConfig?.name || 'Hotel' }}
                  </h3>
                  <p class="text-gray-400">{{ hotelDescription }}</p>
               </div>

               <div>
                  <h3 class="text-lg font-semibold mb-4">Contacto</h3>
                  <div class="space-y-2 text-gray-400">
                     <p>
                        <i class="pi pi-map-marker mr-2"></i>{{ hotelLocation }}
                     </p>
                     <p><i class="pi pi-phone mr-2"></i>+54 11 1234-5678</p>
                     <p><i class="pi pi-envelope mr-2"></i>info@hotel.com</p>
                  </div>
               </div>

               <div>
                  <h3 class="text-lg font-semibold mb-4">Reserve-SE</h3>
                  <p class="text-gray-400">Sistema de reservas hoteleras</p>
                  <p class="text-gray-500 text-sm mt-2">
                     &copy; 2024 Reserve-SE. Todos los derechos reservados.
                  </p>
               </div>
            </div>
         </div>
      </footer>
   </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';

interface Props {
   tenant: string;
}

const props = defineProps<Props>();

// Estados
const loading = ref(true);
const error = ref<string | null>(null);
const showContact = ref(false);
const hotelConfig = ref<any>(null);

// Datos del hotel (por ahora estáticos, después vendrán de la API)
const hotelImages = ref([
   'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=400&fit=crop',
   'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=400&fit=crop',
   'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=400&fit=crop',
   'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
]);

const hotelDescription = computed(() => {
   return (
      hotelConfig.value?.description ||
      'Disfruta de una experiencia única en nuestro hotel. Ubicado en el corazón de la ciudad, ofrecemos comodidad, elegancia y un servicio excepcional para hacer de tu estadía una experiencia inolvidable.'
   );
});

const hotelServices = ref([
   'WiFi Gratuito',
   'Desayuno Incluido',
   'Gimnasio',
   'Piscina',
   'Spa',
   'Restaurante',
   'Bar',
   'Estacionamiento',
   'Servicio a la Habitación',
   'Recepción 24hs',
   'Lavandería',
   'Business Center',
]);

const hotelLocation = computed(() => {
   return (
      hotelConfig.value?.address ||
      'Av. Corrientes 1234, Buenos Aires, Argentina'
   );
});

// Cargar configuración del hotel
const loadHotelConfig = async () => {
   try {
      const response = await api.get(`/tenants/${props.tenant}/config`);
      hotelConfig.value = response.data;

      // Aplicar theming dinámico
      if (hotelConfig.value.brand_primary) {
         applyTheme(hotelConfig.value.brand_primary);
      }

      // Actualizar meta tags
      updateMetaTags();
   } catch (err) {
      console.error('Error loading hotel config:', err);
      error.value = 'No se pudo cargar la información del hotel';
   }
};

// Cargar widget
const loadWidget = async () => {
   loading.value = true;
   error.value = null;

   try {
      // Cargar el widget dinámicamente
      await loadWidgetScript();

      // Montar el widget
      if (window.BookingWidget) {
         window.BookingWidget.mountWidget('#booking-widget-container', {
            tenant: props.tenant,
            language: hotelConfig.value?.language || 'es',
            primaryColor: hotelConfig.value?.brand_primary || '#0EA5E9',
         });
      }
   } catch (err) {
      console.error('Error loading widget:', err);
      error.value = 'No se pudo cargar el sistema de reservas';
   } finally {
      loading.value = false;
   }
};

// Obtener URL base del widget
const getWidgetBaseUrl = () => {
   // Siempre usar el mismo dominio (el backend sirve los archivos del widget)
   return window.location.origin;
};

// Cargar script del widget
const loadWidgetScript = (): Promise<void> => {
   return new Promise((resolve, reject) => {
      // Verificar si ya está cargado
      if (window.BookingWidget) {
         resolve();
         return;
      }

      const baseUrl = getWidgetBaseUrl();

      // Cargar CSS del widget primero
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${baseUrl}/dist/style.css`; // URL del CSS del widget
      link.onload = () => {
         // Después de cargar el CSS, cargar el script
         const script = document.createElement('script');
         script.src = `${baseUrl}/dist/booking-widget.umd.cjs`; // URL del widget
         script.onload = () => resolve();
         script.onerror = () =>
            reject(new Error('Failed to load widget script'));
         document.head.appendChild(script);
      };
      link.onerror = () => reject(new Error('Failed to load widget styles'));
      document.head.appendChild(link);
   });
};

// Aplicar tema dinámico
const applyTheme = (primaryColor: string) => {
   document.documentElement.style.setProperty('--primary-color', primaryColor);

   // Calcular variantes del color
   const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
         ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
           }
         : null;
   };

   const rgb = hexToRgb(primaryColor);
   if (rgb) {
      document.documentElement.style.setProperty(
         '--primary-color-light',
         `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`
      );

      const darkR = Math.max(0, rgb.r - 30);
      const darkG = Math.max(0, rgb.g - 30);
      const darkB = Math.max(0, rgb.b - 30);
      document.documentElement.style.setProperty(
         '--primary-color-dark',
         `rgb(${darkR}, ${darkG}, ${darkB})`
      );
   }
};

// Actualizar meta tags
const updateMetaTags = () => {
   if (hotelConfig.value) {
      document.title = `${hotelConfig.value.name} - Reservas Online`;

      const metaDescription = document.querySelector(
         'meta[name="description"]'
      );
      if (metaDescription) {
         metaDescription.setAttribute(
            'content',
            `Reserva tu habitación en ${hotelConfig.value.name}. ${hotelDescription.value}`
         );
      }
   }
};

// Abrir Google Maps
const openGoogleMaps = () => {
   const address = encodeURIComponent(hotelLocation.value);
   window.open(
      `https://www.google.com/maps/search/?api=1&query=${address}`,
      '_blank'
   );
};

onMounted(async () => {
   await loadHotelConfig();
   await loadWidget();
});
</script>

<style scoped>
.hotel-view {
   min-height: 100vh;
}

.container {
   max-width: 1200px;
}

/* Theming dinámico */
:root {
   --primary-color: #0ea5e9;
   --primary-color-light: rgba(14, 165, 233, 0.1);
   --primary-color-dark: rgb(0, 135, 203);
}

/* Aplicar colores primarios a los botones */
.p-button:not(.p-button-outlined):not(.p-button-text) {
   background-color: var(--primary-color);
   border-color: var(--primary-color);
}

.p-button:not(.p-button-outlined):not(.p-button-text):hover {
   background-color: var(--primary-color-dark);
   border-color: var(--primary-color-dark);
}

.p-button.p-button-outlined {
   color: var(--primary-color);
   border-color: var(--primary-color);
}

.p-button.p-button-outlined:hover {
   background-color: var(--primary-color);
   color: white;
}
</style>

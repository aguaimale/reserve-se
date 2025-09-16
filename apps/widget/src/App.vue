<template>
   <div class="booking-widget" :class="`widget-${config.language}`">
      <!-- Header del widget -->
      <div class="widget-header">
         <h2 class="widget-title">{{ t('home.title') }}</h2>
      </div>

      <!-- Contenido principal -->
      <div class="widget-content">
         <!-- Pantalla de filtros (Home) -->
         <HomeScreen
            v-if="currentScreen === 'home'"
            @search="handleSearch"
            :loading="loading"
         />

         <!-- Pantalla de resultados -->
         <ResultsScreen
            v-else-if="currentScreen === 'results'"
            :results="searchResults"
            :loading="loading"
            :error="error"
            @back="goBack"
            @select="handleRoomSelect"
         />

         <!-- Pantalla de datos del huésped -->
         <GuestScreen
            v-else-if="currentScreen === 'guest'"
            :selected-room="selectedRoom"
            :search-params="searchParams"
            @back="goBack"
            @confirm="handleGuestData"
            :loading="loading"
         />

         <!-- Pantalla de confirmación -->
         <ConfirmationScreen
            v-else-if="currentScreen === 'confirmation'"
            :booking="confirmedBooking"
            @restart="restart"
         />
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue';
import { useI18n } from 'vue-i18n';
import HomeScreen from './components/HomeScreen.vue';
import ResultsScreen from './components/ResultsScreen.vue';
import GuestScreen from './components/GuestScreen.vue';
import ConfirmationScreen from './components/ConfirmationScreen.vue';
import { apiService } from './services/api';
import type { SearchParams, Room, GuestData, Booking } from './types';

interface Props {
   config: {
      tenant: string;
      language: string;
      primaryColor: string;
   };
}

const props = defineProps<Props>();
const { t } = useI18n();

// Estados del widget
const currentScreen = ref<'home' | 'results' | 'guest' | 'confirmation'>(
   'home'
);
const loading = ref(false);
const error = ref<string | null>(null);
const searchResults = ref<Room[]>([]);
const searchParams = ref<SearchParams | null>(null);
const selectedRoom = ref<Room | null>(null);
const confirmedBooking = ref<Booking | null>(null);

// Función de traducción simplificada (ya no necesaria con i18n)
const $t = (key: string) => {
   return t(key);
};

// Proporcionar configuración y servicios a componentes hijos
provide('config', props.config);
provide('$t', $t);
provide('apiService', apiService);

// Handlers de navegación
const handleSearch = async (params: SearchParams) => {
   loading.value = true;
   error.value = null;
   searchParams.value = params;

   try {
      const results = await apiService.getAvailability({
         tenant: props.config.tenant,
         checkin: params.checkin,
         checkout: params.checkout,
         guests: params.guests,
      });

      searchResults.value = results;
      currentScreen.value = 'results';
   } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error de búsqueda';
      console.error('Search error:', err);
   } finally {
      loading.value = false;
   }
};

const handleRoomSelect = (room: Room) => {
   selectedRoom.value = room;
   currentScreen.value = 'guest';
};

const handleGuestData = async (guestData: GuestData) => {
   if (
      !selectedRoom.value ||
      !searchParams.value ||
      !selectedRoom.value.ratePlanId
   )
      return;

   loading.value = true;
   error.value = null;

   try {
      const booking = await apiService.confirmBooking({
         tenant: props.config.tenant,
         roomId: selectedRoom.value.id,
         ratePlanId: selectedRoom.value.ratePlanId,
         checkin: searchParams.value.checkin,
         checkout: searchParams.value.checkout,
         guests: searchParams.value.guests,
         guestData,
      });

      confirmedBooking.value = booking;
      currentScreen.value = 'confirmation';
   } catch (err) {
      error.value =
         err instanceof Error ? err.message : 'Error de confirmación';
      console.error('Booking error:', err);
   } finally {
      loading.value = false;
   }
};

const goBack = () => {
   if (currentScreen.value === 'results') {
      currentScreen.value = 'home';
   } else if (currentScreen.value === 'guest') {
      currentScreen.value = 'results';
   }
};

const restart = () => {
   currentScreen.value = 'home';
   searchResults.value = [];
   searchParams.value = null;
   selectedRoom.value = null;
   confirmedBooking.value = null;
   error.value = null;
};

// Inicializar widget
onMounted(async () => {
   try {
      // Cargar configuración del tenant si es necesario
      await apiService.getConfig(props.config.tenant);
   } catch (err) {
      console.warn('Could not load tenant config:', err);
   }
});
</script>

<style scoped>
.booking-widget {
   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      sans-serif;
   max-width: 500px;
   margin: 0 auto;
   border: 1px solid #e5e7eb;
   border-radius: var(--radius, 8px);
   background: white;
   box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.widget-header {
   padding: 1.5rem 1.5rem 0;
   border-bottom: 1px solid #f3f4f6;
}

.widget-title {
   margin: 0 0 1rem 0;
   font-size: 1.5rem;
   font-weight: 600;
   color: #111827;
}

.widget-content {
   padding: 1.5rem;
}

/* Variables CSS para theming */
.booking-widget {
   --color-primary: #0ea5e9;
   --color-primary-hover: #0284c7;
   --color-primary-light: #bae6fd;
   --radius: 8px;
}
</style>

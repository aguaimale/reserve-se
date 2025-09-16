<template>
   <div class="results-screen">
      <!-- Header con botón de retroceso -->
      <div class="results-header">
         <button @click="$emit('back')" class="back-button">← Volver</button>
         <h3 class="results-title">Habitaciones disponibles</h3>
      </div>

      <!-- Estados de carga y error -->
      <div v-if="loading" class="loading-state">
         <div class="skeleton-card" v-for="i in 3" :key="i">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
               <div class="skeleton-line skeleton-title"></div>
               <div class="skeleton-line skeleton-text"></div>
               <div class="skeleton-line skeleton-price"></div>
            </div>
         </div>
      </div>

      <div v-else-if="error" class="error-state">
         <div class="error-icon">⚠️</div>
         <p class="error-text">{{ error }}</p>
         <button @click="$emit('retry')" class="retry-button">
            Reintentar
         </button>
      </div>

      <div v-else-if="results.length === 0" class="empty-state">
         <div class="empty-icon">🏨</div>
         <p class="empty-text">
            No hay habitaciones disponibles para las fechas seleccionadas
         </p>
         <button @click="$emit('back')" class="change-dates-button">
            Cambiar fechas
         </button>
      </div>

      <!-- Lista de resultados -->
      <div v-else class="results-list">
         <div
            v-for="room in results"
            :key="room.id"
            class="room-card"
            :class="{ 'room-card--unavailable': !room.available }"
         >
            <!-- Imagen de la habitación -->
            <div class="room-image">
               <img
                  :src="room.images[0] || '/placeholder-room.jpg'"
                  :alt="room.name"
                  loading="lazy"
               />
            </div>

            <!-- Información de la habitación -->
            <div class="room-info">
               <h4 class="room-name">{{ room.name }}</h4>
               <p class="room-description">{{ room.description }}</p>

               <div class="room-details">
                  <span class="room-capacity"
                     >👥 {{ room.capacity }} huéspedes</span
                  >

                  <div class="room-amenities" v-if="room.amenities.length">
                     <span
                        v-for="amenity in room.amenities.slice(0, 3)"
                        :key="amenity"
                        class="amenity-tag"
                     >
                        {{ amenity }}
                     </span>
                     <span
                        v-if="room.amenities.length > 3"
                        class="amenity-more"
                     >
                        +{{ room.amenities.length - 3 }} más
                     </span>
                  </div>
               </div>
            </div>

            <!-- Precio y botón -->
            <div class="room-pricing">
               <div class="price-info">
                  <div class="price-per-night">
                     <span class="price-amount"
                        >${{ room.pricePerNight.toLocaleString() }}</span
                     >
                     <span class="price-unit">/ noche</span>
                  </div>
                  <div
                     class="total-price"
                     :title="`Precio total por ${room.nights || 1} noche${
                        (room.nights || 1) > 1 ? 's' : ''
                     }`"
                  >
                     Total: ${{ room.totalPrice.toLocaleString() }}
                  </div>
               </div>

               <button
                  @click="$emit('select', room)"
                  class="select-button"
                  :disabled="!room.available"
               >
                  {{ room.available ? 'Seleccionar' : 'No disponible' }}
               </button>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import type { Room } from '../types';

interface Props {
   results: Room[];
   loading?: boolean;
   error?: string | null;
}

defineProps<Props>();

defineEmits<{
   back: [];
   select: [room: Room];
   retry: [];
}>();

// Ya no necesitamos esta función - usamos room.nights
</script>

<style scoped>
.results-screen {
   padding: 0;
}

.results-header {
   display: flex;
   align-items: center;
   gap: 1rem;
   margin-bottom: 1.5rem;
   padding-bottom: 1rem;
   border-bottom: 1px solid #f3f4f6;
}

.back-button {
   background: none;
   border: none;
   color: var(--color-primary);
   cursor: pointer;
   font-size: 0.875rem;
   padding: 0.5rem;
   border-radius: var(--radius);
   transition: background-color 0.2s;
}

.back-button:hover {
   background-color: var(--color-primary-light);
}

.results-title {
   margin: 0;
   font-size: 1.25rem;
   font-weight: 600;
   color: #111827;
}

/* Estados de carga */
.loading-state {
   display: flex;
   flex-direction: column;
   gap: 1rem;
}

.skeleton-card {
   display: flex;
   gap: 1rem;
   padding: 1rem;
   border: 1px solid #f3f4f6;
   border-radius: var(--radius);
}

.skeleton-image {
   width: 80px;
   height: 80px;
   background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
   background-size: 200% 100%;
   animation: shimmer 1.5s infinite;
   border-radius: var(--radius);
}

.skeleton-content {
   flex: 1;
   display: flex;
   flex-direction: column;
   gap: 0.5rem;
}

.skeleton-line {
   height: 1rem;
   background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
   background-size: 200% 100%;
   animation: shimmer 1.5s infinite;
   border-radius: 4px;
}

.skeleton-title {
   width: 60%;
}
.skeleton-text {
   width: 80%;
}
.skeleton-price {
   width: 40%;
}

@keyframes shimmer {
   0% {
      background-position: -200% 0;
   }
   100% {
      background-position: 200% 0;
   }
}

/* Estados de error y vacío */
.error-state,
.empty-state {
   text-align: center;
   padding: 2rem 1rem;
}

.error-icon,
.empty-icon {
   font-size: 3rem;
   margin-bottom: 1rem;
}

.error-text,
.empty-text {
   color: #6b7280;
   margin-bottom: 1.5rem;
}

.retry-button,
.change-dates-button {
   padding: 0.75rem 1.5rem;
   background-color: var(--color-primary);
   color: white;
   border: none;
   border-radius: var(--radius);
   cursor: pointer;
   transition: background-color 0.2s;
}

.retry-button:hover,
.change-dates-button:hover {
   background-color: var(--color-primary-hover);
}

/* Lista de resultados */
.results-list {
   display: flex;
   flex-direction: column;
   gap: 1rem;
}

.room-card {
   display: flex;
   gap: 1rem;
   padding: 1rem;
   border: 1px solid #e5e7eb;
   border-radius: var(--radius);
   transition: border-color 0.2s, box-shadow 0.2s;
}

.room-card:hover {
   border-color: var(--color-primary);
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.room-card--unavailable {
   opacity: 0.6;
   background-color: #f9fafb;
}

.room-image {
   flex-shrink: 0;
   width: 80px;
   height: 80px;
   border-radius: var(--radius);
   overflow: hidden;
}

.room-image img {
   width: 100%;
   height: 100%;
   object-fit: cover;
}

.room-info {
   flex: 1;
   min-width: 0;
}

.room-name {
   margin: 0 0 0.5rem 0;
   font-size: 1rem;
   font-weight: 600;
   color: #111827;
}

.room-description {
   margin: 0 0 0.75rem 0;
   font-size: 0.875rem;
   color: #6b7280;
   line-height: 1.4;
}

.room-details {
   display: flex;
   flex-direction: column;
   gap: 0.5rem;
}

.room-capacity {
   font-size: 0.75rem;
   color: #6b7280;
}

.room-amenities {
   display: flex;
   flex-wrap: wrap;
   gap: 0.25rem;
}

.amenity-tag {
   padding: 0.125rem 0.5rem;
   background-color: #f3f4f6;
   color: #6b7280;
   font-size: 0.75rem;
   border-radius: 12px;
}

.amenity-more {
   font-size: 0.75rem;
   color: #9ca3af;
}

.room-pricing {
   flex-shrink: 0;
   display: flex;
   flex-direction: column;
   align-items: flex-end;
   gap: 1rem;
}

.price-info {
   text-align: right;
}

.price-per-night {
   display: flex;
   align-items: baseline;
   gap: 0.25rem;
}

.price-amount {
   font-size: 1.125rem;
   font-weight: 600;
   color: #111827;
}

.price-unit {
   font-size: 0.75rem;
   color: #6b7280;
}

.total-price {
   font-size: 0.875rem;
   color: var(--color-primary);
   font-weight: 500;
   margin-top: 0.25rem;
   cursor: help;
}

.select-button {
   padding: 0.5rem 1rem;
   background-color: var(--color-primary);
   color: white;
   border: none;
   border-radius: var(--radius);
   font-size: 0.875rem;
   cursor: pointer;
   transition: background-color 0.2s;
   white-space: nowrap;
}

.select-button:hover:not(:disabled) {
   background-color: var(--color-primary-hover);
}

.select-button:disabled {
   background-color: #9ca3af;
   cursor: not-allowed;
}

/* Responsive */
@media (max-width: 480px) {
   .room-card {
      flex-direction: column;
      gap: 0.75rem;
   }

   .room-image {
      width: 100%;
      height: 120px;
   }

   .room-pricing {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
   }

   .price-info {
      text-align: left;
   }
}
</style>

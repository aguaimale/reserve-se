<template>
   <div class="confirmation-screen">
      <!-- Icono de éxito -->
      <div class="success-icon">✅</div>

      <!-- Mensaje de confirmación -->
      <div class="confirmation-message">
         <h2 class="confirmation-title">¡Reserva confirmada!</h2>
         <p class="confirmation-subtitle">
            Tu reserva ha sido procesada exitosamente
         </p>
      </div>

      <!-- Información de la reserva -->
      <div class="booking-details">
         <div class="locator-section">
            <h3 class="section-title">Código de reserva</h3>
            <div class="locator-display">
               <span class="locator-code">{{ booking?.locator }}</span>
               <button
                  @click="copyLocator"
                  class="copy-button"
                  :class="{ 'copy-button--copied': copied }"
                  :title="copied ? 'Copiado!' : 'Copiar código'"
               >
                  {{ copied ? '✓' : '📋' }}
               </button>
            </div>
            <p class="locator-note">
               Guarda este código para futuras consultas
            </p>
         </div>

         <div class="booking-summary">
            <h3 class="section-title">Resumen de tu reserva</h3>

            <div class="summary-grid">
               <div class="summary-item">
                  <span class="summary-label">Habitación</span>
                  <span class="summary-value">{{ booking?.room.name }}</span>
               </div>

               <div class="summary-item">
                  <span class="summary-label">Huésped principal</span>
                  <span class="summary-value">
                     {{ booking?.guestData.firstName }}
                     {{ booking?.guestData.lastName }}
                  </span>
               </div>

               <div class="summary-item">
                  <span class="summary-label">Email</span>
                  <span class="summary-value">{{
                     booking?.guestData.email
                  }}</span>
               </div>

               <div class="summary-item">
                  <span class="summary-label">Teléfono</span>
                  <span class="summary-value">{{
                     booking?.guestData.phone
                  }}</span>
               </div>

               <div class="summary-item">
                  <span class="summary-label">Check-in</span>
                  <span class="summary-value">{{
                     formatDate(booking?.checkin)
                  }}</span>
               </div>

               <div class="summary-item">
                  <span class="summary-label">Check-out</span>
                  <span class="summary-value">{{
                     formatDate(booking?.checkout)
                  }}</span>
               </div>

               <div class="summary-item">
                  <span class="summary-label">Huéspedes</span>
                  <span class="summary-value">{{ booking?.guests }}</span>
               </div>

               <div class="summary-item">
                  <span class="summary-label">Noches</span>
                  <span class="summary-value">{{ calculateNights() }}</span>
               </div>

               <div
                  v-if="booking?.guestData.specialRequests"
                  class="summary-item summary-item--full"
               >
                  <span class="summary-label">Solicitudes especiales</span>
                  <span class="summary-value">{{
                     booking.guestData.specialRequests
                  }}</span>
               </div>
            </div>

            <div class="total-section">
               <div class="total-row">
                  <span class="total-label">Total pagado</span>
                  <span class="total-amount"
                     >${{ booking?.totalPrice.toLocaleString() }}</span
                  >
               </div>
            </div>
         </div>
      </div>

      <!-- Información adicional -->
      <div class="additional-info">
         <div class="info-card">
            <h4 class="info-title">📧 Confirmación por email</h4>
            <p class="info-text">
               Recibirás un email de confirmación en
               {{ booking?.guestData.email }}
               con todos los detalles de tu reserva.
            </p>
         </div>

         <div class="info-card">
            <h4 class="info-title">🏨 Información del hotel</h4>
            <p class="info-text">
               El hotel se pondrá en contacto contigo 24-48 horas antes de tu
               llegada para confirmar los detalles del check-in.
            </p>
         </div>

         <div class="info-card">
            <h4 class="info-title">❓ ¿Necesitas ayuda?</h4>
            <p class="info-text">
               Para cualquier consulta sobre tu reserva, contacta al hotel
               mencionando tu código de reserva.
            </p>
         </div>
      </div>

      <!-- Botón para nueva reserva -->
      <div class="actions">
         <button @click="$emit('restart')" class="new-booking-button">
            Hacer nueva reserva
         </button>
      </div>

      <!-- Footer con fecha de creación -->
      <div class="booking-footer">
         <p class="booking-created">
            Reserva creada el {{ formatDateTime(booking?.createdAt) }}
         </p>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import type { Booking } from '../types';

interface Props {
   booking: Booking | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
   restart: [];
}>();

const $t = inject('$t') as (key: string) => string;

const copied = ref(false);

// Copiar código de reserva al portapapeles
const copyLocator = async () => {
   if (!props.booking?.locator) return;

   try {
      await navigator.clipboard.writeText(props.booking.locator);
      copied.value = true;
      setTimeout(() => {
         copied.value = false;
      }, 2000);
   } catch (err) {
      // Fallback para navegadores sin soporte de clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = props.booking.locator;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      copied.value = true;
      setTimeout(() => {
         copied.value = false;
      }, 2000);
   }
};

// Formatear fecha
const formatDate = (dateString: string | undefined) => {
   if (!dateString) return '';

   const date = new Date(dateString);
   return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
   });
};

// Formatear fecha y hora
const formatDateTime = (dateString: string | undefined) => {
   if (!dateString) return '';

   const date = new Date(dateString);
   return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
   });
};

// Calcular número de noches
const calculateNights = () => {
   if (!props.booking?.checkin || !props.booking?.checkout) return 0;

   const checkinDate = new Date(props.booking.checkin);
   const checkoutDate = new Date(props.booking.checkout);
   const diffTime = checkoutDate.getTime() - checkinDate.getTime();
   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

   return diffDays;
};
</script>

<style scoped>
.confirmation-screen {
   padding: 0;
   text-align: center;
}

.success-icon {
   font-size: 4rem;
   margin-bottom: 1rem;
}

.confirmation-message {
   margin-bottom: 2rem;
}

.confirmation-title {
   margin: 0 0 0.5rem 0;
   font-size: 1.75rem;
   font-weight: 700;
   color: #059669;
}

.confirmation-subtitle {
   margin: 0;
   color: #6b7280;
   font-size: 1rem;
}

/* Detalles de la reserva */
.booking-details {
   text-align: left;
   margin-bottom: 2rem;
}

.locator-section {
   background-color: #f0fdf4;
   border: 1px solid #bbf7d0;
   border-radius: var(--radius);
   padding: 1.5rem;
   margin-bottom: 1.5rem;
   text-align: center;
}

.section-title {
   margin: 0 0 1rem 0;
   font-size: 1.125rem;
   font-weight: 600;
   color: #111827;
}

.locator-display {
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 0.75rem;
   margin-bottom: 0.5rem;
}

.locator-code {
   font-family: 'Courier New', monospace;
   font-size: 1.5rem;
   font-weight: 700;
   color: #059669;
   background-color: white;
   padding: 0.5rem 1rem;
   border-radius: var(--radius);
   border: 1px solid #bbf7d0;
}

.copy-button {
   background: none;
   border: 1px solid #bbf7d0;
   border-radius: var(--radius);
   padding: 0.5rem;
   cursor: pointer;
   transition: all 0.2s;
   font-size: 1rem;
}

.copy-button:hover {
   background-color: white;
}

.copy-button--copied {
   background-color: #059669;
   color: white;
   border-color: #059669;
}

.locator-note {
   margin: 0;
   font-size: 0.875rem;
   color: #059669;
}

/* Resumen de reserva */
.booking-summary {
   border: 1px solid #e5e7eb;
   border-radius: var(--radius);
   padding: 1.5rem;
}

.summary-grid {
   display: grid;
   grid-template-columns: 1fr 1fr;
   gap: 1rem;
   margin-bottom: 1.5rem;
}

.summary-item {
   display: flex;
   flex-direction: column;
   gap: 0.25rem;
}

.summary-item--full {
   grid-column: 1 / -1;
}

.summary-label {
   font-size: 0.75rem;
   font-weight: 500;
   color: #6b7280;
   text-transform: uppercase;
   letter-spacing: 0.05em;
}

.summary-value {
   font-size: 0.875rem;
   color: #111827;
   font-weight: 500;
}

.total-section {
   border-top: 1px solid #e5e7eb;
   padding-top: 1rem;
}

.total-row {
   display: flex;
   justify-content: space-between;
   align-items: center;
}

.total-label {
   font-size: 1.125rem;
   font-weight: 600;
   color: #111827;
}

.total-amount {
   font-size: 1.5rem;
   font-weight: 700;
   color: var(--color-primary);
}

/* Información adicional */
.additional-info {
   margin-bottom: 2rem;
   display: flex;
   flex-direction: column;
   gap: 1rem;
}

.info-card {
   background-color: #f9fafb;
   border: 1px solid #f3f4f6;
   border-radius: var(--radius);
   padding: 1rem;
   text-align: left;
}

.info-title {
   margin: 0 0 0.5rem 0;
   font-size: 0.875rem;
   font-weight: 600;
   color: #374151;
}

.info-text {
   margin: 0;
   font-size: 0.875rem;
   color: #6b7280;
   line-height: 1.5;
}

/* Acciones */
.actions {
   margin-bottom: 2rem;
}

.new-booking-button {
   padding: 0.875rem 2rem;
   background-color: var(--color-primary);
   color: white;
   border: none;
   border-radius: var(--radius);
   font-size: 1rem;
   font-weight: 500;
   cursor: pointer;
   transition: background-color 0.2s;
}

.new-booking-button:hover {
   background-color: var(--color-primary-hover);
}

/* Footer */
.booking-footer {
   border-top: 1px solid #f3f4f6;
   padding-top: 1rem;
}

.booking-created {
   margin: 0;
   font-size: 0.75rem;
   color: #9ca3af;
}

/* Responsive */
@media (max-width: 480px) {
   .confirmation-title {
      font-size: 1.5rem;
   }

   .locator-code {
      font-size: 1.25rem;
   }

   .summary-grid {
      grid-template-columns: 1fr;
   }

   .locator-display {
      flex-direction: column;
      gap: 0.5rem;
   }

   .total-row {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
   }
}
</style>

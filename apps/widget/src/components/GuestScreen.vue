<template>
   <div class="guest-screen">
      <!-- Header -->
      <div class="guest-header">
         <button @click="$emit('back')" class="back-button">← Volver</button>
         <h3 class="guest-title">Datos del huésped</h3>
      </div>

      <!-- Resumen de la reserva -->
      <div class="booking-summary">
         <h4 class="summary-title">Resumen de tu reserva</h4>
         <div class="summary-content">
            <div class="summary-row">
               <span class="summary-label">Habitación:</span>
               <span class="summary-value">{{ selectedRoom?.name }}</span>
            </div>
            <div class="summary-row">
               <span class="summary-label">Fechas:</span>
               <span class="summary-value">
                  {{ formatDate(searchParams?.checkin) }} -
                  {{ formatDate(searchParams?.checkout) }}
               </span>
            </div>
            <div class="summary-row">
               <span class="summary-label">Huéspedes:</span>
               <span class="summary-value">{{ searchParams?.guests }}</span>
            </div>
            <div class="summary-row summary-total">
               <span class="summary-label">Total:</span>
               <span class="summary-value"
                  >${{ selectedRoom?.totalPrice.toLocaleString() }}</span
               >
            </div>
         </div>
      </div>

      <!-- Formulario de datos del huésped -->
      <form @submit.prevent="handleSubmit" class="guest-form">
         <div class="form-grid">
            <div class="form-group">
               <label for="firstName" class="form-label">Nombre *</label>
               <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  class="form-input"
                  :class="{ 'form-input--error': errors.firstName }"
                  required
                  maxlength="50"
               />
               <span v-if="errors.firstName" class="field-error">{{
                  errors.firstName
               }}</span>
            </div>

            <div class="form-group">
               <label for="lastName" class="form-label">Apellido *</label>
               <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  class="form-input"
                  :class="{ 'form-input--error': errors.lastName }"
                  required
                  maxlength="50"
               />
               <span v-if="errors.lastName" class="field-error">{{
                  errors.lastName
               }}</span>
            </div>
         </div>

         <div class="form-group">
            <div
               style="
                  display: flex;
                  flex-direction: column;
                  gap: 0.5rem;
                  padding: 0.5rem;
               "
            >
               <label for="email" class="form-label">Email *</label>
               <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  class="form-input"
                  :class="{ 'form-input--error': errors.email }"
                  required
                  maxlength="100"
               />
               <span v-if="errors.email" class="field-error">{{
                  errors.email
               }}</span>
            </div>
         </div>

         <div class="form-group">
            <div
               style="
                  display: flex;
                  flex-direction: column;
                  gap: 0.5rem;
                  padding: 0.5rem;
               "
            >
               <label for="phone" class="form-label">Teléfono *</label>
               <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  class="form-input"
                  :class="{ 'form-input--error': errors.phone }"
                  required
                  maxlength="20"
                  placeholder="+54 11 1234-5678"
               />
               <span v-if="errors.phone" class="field-error">{{
                  errors.phone
               }}</span>
            </div>
         </div>

         <div class="form-group">
            <div
               style="
                  display: flex;
                  flex-direction: column;
                  gap: 0.5rem;
                  padding: 0.5rem;
               "
            >
               <label for="specialRequests" class="form-label"
                  >Solicitudes especiales</label
               >
               <textarea
                  id="specialRequests"
                  v-model="form.specialRequests"
                  class="form-textarea"
                  rows="3"
                  maxlength="500"
                  placeholder="Cama extra, vista al mar, etc."
               ></textarea>
               <div class="char-counter">
                  {{ form.specialRequests?.length || 0 }}/500
               </div>
            </div>
         </div>

         <!-- Términos y condiciones -->
         <div class="form-group">
            <label class="checkbox-label">
               <input
                  v-model="form.acceptTerms"
                  type="checkbox"
                  class="checkbox-input"
                  required
               />
               <span class="checkbox-text">
                  Acepto los
                  <a
                     href="#"
                     class="terms-link"
                     @click.prevent="showTerms = true"
                     >términos y condiciones</a
                  >
               </span>
            </label>
            <span v-if="errors.acceptTerms" class="field-error">{{
               errors.acceptTerms
            }}</span>
         </div>

         <!-- Botones -->
         <div class="form-actions">
            <button type="button" @click="$emit('back')" class="cancel-button">
               Cancelar
            </button>
            <button
               type="submit"
               class="confirm-button"
               :disabled="loading || !isFormValid"
            >
               <span v-if="loading" class="loading-spinner"></span>
               {{ loading ? 'Confirmando...' : 'Confirmar reserva' }}
            </button>
         </div>

         <!-- Error general -->
         <div v-if="submitError" class="submit-error">
            {{ submitError }}
         </div>
      </form>

      <!-- Modal de términos (simple) -->
      <div v-if="showTerms" class="terms-modal" @click.self="showTerms = false">
         <div class="terms-content">
            <h3>Términos y Condiciones</h3>
            <p>
               Al confirmar esta reserva, acepta nuestros términos de servicio y
               política de cancelación.
            </p>
            <button @click="showTerms = false" class="close-terms-button">
               Cerrar
            </button>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import type { Room, SearchParams, GuestData } from '../types';

interface Props {
   selectedRoom: Room | null;
   searchParams: SearchParams | null;
   loading?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
   back: [];
   confirm: [guestData: GuestData];
}>();

const $t = inject('$t') as (key: string) => string;

// Estado del formulario
const form = ref({
   firstName: '',
   lastName: '',
   email: '',
   phone: '',
   specialRequests: '',
   acceptTerms: false,
});

const errors = ref<Record<string, string>>({});
const submitError = ref<string | null>(null);
const showTerms = ref(false);

// Validación del formulario
const isFormValid = computed(() => {
   return (
      form.value.firstName.trim() &&
      form.value.lastName.trim() &&
      form.value.email.trim() &&
      form.value.phone.trim() &&
      form.value.acceptTerms &&
      Object.keys(errors.value).length === 0
   );
});

// Validaciones individuales
const validateField = (field: string, value: string) => {
   errors.value = { ...errors.value };
   delete errors.value[field];

   switch (field) {
      case 'firstName':
      case 'lastName':
         if (!value.trim()) {
            errors.value[field] = 'Este campo es requerido';
         } else if (value.length < 2) {
            errors.value[field] = 'Debe tener al menos 2 caracteres';
         }
         break;

      case 'email':
         if (!value.trim()) {
            errors.value[field] = 'Este campo es requerido';
         } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.value[field] = 'Email inválido';
         }
         break;

      case 'phone':
         if (!value.trim()) {
            errors.value[field] = 'Este campo es requerido';
         } else if (!/^[\+]?[\d\s\-\(\)]{8,20}$/.test(value)) {
            errors.value[field] = 'Teléfono inválido';
         }
         break;
   }
};

// Watchers para validación en tiempo real
const watchField = (field: string) => {
   return (newValue: string) => validateField(field, newValue);
};

// Formatear fecha
const formatDate = (dateString: string | undefined) => {
   if (!dateString) return '';

   const date = new Date(dateString);
   return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
   });
};

// Manejar envío del formulario
const handleSubmit = () => {
   // Validar todos los campos
   validateField('firstName', form.value.firstName);
   validateField('lastName', form.value.lastName);
   validateField('email', form.value.email);
   validateField('phone', form.value.phone);

   if (!form.value.acceptTerms) {
      errors.value.acceptTerms = 'Debe aceptar los términos y condiciones';
   }

   if (!isFormValid.value) {
      submitError.value = 'Por favor, corrija los errores en el formulario';
      return;
   }

   submitError.value = null;

   const guestData: GuestData = {
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim(),
      email: form.value.email.trim(),
      phone: form.value.phone.trim(),
      specialRequests: form.value.specialRequests?.trim() || undefined,
   };

   emit('confirm', guestData);
};
</script>

<style scoped>
.guest-screen {
   padding: 0;
}

.guest-header {
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

.guest-title {
   margin: 0;
   font-size: 1.25rem;
   font-weight: 600;
   color: #111827;
}

/* Resumen de reserva */
.booking-summary {
   background-color: #f9fafb;
   border: 1px solid #e5e7eb;
   border-radius: var(--radius);
   padding: 1rem;
   margin-bottom: 1.5rem;
}

.summary-title {
   margin: 0 0 0.75rem 0;
   font-size: 1rem;
   font-weight: 600;
   color: #111827;
}

.summary-content {
   display: flex;
   flex-direction: column;
   gap: 0.5rem;
}

.summary-row {
   display: flex;
   justify-content: space-between;
   align-items: center;
}

.summary-label {
   color: #6b7280;
   font-size: 0.875rem;
}

.summary-value {
   color: #111827;
   font-weight: 500;
   font-size: 0.875rem;
}

.summary-total {
   margin-top: 0.5rem;
   padding-top: 0.5rem;
   border-top: 1px solid #e5e7eb;
}

.summary-total .summary-label,
.summary-total .summary-value {
   font-weight: 600;
   font-size: 1rem;
   color: var(--color-primary);
}

/* Formulario */
.guest-form {
   display: flex;
   flex-direction: column;
   gap: 1rem;
}

.form-grid {
   display: grid;
   grid-template-columns: 1fr 1fr;
   gap: 1rem;
}

.form-group {
   display: flex;
   flex-direction: column;
   gap: 0.5rem;
}

.form-label {
   font-weight: 500;
   color: #374151;
   font-size: 0.875rem;
}

.form-input,
.form-textarea {
   padding: 0.75rem;
   border: 1px solid #d1d5db;
   border-radius: var(--radius);
   font-size: 1rem;
   transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-textarea:focus {
   outline: none;
   border-color: var(--color-primary);
   box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-input--error {
   border-color: #ef4444;
}

.form-textarea {
   resize: vertical;
   min-height: 80px;
   font-family: inherit;
}

.field-error {
   color: #ef4444;
   font-size: 0.75rem;
}

.char-counter {
   font-size: 0.75rem;
   color: #9ca3af;
   text-align: right;
}

/* Checkbox */
.checkbox-label {
   display: flex;
   align-items: flex-start;
   gap: 0.5rem;
   cursor: pointer;
}

.checkbox-input {
   margin: 0;
   accent-color: var(--color-primary);
}

.checkbox-text {
   font-size: 0.875rem;
   color: #374151;
   line-height: 1.4;
}

.terms-link {
   color: var(--color-primary);
   text-decoration: underline;
}

/* Botones */
.form-actions {
   display: flex;
   gap: 1rem;
   margin-top: 1rem;
}

.cancel-button {
   flex: 1;
   padding: 0.875rem 1.5rem;
   background-color: #f9fafb;
   color: #374151;
   border: 1px solid #d1d5db;
   border-radius: var(--radius);
   font-size: 1rem;
   cursor: pointer;
   transition: background-color 0.2s;
}

.cancel-button:hover {
   background-color: #f3f4f6;
}

.confirm-button {
   flex: 2;
   padding: 0.875rem 1.5rem;
   background-color: var(--color-primary);
   color: white;
   border: none;
   border-radius: var(--radius);
   font-size: 1rem;
   font-weight: 500;
   cursor: pointer;
   transition: background-color 0.2s;
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 0.5rem;
}

.confirm-button:hover:not(:disabled) {
   background-color: var(--color-primary-hover);
}

.confirm-button:disabled {
   opacity: 0.6;
   cursor: not-allowed;
}

.loading-spinner {
   width: 16px;
   height: 16px;
   border: 2px solid transparent;
   border-top: 2px solid currentColor;
   border-radius: 50%;
   animation: spin 1s linear infinite;
}

.submit-error {
   color: #ef4444;
   font-size: 0.875rem;
   text-align: center;
   padding: 0.75rem;
   background-color: #fef2f2;
   border: 1px solid #fecaca;
   border-radius: var(--radius);
}

/* Modal de términos */
.terms-modal {
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background-color: rgba(0, 0, 0, 0.5);
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 1000;
}

.terms-content {
   background: white;
   padding: 2rem;
   border-radius: var(--radius);
   max-width: 400px;
   margin: 1rem;
}

.terms-content h3 {
   margin: 0 0 1rem 0;
}

.close-terms-button {
   margin-top: 1rem;
   padding: 0.5rem 1rem;
   background-color: var(--color-primary);
   color: white;
   border: none;
   border-radius: var(--radius);
   cursor: pointer;
}

@keyframes spin {
   to {
      transform: rotate(360deg);
   }
}

/* Responsive */
@media (max-width: 480px) {
   .form-grid {
      grid-template-columns: 1fr;
   }

   .form-actions {
      flex-direction: column;
   }

   .form-input,
   .form-textarea {
      font-size: 16px; /* Evita zoom en iOS */
   }
}
</style>

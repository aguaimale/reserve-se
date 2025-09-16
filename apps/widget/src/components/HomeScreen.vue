<template>
   <div class="home-screen">
      <form @submit.prevent="handleSubmit" class="search-form">
         <!-- Selector de fechas -->
         <div class="form-group">
            <div
               style="
                  display: flex;
                  flex-direction: column;
                  gap: 0.5rem;
                  padding: 0.5rem;
               "
            >
               <label for="checkin" class="form-label">{{
                  t('home.checkin')
               }}</label>
               <input
                  id="checkin"
                  v-model="form.checkin"
                  type="date"
                  class="form-input"
                  :min="minDate"
                  required
                  @change="validateDates"
               />
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
               <label for="checkout" class="form-label">{{
                  t('home.checkout')
               }}</label>
               <input
                  id="checkout"
                  v-model="form.checkout"
                  type="date"
                  class="form-input"
                  :min="minCheckout"
                  required
                  @change="validateDates"
               />
            </div>
         </div>

         <!-- Selector de huéspedes -->
         <div class="form-group">
            <div
               style="
                  display: flex;
                  flex-direction: column;
                  gap: 0.5rem;
                  padding: 0.5rem;
               "
            >
               <label class="form-label">{{ t('home.guests') }}</label>

               <!-- Contador de adultos -->
               <div class="guest-counter">
                  <label for="adults" class="guest-label">{{
                     t('home.adults')
                  }}</label>
                  <div class="counter-controls">
                     <button
                        type="button"
                        class="counter-btn"
                        @click="decreaseAdults"
                        :disabled="form.adults <= 1"
                     >
                        −
                     </button>
                     <span class="counter-value">{{ form.adults }}</span>
                     <button
                        type="button"
                        class="counter-btn"
                        @click="increaseAdults"
                        :disabled="form.adults >= 8"
                     >
                        +
                     </button>
                  </div>
               </div>

               <!-- Contador de menores -->
               <div class="guest-counter">
                  <label for="children" class="guest-label">{{
                     t('home.children')
                  }}</label>
                  <div class="counter-controls">
                     <button
                        type="button"
                        class="counter-btn"
                        @click="decreaseChildren"
                        :disabled="form.children <= 0"
                     >
                        −
                     </button>
                     <span class="counter-value">{{ form.children }}</span>
                     <button
                        type="button"
                        class="counter-btn"
                        @click="increaseChildren"
                        :disabled="form.children >= 6"
                     >
                        +
                     </button>
                  </div>
               </div>

               <!-- Selector de edades de menores -->
               <div v-if="form.children > 0" class="children-ages">
                  <label class="ages-label">{{ t('home.childrenAges') }}</label>
                  <div class="ages-container">
                     <div
                        v-for="(age, index) in form.childrenAges"
                        :key="index"
                        class="age-selector"
                     >
                        <label class="age-label">
                           {{ t('home.child') }} {{ index + 1 }}
                        </label>
                        <select
                           :value="age"
                           @change="
                              updateChildAge(
                                 index,
                                 parseInt(
                                    ($event.target as HTMLSelectElement).value
                                 )
                              )
                           "
                           class="age-select"
                        >
                           <option
                              v-for="ageOption in 17"
                              :key="ageOption"
                              :value="ageOption"
                           >
                              {{ ageOption }}
                              {{
                                 ageOption === 1
                                    ? t('home.year')
                                    : t('home.years')
                              }}
                           </option>
                        </select>
                     </div>
                  </div>
               </div>

               <!-- Resumen de huéspedes -->
               <div class="guests-summary">
                  <span class="summary-text">
                     {{ getGuestsSummary() }}
                  </span>
               </div>
            </div>
         </div>

         <!-- Botón de búsqueda -->
         <button
            type="submit"
            class="search-button"
            :disabled="loading || !isFormValid"
         >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? t('home.searching') : t('home.search') }}
         </button>

         <!-- Mensajes de validación -->
         <div v-if="validationError" class="error-message">
            {{ validationError }}
         </div>
      </form>
   </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SearchParams } from '../types';

interface Props {
   loading?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
   search: [params: SearchParams];
}>();

const { t } = useI18n();
const $t = inject('$t') as (key: string) => string;

// Estado del formulario
const form = ref({
   checkin: '',
   checkout: '',
   adults: 2,
   children: 0,
   childrenAges: [] as number[], // Array para almacenar las edades de los menores
});

const validationError = ref<string | null>(null);

// Fechas mínimas
const minDate = computed(() => {
   const today = new Date();
   return today.toISOString().split('T')[0];
});

const minCheckout = computed(() => {
   if (!form.value.checkin) return minDate.value;

   const checkinDate = new Date(form.value.checkin);
   checkinDate.setDate(checkinDate.getDate() + 1);
   return checkinDate.toISOString().split('T')[0];
});

// Validación del formulario
const isFormValid = computed(() => {
   return (
      form.value.checkin &&
      form.value.checkout &&
      (form.value.adults > 0 || form.value.children > 0) &&
      !validationError.value
   );
});

const validateDates = () => {
   validationError.value = null;

   if (form.value.checkin && form.value.checkout) {
      const checkinDate = new Date(form.value.checkin);
      const checkoutDate = new Date(form.value.checkout);

      if (checkoutDate <= checkinDate) {
         validationError.value =
            'La fecha de salida debe ser posterior a la de entrada';
         return false;
      }

      // Validar que no sea más de 30 días
      const diffTime = checkoutDate.getTime() - checkinDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 30) {
         validationError.value = 'La estadía no puede ser mayor a 30 días';
         return false;
      }
   }

   return true;
};

// Funciones para manejar contadores
const increaseAdults = () => {
   if (form.value.adults < 8) {
      form.value.adults++;
   }
};

const decreaseAdults = () => {
   if (form.value.adults > 1) {
      form.value.adults--;
   }
};

const increaseChildren = () => {
   if (form.value.children < 6) {
      form.value.children++;
      // Agregar una nueva edad (por defecto 5 años)
      form.value.childrenAges.push(5);
   }
};

const decreaseChildren = () => {
   if (form.value.children > 0) {
      form.value.children--;
      // Remover la última edad
      form.value.childrenAges.pop();
   }
};

// Función para actualizar la edad de un menor específico
const updateChildAge = (index: number, age: number) => {
   form.value.childrenAges[index] = age;
};

// Función para generar resumen de huéspedes
const getGuestsSummary = () => {
   const adultsText =
      form.value.adults === 1 ? t('home.adult') : t('home.adults');

   if (form.value.children === 0) {
      return `${form.value.adults} ${adultsText}`;
   } else {
      const childrenText =
         form.value.children === 1 ? t('home.child') : t('home.children');
      const agesText =
         form.value.childrenAges.length > 0
            ? ` (${form.value.childrenAges.join(', ')} años)`
            : '';
      return `${form.value.adults} ${adultsText}, ${form.value.children} ${childrenText}${agesText}`;
   }
};

const handleSubmit = () => {
   if (!validateDates() || !isFormValid.value) return;

   const searchParams: SearchParams = {
      checkin: form.value.checkin,
      checkout: form.value.checkout,
      guests: form.value.adults + form.value.children,
   };

   emit('search', searchParams);
};
</script>

<style scoped>
.home-screen {
   padding: 0;
}

.search-form {
   display: flex;
   flex-direction: column;
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

.form-input {
   padding: 0.75rem;
   border: 1px solid #d1d5db;
   border-radius: var(--radius);
   font-size: 1rem;
   transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
   outline: none;
   border-color: var(--color-primary);
   box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-input:invalid {
   border-color: #ef4444;
}

.search-button {
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
   min-height: 48px;
}

.search-button:hover:not(:disabled) {
   background-color: var(--color-primary-hover);
}

.search-button:disabled {
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

.error-message {
   color: #ef4444;
   font-size: 0.875rem;
   text-align: center;
   padding: 0.5rem;
   background-color: #fef2f2;
   border: 1px solid #fecaca;
   border-radius: var(--radius);
}

/* Estilos para contadores de huéspedes */
.guest-counter {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 0.75rem;
   background-color: #f9fafb;
   border: 1px solid #e5e7eb;
   border-radius: var(--radius);
   transition: border-color 0.2s;
}

.guest-counter:hover {
   border-color: var(--color-primary-light);
}

.guest-label {
   font-weight: 500;
   color: #374151;
   font-size: 0.875rem;
}

.counter-controls {
   display: flex;
   align-items: center;
   gap: 0.75rem;
}

.counter-btn {
   width: 32px;
   height: 32px;
   border: 1px solid #d1d5db;
   background-color: white;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 1.125rem;
   font-weight: 600;
   color: #374151;
   cursor: pointer;
   transition: all 0.2s;
}

.counter-btn:hover:not(:disabled) {
   border-color: var(--color-primary);
   color: var(--color-primary);
   background-color: var(--color-primary-light);
}

.counter-btn:disabled {
   opacity: 0.5;
   cursor: not-allowed;
   background-color: #f3f4f6;
}

.counter-value {
   min-width: 24px;
   text-align: center;
   font-weight: 600;
   color: #111827;
   font-size: 1rem;
}

.guests-summary {
   padding: 0.5rem 0.75rem;
   background-color: var(--color-primary-light);
   border-radius: var(--radius);
   text-align: center;
}

.summary-text {
   font-size: 0.875rem;
   font-weight: 500;
   color: var(--color-primary);
}

/* Estilos para selector de edades de menores */
.children-ages {
   margin-top: 0.5rem;
}

.ages-label {
   font-weight: 500;
   color: #374151;
   font-size: 0.875rem;
   margin-bottom: 0.5rem;
   display: block;
}

.ages-container {
   display: flex;
   flex-direction: column;
   gap: 0.5rem;
}

.age-selector {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 0.5rem 0.75rem;
   background-color: #f3f4f6;
   border: 1px solid #e5e7eb;
   border-radius: var(--radius);
   transition: border-color 0.2s;
}

.age-selector:hover {
   border-color: var(--color-primary-light);
}

.age-label {
   font-size: 0.875rem;
   font-weight: 500;
   color: #6b7280;
}

.age-select {
   padding: 0.25rem 0.5rem;
   border: 1px solid #d1d5db;
   border-radius: 4px;
   background-color: white;
   font-size: 0.875rem;
   color: #374151;
   min-width: 80px;
   transition: border-color 0.2s;
}

.age-select:focus {
   outline: none;
   border-color: var(--color-primary);
   box-shadow: 0 0 0 2px var(--color-primary-light);
}

@keyframes spin {
   to {
      transform: rotate(360deg);
   }
}

/* Responsive */
@media (max-width: 480px) {
   .form-input {
      padding: 0.625rem;
      font-size: 16px; /* Evita zoom en iOS */
   }

   .search-button {
      padding: 1rem;
   }

   .guest-counter {
      padding: 0.625rem;
   }

   .counter-btn {
      width: 28px;
      height: 28px;
      font-size: 1rem;
   }

   .counter-controls {
      gap: 0.5rem;
   }

   .age-selector {
      padding: 0.375rem 0.5rem;
   }

   .age-select {
      min-width: 70px;
      font-size: 0.8rem;
   }
}
</style>

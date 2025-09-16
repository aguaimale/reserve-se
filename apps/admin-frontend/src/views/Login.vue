<template>
   <div
      class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
   >
      <div class="max-w-md w-full space-y-8">
         <!-- Logo/Header -->
         <div class="text-center">
            <i class="pi pi-home text-4xl text-blue-600 mb-4"></i>
            <h2 class="text-3xl font-bold text-gray-900">
               {{ t('auth.login') }}
            </h2>
            <p class="mt-2 text-gray-600">Sistema de Gestión Hotelera</p>
         </div>

         <!-- Login Form -->
         <Card class="mt-8">
            <template #content>
               <form @submit.prevent="handleLogin" class="space-y-6">
                  <div>
                     <label
                        for="email"
                        class="block text-sm font-medium text-gray-700 mb-2"
                     >
                        {{ t('auth.email') }}
                     </label>
                     <InputText
                        id="email"
                        v-model="form.email"
                        type="email"
                        class="w-full"
                        :class="{ 'p-invalid': errors.email }"
                        placeholder="manager@hotel.com"
                        required
                     />
                     <small v-if="errors.email" class="p-error">{{
                        errors.email
                     }}</small>
                  </div>

                  <div>
                     <label
                        for="password"
                        class="block text-sm font-medium text-gray-700 mb-2"
                     >
                        {{ t('auth.password') }}
                     </label>
                     <Password
                        id="password"
                        v-model="form.password"
                        class="w-full"
                        :class="{ 'p-invalid': errors.password }"
                        placeholder="Ingresa tu contraseña"
                        :feedback="false"
                        toggle-mask
                        required
                     />
                     <small v-if="errors.password" class="p-error">{{
                        errors.password
                     }}</small>
                  </div>

                  <div v-if="loginError" class="text-center">
                     <small class="p-error">{{ loginError }}</small>
                  </div>

                  <div
                     v-if="isRateLimited"
                     class="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg"
                  >
                     <div class="flex items-center justify-center space-x-2">
                        <i class="pi pi-clock text-orange-600"></i>
                        <small class="text-orange-700 font-medium">
                           Demasiados intentos. Espera
                           {{ rateLimitCooldown }} segundos.
                        </small>
                     </div>
                  </div>

                  <Button
                     type="submit"
                     class="w-full"
                     :loading="loading"
                     :disabled="!isFormValid"
                  >
                     <span v-if="loading">Iniciando sesión...</span>
                     <span v-else-if="isRateLimited">
                        Espera {{ rateLimitCooldown }}s
                     </span>
                     <span v-else>{{ t('auth.login') }}</span>
                  </Button>
               </form>
            </template>
         </Card>

         <!-- Demo credentials -->
         <div class="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 class="text-sm font-medium text-blue-900 mb-2">
               Credenciales de prueba:
            </h3>
            <div class="text-sm text-blue-800 space-y-1">
               <p>
                  <strong>Hotel Luna:</strong> manager@hotel-luna.com /
                  password123
               </p>
               <p>
                  <strong>Hotel Sol:</strong> manager@hotel-sol.com /
                  password123
               </p>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';
import { useI18n } from '@/composables/useI18n';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const { t } = useI18n();

const form = ref({
   email: '',
   password: '',
});

const errors = ref({
   email: '',
   password: '',
});

const loginError = ref('');
const loading = computed(() => authStore.loading);
const isRateLimited = ref(false);
const rateLimitCooldown = ref(0);

const isFormValid = computed(() => {
   return (
      form.value.email &&
      form.value.password &&
      !Object.values(errors.value).some((error) => error) &&
      !isRateLimited.value
   );
});

const validateForm = () => {
   errors.value = { email: '', password: '' };

   if (!form.value.email) {
      errors.value.email = 'El email es requerido';
   } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
      errors.value.email = 'Formato de email inválido';
   }

   if (!form.value.password) {
      errors.value.password = 'La contraseña es requerida';
   } else if (form.value.password.length < 6) {
      errors.value.password = 'La contraseña debe tener al menos 6 caracteres';
   }

   return !Object.values(errors.value).some((error) => error);
};

const handleLogin = async () => {
   if (!validateForm()) return;

   try {
      loginError.value = '';
      await authStore.login(form.value.email, form.value.password);

      toast.add({
         severity: 'success',
         summary: 'Bienvenido',
         detail: `Hola ${authStore.user?.name}!`,
         life: 3000,
      });

      router.push('/dashboard');
   } catch (error: any) {
      console.error('Login error:', error);

      // Handle specific error types
      if (error.response?.status === 429) {
         isRateLimited.value = true;
         rateLimitCooldown.value = 60; // 60 seconds cooldown

         loginError.value =
            'Demasiados intentos de login. Por favor, espera unos minutos antes de intentar nuevamente.';
         toast.add({
            severity: 'warn',
            summary: 'Demasiados Intentos',
            detail:
               'Por favor, espera unos minutos antes de intentar nuevamente.',
            life: 5000,
         });

         // Start countdown
         const countdown = setInterval(() => {
            rateLimitCooldown.value--;
            if (rateLimitCooldown.value <= 0) {
               isRateLimited.value = false;
               clearInterval(countdown);
            }
         }, 1000);
      } else if (error.response?.status === 401) {
         loginError.value = 'Email o contraseña incorrectos';
         toast.add({
            severity: 'error',
            summary: 'Credenciales Incorrectas',
            detail: 'Verifica tu email y contraseña',
            life: 3000,
         });
      } else if (error.response?.status >= 500) {
         loginError.value = 'Error del servidor. Por favor, intenta más tarde.';
         toast.add({
            severity: 'error',
            summary: 'Error del Servidor',
            detail: 'El servidor no está disponible. Intenta más tarde.',
            life: 5000,
         });
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
         loginError.value = 'Sin conexión a internet. Verifica tu conexión.';
         toast.add({
            severity: 'error',
            summary: 'Sin Conexión',
            detail: 'Verifica tu conexión a internet',
            life: 5000,
         });
      } else {
         loginError.value = error.message || 'Error al iniciar sesión';
         toast.add({
            severity: 'error',
            summary: 'Error de Login',
            detail: error.message || 'Error al iniciar sesión',
            life: 3000,
         });
      }
   }
};
</script>

<style scoped>
/* Estilos para el componente Password de PrimeVue */
:deep(.p-password) {
   position: relative;
   width: 100%;
}

:deep(.p-password .p-password-input) {
   width: 100%;
   padding-right: 2.5rem;
}

:deep(.p-password .p-password-toggle) {
   position: absolute;
   right: 0.75rem;
   top: 50%;
   transform: translateY(-50%);
   background: transparent;
   border: none;
   cursor: pointer;
   color: #6b7280;
   z-index: 10;
   padding: 0.25rem;
   border-radius: 0.25rem;
   transition: color 0.2s ease;
}

:deep(.p-password .p-password-toggle:hover) {
   color: #374151;
   background-color: rgba(0, 0, 0, 0.04);
}

:deep(.p-password .p-password-toggle:focus) {
   outline: 2px solid #3b82f6;
   outline-offset: 2px;
}
</style>

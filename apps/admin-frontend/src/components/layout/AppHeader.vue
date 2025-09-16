<template>
   <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
         <!-- Left side -->
         <div class="flex items-center space-x-4">
            <!-- Mobile menu button -->
            <Button
               icon="pi pi-bars"
               class="md:hidden"
               text
               @click="$emit('toggle-sidebar')"
            />

            <!-- Page title -->
            <h1 class="text-xl font-semibold text-gray-900">
               {{ $route.meta.title || 'Panel Admin' }}
            </h1>
         </div>

         <!-- Right side -->
         <div class="flex items-center space-x-4">
            <!-- User info -->
            <div class="hidden md:block text-right">
               <p class="text-sm font-medium text-gray-900">{{ user?.name }}</p>
               <p class="text-xs text-gray-600">{{ user?.email }}</p>
            </div>

            <!-- User menu -->
            <Menu ref="userMenu" :model="userMenuItems" :popup="true" />
            <Button
               icon="pi pi-user"
               class="p-button-rounded p-button-text"
               @click="toggleUserMenu"
            />
         </div>
      </div>
   </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';
import { useI18n } from '@/composables/useI18n';

const emit = defineEmits<{
   'toggle-sidebar': [];
}>();

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const { t } = useI18n();
const userMenu = ref();

const user = computed(() => authStore.user);

const userMenuItems = computed(() => [
   {
      label: t('navigation.profile'),
      icon: 'pi pi-user',
      command: () => {
         // TODO: Implement profile view
         toast.add({
            severity: 'info',
            summary: 'Próximamente',
            detail: 'Función en desarrollo',
            life: 3000,
         });
      },
   },
   {
      separator: true,
   },
   {
      label: t('navigation.logout'),
      icon: 'pi pi-sign-out',
      command: () => {
         authStore.logout();
         router.push('/login');
         toast.add({
            severity: 'success',
            summary: t('auth.logout'),
            detail: 'Has cerrado sesión exitosamente',
            life: 3000,
         });
      },
   },
]);

const toggleUserMenu = (event: Event) => {
   userMenu.value.toggle(event);
};
</script>

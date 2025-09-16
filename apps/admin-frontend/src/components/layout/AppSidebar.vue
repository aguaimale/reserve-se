<template>
   <Sidebar
      v-model:visible="visible"
      class="w-64"
      :modal="false"
      position="left"
   >
      <!-- Logo -->
      <div class="p-4 border-b">
         <div class="flex items-center space-x-3">
            <i class="pi pi-home text-2xl text-blue-600"></i>
            <div>
               <h2 class="font-bold text-lg">{{ user?.tenant.name }}</h2>
               <p class="text-sm text-gray-600">Panel Admin</p>
            </div>
         </div>
      </div>

      <!-- Navigation -->
      <nav class="p-4">
         <ul class="space-y-2">
            <li>
               <router-link
                  to="/dashboard"
                  class="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors nav-link-hover"
                  :class="{
                     'nav-link-active': $route.name === 'dashboard',
                  }"
               >
                  <i class="pi pi-chart-line"></i>
                  <span>{{ t('navigation.dashboard') }}</span>
               </router-link>
            </li>
            <li>
               <router-link
                  to="/inventory"
                  class="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors nav-link-hover"
                  :class="{
                     'nav-link-active': $route.name === 'inventory',
                  }"
               >
                  <i class="pi pi-box"></i>
                  <span>{{ t('navigation.inventory') }}</span>
               </router-link>
            </li>
            <li>
               <router-link
                  to="/bookings"
                  class="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors nav-link-hover"
                  :class="{
                     'nav-link-active': $route.name === 'bookings',
                  }"
               >
                  <i class="pi pi-calendar"></i>
                  <span>{{ t('navigation.bookings') }}</span>
               </router-link>
            </li>
            <li>
               <router-link
                  to="/settings"
                  class="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors nav-link-hover"
                  :class="{
                     'nav-link-active': $route.name === 'settings',
                  }"
               >
                  <i class="pi pi-cog"></i>
                  <span>{{ t('navigation.settings') }}</span>
               </router-link>
            </li>
         </ul>
      </nav>
   </Sidebar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from '@/composables/useI18n';

interface Props {
   visible: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
   hide: [];
}>();

const authStore = useAuthStore();
const { t } = useI18n();
const user = computed(() => authStore.user);

const visible = computed({
   get: () => props.visible,
   set: (value) => {
      if (!value) emit('hide');
   },
});
</script>

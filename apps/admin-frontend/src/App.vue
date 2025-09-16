<template>
   <div id="app" class="min-h-screen bg-gray-50">
      <!-- Layout principal -->
      <div v-if="isAuthenticated" class="flex h-screen">
         <!-- Sidebar -->
         <AppSidebar :visible="sidebarVisible" @hide="sidebarVisible = false" />

         <!-- Main content -->
         <div class="flex-1 flex flex-col overflow-hidden">
            <!-- Header -->
            <AppHeader @toggle-sidebar="sidebarVisible = !sidebarVisible" />

            <!-- Page content -->
            <main class="flex-1 overflow-auto p-6">
               <router-view />
            </main>
         </div>
      </div>

      <!-- Login page (no layout) -->
      <div v-else>
         <router-view />
      </div>

      <!-- Global components -->
      <Toast />
      <ConfirmDialog />
   </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import AppHeader from '@/components/layout/AppHeader.vue';

const authStore = useAuthStore();
const sidebarVisible = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);

onMounted(async () => {
   // Initialize auth store
   await authStore.init();
});
</script>

<style>
/* Global styles already imported in main.ts */
</style>

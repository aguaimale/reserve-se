<template>
   <div id="app" class="min-h-screen bg-gray-50">
      <!-- Router view para las vistas dedicadas -->
      <router-view />

      <!-- Global components -->
      <Toast />
   </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

onMounted(() => {
   // Aplicar theming dinámico basado en el tenant
   const tenant = route.params.tenant as string;
   if (tenant) {
      // Aquí se aplicará el theming específico del hotel
      console.log('Loading tenant:', tenant);
   }
});
</script>

<style>
/* Global styles already imported in main.ts */
</style>

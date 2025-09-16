<template>
   <div class="not-found">
      <div class="container mx-auto px-4 py-16 text-center">
         <div class="max-w-md mx-auto">
            <i
               class="pi pi-exclamation-triangle text-6xl text-gray-400 mb-6"
            ></i>
            <h1 class="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <h2 class="text-xl font-semibold text-gray-700 mb-4">
               Hotel no encontrado
            </h2>
            <p class="text-gray-600 mb-8">
               Lo sentimos, no pudimos encontrar el hotel que buscas. Verifica
               la URL o regresa a la página principal.
            </p>

            <div class="space-y-4">
               <Button
                  label="Ir a Hotel Luna"
                  icon="pi pi-home"
                  @click="goToHotel('hotel-luna')"
               />
               <br />
               <Button
                  label="Ir a Hotel Sol"
                  icon="pi pi-sun"
                  class="p-button-outlined"
                  @click="goToHotel('hotel-sol')"
               />
            </div>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goToHotel = (tenant: string) => {
   router.push(`/${tenant}`);
};
</script>

<style scoped>
.not-found {
   min-height: 100vh;
   display: flex;
   align-items: center;
   justify-content: center;
   background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
</style>

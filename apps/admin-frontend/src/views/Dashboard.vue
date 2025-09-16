<template>
   <div class="space-y-6">
      <!-- Welcome Section -->
      <div class="bg-white rounded-lg shadow p-6">
         <h2 class="text-2xl font-bold text-gray-900 mb-2">
            {{ t('dashboard.welcome', { name: user?.name }) }}
         </h2>
         <p class="text-gray-600">
            {{ t('dashboard.subtitle', { hotel: user?.tenant.name }) }}
         </p>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <Card class="text-center">
            <template #content>
               <div v-if="loadingKPIs" class="space-y-2 py-4">
                  <ProgressSpinner style="width: 30px; height: 30px" />
                  <p class="text-sm text-gray-600">Cargando...</p>
               </div>
               <div v-else class="space-y-2">
                  <i class="pi pi-calendar text-3xl text-blue-600"></i>
                  <h3 class="text-2xl font-bold text-gray-900">
                     {{ kpis.todayCheckIns }}
                  </h3>
                  <p class="text-sm text-gray-600">
                     {{ t('dashboard.todayCheckIns') }}
                  </p>
               </div>
            </template>
         </Card>

         <Card class="text-center">
            <template #content>
               <div v-if="loadingKPIs" class="space-y-2 py-4">
                  <ProgressSpinner style="width: 30px; height: 30px" />
                  <p class="text-sm text-gray-600">Cargando...</p>
               </div>
               <div v-else class="space-y-2">
                  <i class="pi pi-users text-3xl text-green-600"></i>
                  <h3 class="text-2xl font-bold text-gray-900">
                     {{ kpis.occupancy }}%
                  </h3>
                  <p class="text-sm text-gray-600">
                     {{ t('dashboard.occupancy') }}
                  </p>
               </div>
            </template>
         </Card>

         <Card class="text-center">
            <template #content>
               <div v-if="loadingKPIs" class="space-y-2 py-4">
                  <ProgressSpinner style="width: 30px; height: 30px" />
                  <p class="text-sm text-gray-600">Cargando...</p>
               </div>
               <div v-else class="space-y-2">
                  <i class="pi pi-dollar text-3xl text-purple-600"></i>
                  <h3 class="text-2xl font-bold text-gray-900">
                     ${{ kpis.revenue.toLocaleString() }}
                  </h3>
                  <p class="text-sm text-gray-600">
                     {{ t('dashboard.monthlyRevenue') }}
                  </p>
               </div>
            </template>
         </Card>

         <Card class="text-center">
            <template #content>
               <div v-if="loadingKPIs" class="space-y-2 py-4">
                  <ProgressSpinner style="width: 30px; height: 30px" />
                  <p class="text-sm text-gray-600">Cargando...</p>
               </div>
               <div v-else class="space-y-2">
                  <i class="pi pi-chart-line text-3xl text-orange-600"></i>
                  <h3 class="text-2xl font-bold text-gray-900">
                     {{ kpis.totalBookings }}
                  </h3>
                  <p class="text-sm text-gray-600">
                     {{ t('dashboard.activeBookings') }}
                  </p>
               </div>
            </template>
         </Card>
      </div>

      <!-- Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <!-- Próximas Llegadas -->
         <Card>
            <template #title>
               <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold">
                     {{ t('dashboard.upcomingArrivals') }}
                  </h3>
                  <Button
                     icon="pi pi-refresh"
                     class="p-button-text p-button-sm"
                     @click="loadUpcomingArrivals"
                     :loading="loadingArrivals"
                  />
               </div>
            </template>
            <template #content>
               <div v-if="loadingArrivals" class="text-center py-4">
                  <ProgressSpinner style="width: 30px; height: 30px" />
               </div>
               <div
                  v-else-if="upcomingArrivals.length === 0"
                  class="text-center py-8 text-gray-500"
               >
                  <i class="pi pi-calendar text-2xl mb-2"></i>
                  <p>{{ t('dashboard.noUpcomingArrivals') }}</p>
               </div>
               <div v-else class="space-y-3">
                  <div
                     v-for="arrival in upcomingArrivals"
                     :key="arrival.id"
                     class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                     <div>
                        <p class="font-medium">{{ arrival.customer_name }}</p>
                        <p class="text-sm text-gray-600">
                           {{ arrival.room_type?.name }}
                        </p>
                     </div>
                     <div class="text-right">
                        <p class="text-sm font-medium">
                           {{ formatDate(arrival.checkin) }}
                        </p>
                        <Tag :value="arrival.status" severity="success" />
                     </div>
                  </div>
               </div>
            </template>
         </Card>

         <!-- Resumen de Inventario -->
         <Card>
            <template #title>
               <h3 class="text-lg font-semibold">
                  {{ t('dashboard.inventoryStatus') }}
               </h3>
            </template>
            <template #content>
               <div v-if="loadingInventory" class="text-center py-4">
                  <ProgressSpinner style="width: 30px; height: 30px" />
                  <p class="text-sm text-gray-600 mt-2">
                     {{ t('dashboard.loadingInventory') }}
                  </p>
               </div>
               <div
                  v-else-if="inventorySummary.length === 0"
                  class="text-center py-8 text-gray-500"
               >
                  <i class="pi pi-box text-2xl mb-2"></i>
                  <p>{{ t('dashboard.noInventoryData') }}</p>
               </div>
               <div v-else class="space-y-4">
                  <div
                     v-for="roomType in inventorySummary"
                     :key="roomType.name"
                     class="flex items-center justify-between"
                  >
                     <div>
                        <p class="font-medium">{{ roomType.name }}</p>
                        <p class="text-sm text-gray-600">
                           {{ roomType.available }}/{{ roomType.total }}
                           {{ t('dashboard.available') }}
                        </p>
                     </div>
                     <div class="w-20 bg-gray-200 rounded-full h-2">
                        <div
                           class="bg-blue-600 h-2 rounded-full"
                           :style="{
                              width: `${
                                 (roomType.available / roomType.total) * 100
                              }%`,
                           }"
                        ></div>
                     </div>
                  </div>
               </div>
            </template>
         </Card>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';
import { useI18n } from '@/composables/useI18n';
import api from '@/services/api';

const authStore = useAuthStore();
const toast = useToast();
const { t } = useI18n();
const user = computed(() => authStore.user);

// KPIs - will load from API
const kpis = ref({
   todayCheckIns: 0,
   occupancy: 0,
   revenue: 0,
   totalBookings: 0,
});

// Loading states
const loadingKPIs = ref(false);
const upcomingArrivals = ref<any[]>([]);
const loadingArrivals = ref(false);
const inventorySummary = ref<any[]>([]);
const loadingInventory = ref(false);

const formatDate = (dateString: string) => {
   const date = new Date(dateString);
   return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
   });
};

const loadKPIs = async () => {
   loadingKPIs.value = true;
   try {
      const today = new Date().toISOString().split('T')[0];

      // Get today's check-ins
      const checkInsResponse = await api.get('/bookings', {
         params: {
            checkin_from: today,
            checkin_to: today,
            status: 'confirmed',
            limit: 100,
         },
      });

      kpis.value.todayCheckIns = checkInsResponse.data.pagination?.total || 0;

      // Get total active bookings
      const bookingsResponse = await api.get('/bookings', {
         params: {
            status: 'confirmed',
            limit: 1,
         },
      });

      kpis.value.totalBookings = bookingsResponse.data.pagination?.total || 0;

      // Calculate revenue (this month)
      const firstDayMonth = new Date();
      firstDayMonth.setDate(1);

      const revenueResponse = await api.get('/bookings', {
         params: {
            checkin_from: firstDayMonth.toISOString().split('T')[0],
            status: 'confirmed',
            limit: 100,
         },
      });

      // Sum total revenue
      const totalRevenue =
         revenueResponse.data.data?.reduce((sum: number, booking: any) => {
            return sum + (booking.total_cents || 0);
         }, 0) || 0;

      kpis.value.revenue = Math.floor(totalRevenue / 100);

      const occupancyResponse = await api.get('/occupancy');
      kpis.value.occupancy = occupancyResponse.data.occupancy_rate;
   } catch (error) {
      console.error('Error loading KPIs:', error);
      toast.add({
         severity: 'error',
         summary: t('common.error'),
         detail: t('dashboard.errors.loadKPIs'),
         life: 3000,
      });
   } finally {
      loadingKPIs.value = false;
   }
};

const loadUpcomingArrivals = async () => {
   loadingArrivals.value = true;
   try {
      // Get bookings for next 7 days
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const response = await api.get('/bookings', {
         params: {
            checkin_from: today.toISOString().split('T')[0],
            checkin_to: nextWeek.toISOString().split('T')[0],
            status: 'confirmed',
            limit: 5,
         },
      });

      upcomingArrivals.value = response.data.data || [];
   } catch (error) {
      console.error('Error loading upcoming arrivals:', error);
      toast.add({
         severity: 'error',
         summary: t('common.error'),
         detail: t('dashboard.errors.loadArrivals'),
         life: 3000,
      });
   } finally {
      loadingArrivals.value = false;
   }
};

const loadInventorySummary = async () => {
   loadingInventory.value = true;
   try {
      // Get room types
      const roomTypesResponse = await api.get('/room-types');
      const roomTypes = roomTypesResponse.data.data || [];

      // For each room type, get current inventory
      const summaryPromises = roomTypes.map(async (roomType: any) => {
         try {
            const today = new Date().toISOString().split('T')[0];
            const inventoryResponse = await api.get('/inventory', {
               params: {
                  room_type_id: roomType.id,
                  date_from: today,
                  date_to: today,
                  limit: 10,
               },
            });

            const inventoryItems = inventoryResponse.data.data || [];
            const totalAvailable = inventoryItems.reduce(
               (sum: number, item: any) => {
                  return sum + (item.allotment || 0);
               },
               0
            );

            return {
               name: roomType.name,
               available: totalAvailable,
               total: totalAvailable, // Use actual available as total for now
            };
         } catch (error) {
            console.error(
               `Error loading inventory for room type ${roomType.id}:`,
               error
            );
            return {
               name: roomType.name,
               available: 0,
               total: 0,
            };
         }
      });

      inventorySummary.value = await Promise.all(summaryPromises);
   } catch (error) {
      console.error('Error loading inventory summary:', error);
      toast.add({
         severity: 'error',
         summary: t('common.error'),
         detail: t('dashboard.errors.loadInventory'),
         life: 3000,
      });
   } finally {
      loadingInventory.value = false;
   }
};

onMounted(() => {
   loadKPIs();
   loadUpcomingArrivals();
   loadInventorySummary();
});
</script>

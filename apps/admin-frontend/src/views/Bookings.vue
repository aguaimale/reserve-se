<template>
   <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
         <h2 class="text-2xl font-bold text-gray-900">
            {{ t('bookings.title') }}
         </h2>
         <Button
            icon="pi pi-refresh"
            :label="t('common.refresh')"
            @click="loadBookings"
            :loading="loading"
         />
      </div>

      <!-- Filters -->
      <Card>
         <template #content>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
               <div>
                  <label class="block text-sm font-medium mb-2">{{
                     t('common.search')
                  }}</label>
                  <InputText
                     v-model="filters.search"
                     :placeholder="t('bookings.searchPlaceholder')"
                     @keyup.enter="loadBookings"
                  />
               </div>
               <div>
                  <label class="block text-sm font-medium mb-2">{{
                     t('common.status')
                  }}</label>
                  <Dropdown
                     v-model="filters.status"
                     :options="statusOptions"
                     :placeholder="t('bookings.allStatuses')"
                     show-clear
                  />
               </div>
               <div>
                  <label class="block text-sm font-medium mb-2">{{
                     t('bookings.checkinFrom')
                  }}</label>
                  <Calendar
                     v-model="filters.checkinFrom"
                     date-format="yy-mm-dd"
                  />
               </div>
               <div>
                  <label class="block text-sm font-medium mb-2">{{
                     t('bookings.checkinTo')
                  }}</label>
                  <Calendar
                     v-model="filters.checkinTo"
                     date-format="yy-mm-dd"
                  />
               </div>
               <div class="flex items-end space-x-2">
                  <Button :label="t('common.filter')" @click="loadBookings" />
                  <Button
                     :label="t('common.clear')"
                     class="p-button-outlined"
                     @click="clearFilters"
                  />
               </div>
            </div>
         </template>
      </Card>

      <!-- Bookings Table -->
      <Card>
         <template #content>
            <DataTable
               :value="bookings"
               :loading="loading"
               paginator
               :rows="20"
               :total-records="totalRecords"
               lazy
               @page="onPage"
               responsive-layout="scroll"
               class="p-datatable-sm"
            >
               <Column field="locator" :header="t('bookings.locator')" sortable>
                  <template #body="{ data }">
                     <span class="font-mono font-medium">{{
                        data.locator
                     }}</span>
                  </template>
               </Column>
               <Column
                  field="customer_name"
                  :header="t('bookings.customer')"
                  sortable
               />
               <Column
                  field="customer_email"
                  :header="t('bookings.email')"
                  sortable
               />
               <Column
                  field="room_type.name"
                  :header="t('bookings.roomType')"
                  sortable
               />
               <Column field="checkin" :header="t('bookings.checkin')" sortable>
                  <template #body="{ data }">
                     {{ formatDate(data.checkin) }}
                  </template>
               </Column>
               <Column
                  field="checkout"
                  :header="t('bookings.checkout')"
                  sortable
               >
                  <template #body="{ data }">
                     {{ formatDate(data.checkout) }}
                  </template>
               </Column>
               <Column field="guests" :header="t('bookings.guests')" />
               <Column
                  field="total_cents"
                  :header="t('bookings.total')"
                  sortable
               >
                  <template #body="{ data }">
                     ${{ (data.total_cents / 100).toLocaleString() }}
                  </template>
               </Column>
               <Column field="status" :header="t('bookings.status')">
                  <template #body="{ data }">
                     <Tag
                        :value="getStatusLabel(data.status)"
                        :severity="getStatusSeverity(data.status)"
                     />
                  </template>
               </Column>
               <Column :header="t('common.actions')">
                  <template #body="{ data }">
                     <div class="flex space-x-2">
                        <Button
                           icon="pi pi-eye"
                           class="p-button-sm p-button-text"
                           @click="viewBooking(data)"
                        />
                        <Button
                           v-if="data.status === 'pending'"
                           icon="pi pi-check"
                           class="p-button-sm p-button-text p-button-success"
                           @click="confirmBooking(data)"
                        />
                        <Button
                           v-if="
                              data.status === 'pending' ||
                              data.status === 'confirmed'
                           "
                           icon="pi pi-times"
                           class="p-button-sm p-button-text p-button-danger"
                           @click="cancelBooking(data)"
                        />
                     </div>
                  </template>
               </Column>
            </DataTable>
         </template>
      </Card>

      <!-- Booking Details Dialog -->
      <Dialog
         v-model:visible="showBookingDialog"
         :header="t('bookings.details.title')"
         :modal="true"
         class="w-full max-w-4xl"
      >
         <div v-if="selectedBooking" class="space-y-6">
            <!-- Header with Locator and Status -->
            <div class="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
               <div class="flex items-center justify-between">
                  <div>
                     <h3 class="text-lg font-bold text-gray-900">
                        {{ selectedBooking.locator }}
                     </h3>
                     <p class="text-sm text-gray-600">
                        {{ t('bookings.details.created') }}
                        {{
                           formatDate(
                              selectedBooking.created_at ||
                                 selectedBooking.checkin
                           )
                        }}
                     </p>
                  </div>
                  <Tag
                     :value="getStatusLabel(selectedBooking.status)"
                     :severity="getStatusSeverity(selectedBooking.status)"
                     class="text-sm font-medium"
                  />
               </div>
            </div>

            <!-- Main Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <!-- Customer Information Card -->
               <Card class="h-fit">
                  <template #header>
                     <div class="flex items-center space-x-2 p-4 pb-0">
                        <i class="pi pi-user text-blue-600"></i>
                        <h4 class="font-semibold text-gray-900">
                           {{ t('bookings.details.customerInfo') }}
                        </h4>
                     </div>
                  </template>
                  <template #content>
                     <div class="space-y-3">
                        <div class="flex items-center space-x-3">
                           <i class="pi pi-user text-gray-400"></i>
                           <div>
                              <p class="text-sm text-gray-600">
                                 {{ t('common.name') }}
                              </p>
                              <p class="font-medium">
                                 {{ selectedBooking.customer_name }}
                              </p>
                           </div>
                        </div>
                        <div class="flex items-center space-x-3">
                           <i class="pi pi-envelope text-gray-400"></i>
                           <div>
                              <p class="text-sm text-gray-600">
                                 {{ t('common.email') }}
                              </p>
                              <p class="font-medium">
                                 {{ selectedBooking.customer_email }}
                              </p>
                           </div>
                        </div>
                        <div
                           v-if="selectedBooking.customer_phone"
                           class="flex items-center space-x-3"
                        >
                           <i class="pi pi-phone text-gray-400"></i>
                           <div>
                              <p class="text-sm text-gray-600">
                                 {{ t('common.phone') }}
                              </p>
                              <p class="font-medium">
                                 {{ selectedBooking.customer_phone }}
                              </p>
                           </div>
                        </div>
                     </div>
                  </template>
               </Card>

               <!-- Booking Details Card -->
               <Card class="h-fit">
                  <template #header>
                     <div class="flex items-center space-x-2 p-4 pb-0">
                        <i class="pi pi-calendar text-green-600"></i>
                        <h4 class="font-semibold text-gray-900">
                           Detalles de la Reserva
                        </h4>
                     </div>
                  </template>
                  <template #content>
                     <div class="space-y-3">
                        <div class="flex items-center space-x-3">
                           <i class="pi pi-home text-gray-400"></i>
                           <div>
                              <p class="text-sm text-gray-600">Habitación</p>
                              <p class="font-medium">
                                 {{ selectedBooking.room_type?.name }}
                              </p>
                           </div>
                        </div>
                        <div class="flex items-center space-x-3">
                           <i class="pi pi-tag text-gray-400"></i>
                           <div>
                              <p class="text-sm text-gray-600">Tarifa</p>
                              <p class="font-medium">
                                 {{ selectedBooking.rate_plan?.name }}
                              </p>
                           </div>
                        </div>
                        <div class="flex items-center space-x-3">
                           <i class="pi pi-users text-gray-400"></i>
                           <div>
                              <p class="text-sm text-gray-600">Huéspedes</p>
                              <p class="font-medium">
                                 {{ selectedBooking.guests }} persona{{
                                    selectedBooking.guests > 1 ? 's' : ''
                                 }}
                              </p>
                           </div>
                        </div>
                     </div>
                  </template>
               </Card>
            </div>

            <!-- Dates and Pricing Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <!-- Dates Card -->
               <Card>
                  <template #header>
                     <div class="flex items-center space-x-2 p-4 pb-0">
                        <i class="pi pi-calendar-plus text-purple-600"></i>
                        <h4 class="font-semibold text-gray-900">
                           Fechas de Estancia
                        </h4>
                     </div>
                  </template>
                  <template #content>
                     <div class="space-y-4">
                        <div
                           class="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                        >
                           <div class="flex items-center space-x-3">
                              <i class="pi pi-sign-in text-blue-600"></i>
                              <div>
                                 <p class="text-sm text-gray-600">Check-in</p>
                                 <p class="font-semibold text-blue-900">
                                    {{ formatDate(selectedBooking.checkin) }}
                                 </p>
                              </div>
                           </div>
                        </div>
                        <div
                           class="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                        >
                           <div class="flex items-center space-x-3">
                              <i class="pi pi-sign-out text-red-600"></i>
                              <div>
                                 <p class="text-sm text-gray-600">Check-out</p>
                                 <p class="font-semibold text-red-900">
                                    {{ formatDate(selectedBooking.checkout) }}
                                 </p>
                              </div>
                           </div>
                        </div>
                        <div class="text-center p-3 bg-gray-50 rounded-lg">
                           <p class="text-sm text-gray-600">
                              Duración de la estancia
                           </p>
                           <p class="text-2xl font-bold text-gray-900">
                              {{
                                 calculateNights(
                                    selectedBooking.checkin,
                                    selectedBooking.checkout
                                 )
                              }}
                              <span class="text-sm font-normal text-gray-600">
                                 noche{{
                                    calculateNights(
                                       selectedBooking.checkin,
                                       selectedBooking.checkout
                                    ) > 1
                                       ? 's'
                                       : ''
                                 }}
                              </span>
                           </p>
                        </div>
                     </div>
                  </template>
               </Card>

               <!-- Pricing Card -->
               <Card>
                  <template #header>
                     <div class="flex items-center space-x-2 p-4 pb-0">
                        <i class="pi pi-dollar text-green-600"></i>
                        <h4 class="font-semibold text-gray-900">
                           Información de Precios
                        </h4>
                     </div>
                  </template>
                  <template #content>
                     <div class="space-y-4">
                        <div
                           class="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                        >
                           <div class="flex items-center space-x-3">
                              <i class="pi pi-money-bill text-green-600"></i>
                              <div>
                                 <p class="text-sm text-gray-600">
                                    Total de la Reserva
                                 </p>
                                 <p class="text-2xl font-bold text-green-900">
                                    ${{
                                       (
                                          selectedBooking.total_cents / 100
                                       ).toLocaleString()
                                    }}
                                 </p>
                              </div>
                           </div>
                        </div>
                        <div class="space-y-2">
                           <div class="flex justify-between text-sm">
                              <span class="text-gray-600">Moneda:</span>
                              <span class="font-medium">{{
                                 selectedBooking.currency
                              }}</span>
                           </div>
                           <div class="flex justify-between text-sm">
                              <span class="text-gray-600"
                                 >Precio por noche:</span
                              >
                              <span class="font-medium">
                                 ${{
                                    Math.round(
                                       selectedBooking.total_cents /
                                          100 /
                                          calculateNights(
                                             selectedBooking.checkin,
                                             selectedBooking.checkout
                                          )
                                    ).toLocaleString()
                                 }}
                              </span>
                           </div>
                        </div>
                     </div>
                  </template>
               </Card>
            </div>

            <!-- Notes Section -->
            <div v-if="selectedBooking.notes" class="mt-6">
               <Card>
                  <template #header>
                     <div class="flex items-center space-x-2 p-4 pb-0">
                        <i class="pi pi-file-edit text-orange-600"></i>
                        <h4 class="font-semibold text-gray-900">
                           Notas Adicionales
                        </h4>
                     </div>
                  </template>
                  <template #content>
                     <div
                        class="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-200"
                     >
                        <p class="text-gray-700 leading-relaxed">
                           {{ selectedBooking.notes }}
                        </p>
                     </div>
                  </template>
               </Card>
            </div>

            <!-- Cancellation Reason Section -->
            <div v-if="selectedBooking.cancellation_reason" class="mt-6">
               <Card>
                  <template #header>
                     <div class="flex items-center space-x-2 p-4 pb-0">
                        <i class="pi pi-times-circle text-red-600"></i>
                        <h4 class="font-semibold text-gray-900">
                           Motivo de Cancelación
                        </h4>
                     </div>
                  </template>
                  <template #content>
                     <div
                        class="p-4 bg-red-50 rounded-lg border-l-4 border-red-200"
                     >
                        <p class="text-gray-700 leading-relaxed">
                           {{ selectedBooking.cancellation_reason }}
                        </p>
                     </div>
                  </template>
               </Card>
            </div>
         </div>
      </Dialog>

      <!-- Cancel Booking Dialog -->
      <Dialog
         v-model:visible="showCancelDialog"
         header="Cancelar Reserva"
         :modal="true"
         class="w-full max-w-md"
      >
         <div v-if="bookingToCancel" class="space-y-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
               <div class="flex items-center space-x-2">
                  <i class="pi pi-exclamation-triangle text-red-600"></i>
                  <h4 class="font-semibold text-red-900">
                     ¿Está seguro de cancelar esta reserva?
                  </h4>
               </div>
               <p class="text-sm text-red-700 mt-2">
                  Reserva:
                  <span class="font-mono font-medium">{{
                     bookingToCancel.locator
                  }}</span>
               </p>
            </div>

            <div>
               <label class="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de la cancelación <span class="text-red-500">*</span>
               </label>
               <textarea
                  v-model="cancelReason"
                  placeholder="Por favor, indique el motivo de la cancelación..."
                  rows="4"
                  class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :class="{
                     'border-red-500':
                        cancelReason.length > 0 &&
                        cancelReason.trim().length === 0,
                  }"
               ></textarea>
               <small
                  v-if="
                     cancelReason.length > 0 && cancelReason.trim().length === 0
                  "
                  class="text-red-500"
               >
                  El motivo de cancelación es obligatorio
               </small>
            </div>
         </div>

         <template #footer>
            <div class="flex justify-end space-x-2">
               <Button
                  label="Cancelar"
                  class="p-button-outlined"
                  @click="closeCancelDialog"
               />
               <Button
                  label="Confirmar Cancelación"
                  class="p-button-danger"
                  :disabled="!isCancelReasonValid"
                  @click="processCancellation"
               />
            </div>
         </template>
      </Dialog>
   </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useI18n } from '@/composables/useI18n';
import api from '@/services/api';

interface Booking {
   id: string;
   locator: string;
   status: string;
   checkin: string;
   checkout: string;
   guests: number;
   total_cents: number;
   currency: string;
   customer_name: string;
   customer_email: string;
   customer_phone?: string;
   notes?: string;
   cancellation_reason?: string;
   created_at?: string;
   room_type?: {
      name: string;
   };
   rate_plan?: {
      name: string;
   };
}

const toast = useToast();
const confirm = useConfirm();
const { t } = useI18n();

const bookings = ref<Booking[]>([]);
const loading = ref(false);
const totalRecords = ref(0);
const showBookingDialog = ref(false);
const selectedBooking = ref<Booking | null>(null);
const showCancelDialog = ref(false);
const cancelReason = ref('');
const bookingToCancel = ref<Booking | null>(null);

// Computed para validar el motivo de cancelación
const isCancelReasonValid = computed(() => {
   return cancelReason.value && cancelReason.value.trim().length > 0;
});

const filters = ref({
   search: '',
   status: null as string | null,
   checkinFrom: null as Date | null,
   checkinTo: null as Date | null,
});

const statusOptions = [
   { label: 'Pendiente', value: 'pending' },
   { label: 'Confirmada', value: 'confirmed' },
   { label: 'Cancelada', value: 'cancelled' },
];

const formatDate = (dateString: string) => {
   return new Date(dateString).toLocaleDateString('es-ES');
};

const getStatusSeverity = (status: string) => {
   switch (status) {
      case 'pending':
         return 'warning';
      case 'confirmed':
         return 'success';
      case 'cancelled':
         return 'danger';
      default:
         return 'info';
   }
};

const getStatusLabel = (status: string) => {
   switch (status) {
      case 'pending':
         return 'Pendiente';
      case 'confirmed':
         return 'Confirmada';
      case 'cancelled':
         return 'Cancelada';
      default:
         return status;
   }
};

const calculateNights = (checkin: string, checkout: string) => {
   const checkinDate = new Date(checkin);
   const checkoutDate = new Date(checkout);
   const diffTime = checkoutDate.getTime() - checkinDate.getTime();
   return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const clearFilters = () => {
   filters.value = {
      search: '',
      status: null,
      checkinFrom: null,
      checkinTo: null,
   };
   currentPage.value = 1;
   loadBookings();
};

const loadBookings = async () => {
   loading.value = true;
   try {
      const params: any = {
         page: currentPage.value,
         limit: 20,
      };

      if (filters.value.search) {
         const searchTerm = filters.value.search.trim();

         if (searchTerm.includes('@')) {
            // Contiene @ - probablemente es un email
            params.customer_email = searchTerm;
         } else if (/^[A-Z0-9-]{6,}$/i.test(searchTerm)) {
            // Solo letras, números y guiones, 6+ caracteres - probablemente es un localizador
            params.locator = searchTerm;
         } else {
            // Cualquier otra cosa - buscar en nombre del cliente
            params.customer_name = searchTerm;
         }
      }
      if (filters.value.status) {
         params.status = filters.value.status;
      }
      if (filters.value.checkinFrom) {
         params.checkin_from = filters.value.checkinFrom
            .toISOString()
            .split('T')[0];
      }
      if (filters.value.checkinTo) {
         params.checkin_to = filters.value.checkinTo
            .toISOString()
            .split('T')[0];
      }

      const response = await api.get('/bookings', { params });
      bookings.value = response.data.data || [];
      totalRecords.value = response.data.pagination?.total || 0;
   } catch (error) {
      console.error('Error loading bookings:', error);
      toast.add({
         severity: 'error',
         summary: t('common.error'),
         detail: t('bookings.errors.loadBookings'),
         life: 3000,
      });
   } finally {
      loading.value = false;
   }
};

const viewBooking = async (booking: Booking) => {
   try {
      const response = await api.get(`/bookings/${booking.id}`);
      selectedBooking.value = response.data;
      showBookingDialog.value = true;
   } catch (error) {
      console.error('Error loading booking details:', error);
   }
};

const confirmBooking = async (booking: Booking) => {
   try {
      await api.patch(`/bookings/${booking.id}`, { status: 'confirmed' });
      toast.add({
         severity: 'success',
         summary: 'Reserva Confirmada',
         detail: `La reserva ${booking.locator} ha sido confirmada`,
         life: 3000,
      });
      loadBookings();
   } catch (error) {
      console.error('Error confirming booking:', error);
      toast.add({
         severity: 'error',
         summary: 'Error',
         detail: 'No se pudo confirmar la reserva',
         life: 3000,
      });
   }
};

const cancelBooking = (booking: Booking) => {
   bookingToCancel.value = booking;
   cancelReason.value = '';
   showCancelDialog.value = true;
};

const closeCancelDialog = () => {
   showCancelDialog.value = false;
   bookingToCancel.value = null;
   cancelReason.value = '';
};

const processCancellation = async () => {
   if (!bookingToCancel.value || !cancelReason.value.trim()) {
      return;
   }

   try {
      await api.patch(`/bookings/${bookingToCancel.value.id}`, {
         status: 'cancelled',
         cancellation_reason: cancelReason.value.trim(),
      });
      toast.add({
         severity: 'success',
         summary: 'Reserva Cancelada',
         detail: `La reserva ${bookingToCancel.value.locator} ha sido cancelada`,
         life: 3000,
      });
      closeCancelDialog();
      loadBookings();
   } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.add({
         severity: 'error',
         summary: 'Error',
         detail: 'No se pudo cancelar la reserva',
         life: 3000,
      });
   }
};

const currentPage = ref(1);

const onPage = (event: any) => {
   currentPage.value = event.page + 1; // PrimeVue uses 0-based page index
   loadBookings();
};

onMounted(() => {
   loadBookings();
});
</script>

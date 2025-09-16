<template>
   <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
         <h2 class="text-2xl font-bold text-gray-900">
            {{ t('inventory.title') }}
         </h2>
         <div class="flex space-x-2">
            <Button
               icon="pi pi-upload"
               :label="t('inventory.importCSV')"
               @click="showImportDialog = true"
            />
            <Button
               icon="pi pi-refresh"
               :label="t('common.refresh')"
               @click="loadInventory"
               :loading="loading"
            />
         </div>
      </div>

      <!-- Filters -->
      <Card>
         <template #content>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div>
                  <label class="block text-sm font-medium mb-2">{{
                     t('inventory.from')
                  }}</label>
                  <Calendar v-model="filters.dateFrom" date-format="yy-mm-dd" />
               </div>
               <div>
                  <label class="block text-sm font-medium mb-2">{{
                     t('inventory.to')
                  }}</label>
                  <Calendar v-model="filters.dateTo" date-format="yy-mm-dd" />
               </div>
               <div>
                  <label class="block text-sm font-medium mb-2">{{
                     t('inventory.roomType')
                  }}</label>
                  <Dropdown
                     v-model="filters.roomType"
                     :options="roomTypes"
                     option-label="name"
                     option-value="id"
                     :placeholder="t('inventory.allRoomTypes')"
                     show-clear
                  />
               </div>
               <div class="flex items-end">
                  <Button :label="t('common.filter')" @click="loadInventory" />
               </div>
            </div>
         </template>
      </Card>

      <!-- Inventory Table -->
      <Card>
         <template #content>
            <DataTable
               :value="inventory"
               :loading="loading"
               paginator
               :rows="10"
               :total-records="totalRecords"
               lazy
               @page="onPage"
               responsive-layout="scroll"
               class="p-datatable-sm"
            >
               <Column field="date" :header="t('inventory.date')" sortable>
                  <template #body="{ data }">
                     {{ formatDate(data.date) }}
                  </template>
               </Column>
               <Column
                  field="room_type.name"
                  :header="t('inventory.room')"
                  sortable
               />
               <Column
                  field="rate_plan.name"
                  :header="t('inventory.rate')"
                  sortable
               />
               <Column
                  field="allotment"
                  :header="t('inventory.availability')"
                  sortable
               >
                  <template #body="{ data }">
                     <InputNumber
                        v-model="data.allotment"
                        :min="0"
                        :max="50"
                        @blur="updateInventoryItem(data)"
                        class="w-20"
                     />
                  </template>
               </Column>
               <Column
                  field="price_cents"
                  :header="t('inventory.price')"
                  sortable
               >
                  <template #body="{ data }">
                     <InputNumber
                        v-model="data.price_cents"
                        :min="0"
                        mode="currency"
                        currency="ARS"
                        locale="es-AR"
                        @blur="updateInventoryItem(data)"
                     />
                  </template>
               </Column>
               <Column field="is_closed" :header="t('inventory.status')">
                  <template #body="{ data }">
                     <Checkbox
                        v-model="data.is_closed"
                        :binary="true"
                        @change="updateInventoryItem(data)"
                     />
                     <span class="ml-2">{{
                        data.is_closed
                           ? t('inventory.closed')
                           : t('inventory.open')
                     }}</span>
                  </template>
               </Column>
            </DataTable>
         </template>
      </Card>

      <!-- Import CSV Dialog -->
      <Dialog
         v-model:visible="showImportDialog"
         header="Importar Inventario CSV"
         :modal="true"
         class="w-96"
      >
         <div class="space-y-4">
            <p class="text-sm text-gray-600">
               El archivo CSV debe contener las columnas: date, room_type_id,
               rate_plan_id, allotment, price_cents
            </p>
            <FileUpload
               mode="basic"
               accept=".csv"
               :max-file-size="1000000"
               @select="handleFileSelect"
               choose-label="Seleccionar CSV"
            />
            <div class="flex justify-end space-x-2">
               <Button
                  label="Cancelar"
                  text
                  @click="showImportDialog = false"
               />
               <Button
                  label="Importar"
                  @click="importCSV"
                  :disabled="!selectedFile"
               />
            </div>
         </div>
      </Dialog>
   </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from '@/composables/useI18n';
import api from '@/services/api';

const toast = useToast();
const { t } = useI18n();

const inventory = ref([]);
const roomTypes = ref([]);
const loading = ref(false);
const totalRecords = ref(0);
const showImportDialog = ref(false);
const selectedFile = ref<File | null>(null);

const filters = ref({
   dateFrom: new Date(),
   dateTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
   roomType: null,
});

const formatDate = (dateString: string) => {
   return new Date(dateString).toLocaleDateString('es-ES');
};

const formatDateForAPI = (date: any) => {
   // Handle different date formats
   if (typeof date === 'string') {
      // If it's already a string, try to parse and format it
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
         // If it's already in YYYY-MM-DD format, return as is
         return date;
      }
      return parsedDate.toISOString().split('T')[0];
   } else if (date instanceof Date) {
      // If it's a Date object, format it
      return date.toISOString().split('T')[0];
   } else {
      // Fallback: try to create a Date and format it
      const parsedDate = new Date(date);
      return parsedDate.toISOString().split('T')[0];
   }
};

const loadInventory = async () => {
   loading.value = true;
   try {
      const params: any = {
         page: currentPage.value,
         limit: 20,
      };

      if (filters.value.dateFrom) {
         params.date_from = filters.value.dateFrom.toISOString().split('T')[0];
      }
      if (filters.value.dateTo) {
         params.date_to = filters.value.dateTo.toISOString().split('T')[0];
      }
      if (filters.value.roomType) {
         params.room_type_id = filters.value.roomType;
      }

      const response = await api.get('/inventory', { params });
      inventory.value = response.data.data;
      totalRecords.value = response.data.pagination.total;
   } catch (error) {
      console.error('Error loading inventory:', error);
      toast.add({
         severity: 'error',
         summary: 'Error',
         detail: 'No se pudo cargar el inventario',
         life: 3000,
      });
   } finally {
      loading.value = false;
   }
};

const loadRoomTypes = async () => {
   try {
      const response = await api.get('/room-types');
      roomTypes.value = response.data.data;
   } catch (error) {
      console.error('Error loading room types:', error);
   }
};

const updateInventoryItem = async (item: any) => {
   try {
      // Ensure we have the correct data structure
      const inventoryItem = {
         date: formatDateForAPI(item.date), // Convert to YYYY-MM-DD format
         room_type_id: item.room_type_id,
         rate_plan_id: item.rate_plan_id,
         allotment: Number(item.allotment),
         price_cents: Number(item.price_cents),
         is_closed: Boolean(item.is_closed),
         min_stay: Number(item.min_stay) || 1,
         max_stay: Number(item.max_stay) || 30,
      };

      // Implement individual item update via bulk-upsert
      const updateData = {
         inventory: [inventoryItem],
      };

      await api.post('/inventory/bulk-upsert', updateData);

      toast.add({
         severity: 'success',
         summary: 'Actualizado',
         detail: 'Inventario actualizado exitosamente',
         life: 3000,
      });
   } catch (error: any) {
      console.error('Error updating inventory item:', error);
      console.error('Error response:', error.response?.data);

      // Show detailed error message
      const errorMessage =
         error.response?.data?.error ||
         error.response?.data?.message ||
         error.message ||
         'No se pudo actualizar el inventario';

      toast.add({
         severity: 'error',
         summary: 'Error de Validación',
         detail: errorMessage,
         life: 5000,
      });
      // Reload to reset changes
      loadInventory();
   }
};

const currentPage = ref(1);

const onPage = (event: any) => {
   currentPage.value = event.page + 1; // PrimeVue uses 0-based page index
   loadInventory();
};

const handleFileSelect = (event: any) => {
   selectedFile.value = event.files[0];
};

const importCSV = async () => {
   if (!selectedFile.value) return;

   const reader = new FileReader();
   reader.onload = async (e) => {
      try {
         const csvText = e.target?.result as string;
         const lines = csvText.split('\n').filter((line) => line.trim());

         if (lines.length < 2) {
            toast.add({
               severity: 'error',
               summary: 'Error',
               detail:
                  'El archivo CSV debe contener al menos una línea de datos',
               life: 3000,
            });
            return;
         }

         // Parse CSV headers
         const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
         const requiredHeaders = [
            'date',
            'room_type_id',
            'allotment',
            'price_cents',
         ];

         const missingHeaders = requiredHeaders.filter(
            (h) => !headers.includes(h)
         );
         if (missingHeaders.length > 0) {
            toast.add({
               severity: 'error',
               summary: 'Error',
               detail: `Faltan columnas requeridas: ${missingHeaders.join(
                  ', '
               )}`,
               life: 5000,
            });
            return;
         }

         // Parse data rows
         const items = [];
         for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map((v) => v.trim());
            if (values.length !== headers.length) continue;

            const item: any = {};
            headers.forEach((header, index) => {
               const value = values[index];
               switch (header) {
                  case 'date':
                     item.date = formatDateForAPI(value);
                     break;
                  case 'room_type_id':
                     item.room_type_id = value;
                     break;
                  case 'rate_plan_id':
                     item.rate_plan_id = value || null;
                     break;
                  case 'allotment':
                     item.allotment = parseInt(value) || 0;
                     break;
                  case 'price_cents':
                     item.price_cents = parseInt(value) || 0;
                     break;
                  case 'min_stay':
                     item.min_stay = parseInt(value) || 1;
                     break;
                  case 'max_stay':
                     item.max_stay = parseInt(value) || 30;
                     break;
                  case 'is_closed':
                     item.is_closed =
                        value.toLowerCase() === 'true' || value === '1';
                     break;
               }
            });

            // Validate required fields
            if (
               item.date &&
               item.room_type_id &&
               item.allotment !== undefined &&
               item.price_cents !== undefined
            ) {
               items.push(item);
            }
         }

         if (items.length === 0) {
            toast.add({
               severity: 'error',
               summary: 'Error',
               detail: 'No se encontraron filas válidas en el CSV',
               life: 3000,
            });
            return;
         }

         // Send bulk upsert request
         await api.post('/inventory/bulk-upsert', { inventory: items });

         toast.add({
            severity: 'success',
            summary: 'Importación Exitosa',
            detail: `Se importaron ${items.length} registros de inventario`,
            life: 5000,
         });

         // Reload inventory and close dialog
         loadInventory();
         showImportDialog.value = false;
         selectedFile.value = null;
      } catch (error) {
         console.error('Error importing CSV:', error);
         toast.add({
            severity: 'error',
            summary: 'Error de Importación',
            detail: 'No se pudo procesar el archivo CSV',
            life: 3000,
         });
      }
   };

   reader.readAsText(selectedFile.value);
};

onMounted(() => {
   loadInventory();
   loadRoomTypes();
});
</script>

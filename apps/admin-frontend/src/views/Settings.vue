<template>
   <div class="space-y-6">
      <!-- Header -->
      <div>
         <h2 class="text-2xl font-bold text-gray-900">
            {{ t('settings.title') }}
         </h2>
         <p class="text-gray-600">{{ t('settings.subtitle') }}</p>
      </div>

      <!-- Tenant Settings -->
      <Card>
         <template #title>
            <h3 class="text-lg font-semibold">{{ t('settings.hotelInfo') }}</h3>
         </template>
         <template #content>
            <form @submit.prevent="saveTenantSettings" class="space-y-6">
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label class="block text-sm font-medium mb-2">{{
                        t('settings.hotel.name')
                     }}</label>
                     <InputText
                        v-model="tenantForm.name"
                        class="w-full"
                        :placeholder="t('settings.hotel.name')"
                     />
                  </div>

                  <div>
                     <label class="block text-sm font-medium mb-2">{{
                        t('settings.hotel.slug')
                     }}</label>
                     <InputText
                        v-model="tenantForm.slug"
                        class="w-full"
                        placeholder="hotel-ejemplo"
                        disabled
                     />
                     <small class="text-gray-500">{{
                        t('settings.hotel.slugHelp')
                     }}</small>
                  </div>

                  <div>
                     <label class="block text-sm font-medium mb-2">{{
                        t('settings.hotel.primaryColor')
                     }}</label>
                     <div class="space-y-3">
                        <!-- Color Picker -->
                        <div class="flex items-center space-x-3">
                           <ColorPicker
                              v-model="tenantForm.brand_primary"
                              format="hex"
                              :inline="false"
                              class="w-full"
                           />
                        </div>

                        <!-- Preview and Current Value -->
                        <div
                           class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                           <div class="flex items-center space-x-3">
                              <div
                                 class="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                                 :style="{
                                    backgroundColor: tenantForm.brand_primary,
                                 }"
                              ></div>
                              <div>
                                 <p class="text-sm font-medium text-gray-900">
                                    Color actual
                                 </p>
                                 <p class="text-xs text-gray-500 font-mono">
                                    {{ tenantForm.brand_primary }}
                                 </p>
                              </div>
                           </div>

                           <!-- Preset Colors -->
                           <div class="flex items-center space-x-2">
                              <span class="text-xs text-gray-500"
                                 >Presets:</span
                              >
                              <div class="flex space-x-1">
                                 <button
                                    v-for="preset in colorPresets"
                                    :key="preset"
                                    @click="tenantForm.brand_primary = preset"
                                    class="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors"
                                    :style="{ backgroundColor: preset }"
                                    :title="preset"
                                 ></button>
                              </div>
                           </div>
                        </div>

                        <!-- Color Preview on Elements -->
                        <div class="p-3 bg-gray-50 rounded-lg">
                           <p class="text-xs text-gray-500 mb-2">
                              Vista previa:
                           </p>
                           <div class="flex items-center space-x-3">
                              <div class="flex space-x-2">
                                 <div
                                    class="px-3 py-1 rounded text-white text-sm font-medium"
                                    :style="{
                                       backgroundColor:
                                          tenantForm.brand_primary,
                                    }"
                                 >
                                    Botón
                                 </div>
                                 <div
                                    class="px-3 py-1 rounded border text-sm font-medium"
                                    :style="{
                                       borderColor: tenantForm.brand_primary,
                                       color: tenantForm.brand_primary,
                                    }"
                                 >
                                    Outline
                                 </div>
                              </div>
                              <div
                                 class="w-4 h-4 rounded-full"
                                 :style="{
                                    backgroundColor: tenantForm.brand_primary,
                                 }"
                              ></div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div>
                     <label class="block text-sm font-medium mb-2"
                        >Moneda</label
                     >
                     <Dropdown
                        v-model="tenantForm.currency"
                        :options="currencyOptions"
                        option-label="label"
                        option-value="value"
                        class="w-full"
                     />
                  </div>

                  <div>
                     <label class="block text-sm font-medium mb-2"
                        >Zona Horaria</label
                     >
                     <Dropdown
                        v-model="tenantForm.timezone"
                        :options="timezoneOptions"
                        option-label="label"
                        option-value="value"
                        class="w-full"
                        filter
                     />
                  </div>

                  <div>
                     <label class="block text-sm font-medium mb-2">{{
                        t('languages.selectLanguage')
                     }}</label>
                     <Dropdown
                        v-model="selectedLanguage"
                        :options="availableLocales"
                        option-label="name"
                        option-value="code"
                        class="w-full"
                        placeholder="Seleccionar idioma"
                        @change="handleLanguageChange"
                     />
                  </div>

                  <div>
                     <label class="block text-sm font-medium mb-2"
                        >Logo del Hotel</label
                     >
                     <div class="space-y-3">
                        <div
                           v-if="tenantForm.brand_logo"
                           class="flex items-center space-x-3"
                        >
                           <img
                              :src="tenantForm.brand_logo"
                              alt="Logo actual"
                              class="w-16 h-16 object-contain border rounded"
                           />
                           <Button
                              icon="pi pi-trash"
                              class="p-button-sm p-button-text p-button-danger"
                              @click="tenantForm.brand_logo = null"
                           />
                        </div>
                        <FileUpload
                           mode="basic"
                           accept="image/*"
                           :max-file-size="1000000"
                           @select="handleLogoUpload"
                           choose-label="Subir Logo"
                           class="p-button-outlined"
                        />
                        <small class="text-gray-500"
                           >Máximo 1MB. Formatos: JPG, PNG, SVG</small
                        >
                     </div>
                  </div>
               </div>

               <div class="flex justify-end space-x-3">
                  <Button
                     :label="t('common.cancel')"
                     class="p-button-text"
                     @click="resetForm"
                  />
                  <Button
                     type="submit"
                     :label="t('common.save')"
                     :loading="savingTenant"
                  />
               </div>
            </form>
         </template>
      </Card>

      <!-- User Settings -->
      <Card>
         <template #title>
            <h3 class="text-lg font-semibold">{{ t('settings.myProfile') }}</h3>
         </template>
         <template #content>
            <form @submit.prevent="saveUserSettings" class="space-y-6">
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label class="block text-sm font-medium mb-2"
                        >Nombre</label
                     >
                     <InputText
                        v-model="userForm.name"
                        class="w-full"
                        placeholder="Tu nombre"
                     />
                  </div>

                  <div>
                     <label class="block text-sm font-medium mb-2">Email</label>
                     <InputText
                        v-model="userForm.email"
                        type="email"
                        class="w-full"
                        disabled
                     />
                     <small class="text-gray-500"
                        >El email no se puede modificar</small
                     >
                  </div>

                  <div>
                     <label class="block text-sm font-medium mb-2"
                        >Nueva Contraseña</label
                     >
                     <Password
                        v-model="userForm.newPassword"
                        class="w-full"
                        placeholder="Dejar vacío para no cambiar"
                        :feedback="false"
                        toggle-mask
                     />
                  </div>

                  <div>
                     <label class="block text-sm font-medium mb-2"
                        >Confirmar Contraseña</label
                     >
                     <Password
                        v-model="userForm.confirmPassword"
                        class="w-full"
                        placeholder="Confirmar nueva contraseña"
                        :feedback="false"
                        toggle-mask
                     />
                  </div>
               </div>

               <div class="flex justify-end space-x-3">
                  <Button
                     label="Cancelar"
                     class="p-button-text"
                     @click="resetUserForm"
                  />
                  <Button
                     type="submit"
                     label="Guardar Perfil"
                     :loading="savingUser"
                  />
               </div>
            </form>
         </template>
      </Card>

      <!-- Danger Zone -->
      <Card>
         <template #title>
            <h3 class="text-lg font-semibold text-red-600">
               {{ t('settings.dangerZone') }}
            </h3>
         </template>
         <template #content>
            <div class="space-y-4">
               <p class="text-gray-600">
                  Estas acciones son irreversibles. Procede con precaución.
               </p>

               <div class="flex space-x-4">
                  <Button
                     label="Resetear Datos de Prueba"
                     class="p-button-outlined p-button-danger"
                     @click="resetTestData"
                     :loading="resettingData"
                  />

                  <Button
                     label="Exportar Datos"
                     class="p-button-outlined"
                     @click="exportData"
                     :loading="exportingData"
                  />
               </div>
            </div>
         </template>
      </Card>
   </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useI18n } from '@/composables/useI18n';
import api from '@/services/api';

const authStore = useAuthStore();
const toast = useToast();
const confirm = useConfirm();
const { t, changeLanguage, availableLocales } = useI18n();

const user = computed(() => authStore.user);

const tenantForm = ref({
   name: '',
   slug: '',
   brand_primary: '',
   brand_logo: null,
   currency: 'ARS',
   timezone: 'America/Argentina/Buenos_Aires',
});

const userForm = ref({
   name: '',
   email: '',
   newPassword: '',
   confirmPassword: '',
});

const savingTenant = ref(false);
const savingUser = ref(false);
const resettingData = ref(false);
const exportingData = ref(false);
const selectedLanguage = ref('es');

const currencyOptions = [
   { label: 'Peso Argentino (ARS)', value: 'ARS' },
   { label: 'Dólar Estadounidense (USD)', value: 'USD' },
   { label: 'Euro (EUR)', value: 'EUR' },
   { label: 'Real Brasileño (BRL)', value: 'BRL' },
];

const timezoneOptions = [
   {
      label: 'Argentina - Buenos Aires',
      value: 'America/Argentina/Buenos_Aires',
   },
   { label: 'Chile - Santiago', value: 'America/Santiago' },
   { label: 'Brasil - São Paulo', value: 'America/Sao_Paulo' },
   { label: 'México - Ciudad de México', value: 'America/Mexico_City' },
   { label: 'Colombia - Bogotá', value: 'America/Bogota' },
   { label: 'España - Madrid', value: 'Europe/Madrid' },
];

const colorPresets = [
   '#0EA5E9', // Sky Blue (default)
   '#3B82F6', // Blue
   '#8B5CF6', // Purple
   '#EC4899', // Pink
   '#EF4444', // Red
   '#F59E0B', // Amber
   '#10B981', // Emerald
   '#06B6D4', // Cyan
   '#84CC16', // Lime
   '#F97316', // Orange
   '#6366F1', // Indigo
   '#14B8A6', // Teal
];

const initializeForms = () => {
   if (user.value) {
      // Load saved tenant settings from localStorage
      const savedSettings = localStorage.getItem('tenant_settings');
      let tenantSettings = {};
      if (savedSettings) {
         try {
            tenantSettings = JSON.parse(savedSettings);
         } catch (e) {
            console.warn('Error parsing saved tenant settings');
         }
      }

      // Tenant form
      tenantForm.value = {
         name: user.value.tenant.name || '',
         slug: user.value.tenant.slug || '',
         brand_primary: (tenantSettings as any).brand_primary || '#0EA5E9',
         brand_logo: (tenantSettings as any).brand_logo || null,
         currency: (tenantSettings as any).currency || 'ARS',
         timezone:
            (tenantSettings as any).timezone ||
            'America/Argentina/Buenos_Aires',
      };

      // Apply saved color theme
      if ((tenantSettings as any).brand_primary) {
         applyColorTheme((tenantSettings as any).brand_primary);
      }

      // User form
      userForm.value = {
         name: user.value.name || '',
         email: user.value.email || '',
         newPassword: '',
         confirmPassword: '',
      };

      // Initialize selected language from tenant settings or localStorage
      const savedLanguage =
         (tenantSettings as any).language ||
         localStorage.getItem('app-locale') ||
         'es';
      selectedLanguage.value = savedLanguage;
   }
};

const saveTenantSettings = async () => {
   savingTenant.value = true;
   try {
      const updateData = {
         name: tenantForm.value.name,
         brand_primary: tenantForm.value.brand_primary,
         brand_logo: tenantForm.value.brand_logo,
         currency: tenantForm.value.currency,
         timezone: tenantForm.value.timezone,
         language: selectedLanguage.value,
      };

      // Update via API
      await api.patch('/tenant', updateData);

      // Save to localStorage for theming persistence
      localStorage.setItem('tenant_settings', JSON.stringify(updateData));

      // Apply color theme immediately
      applyColorTheme(tenantForm.value.brand_primary);

      toast.add({
         severity: 'success',
         summary: 'Configuración Guardada',
         detail: 'La configuración del hotel se guardó exitosamente',
         life: 3000,
      });

      // Update user in auth store to reflect changes
      await authStore.fetchMe();
   } catch (error: any) {
      console.error('Error saving tenant settings:', error);
      toast.add({
         severity: 'error',
         summary: 'Error',
         detail: error.message || 'No se pudo guardar la configuración',
         life: 3000,
      });
   } finally {
      savingTenant.value = false;
   }
};

const saveUserSettings = async () => {
   if (
      userForm.value.newPassword &&
      userForm.value.newPassword !== userForm.value.confirmPassword
   ) {
      toast.add({
         severity: 'error',
         summary: 'Error',
         detail: 'Las contraseñas no coinciden',
         life: 3000,
      });
      return;
   }

   savingUser.value = true;
   try {
      const updateData: any = {
         name: userForm.value.name,
      };

      // Only include password if it's being changed
      if (userForm.value.newPassword) {
         updateData.password = userForm.value.newPassword;
      }

      // Update user profile via API
      await api.patch('/auth/profile', updateData);

      // Update user in auth store
      await authStore.fetchMe();

      // Clear password fields
      userForm.value.newPassword = '';
      userForm.value.confirmPassword = '';

      toast.add({
         severity: 'success',
         summary: 'Perfil Actualizado',
         detail: 'Tu perfil se actualizó exitosamente',
         life: 3000,
      });
   } catch (error: any) {
      console.error('Error saving user settings:', error);
      toast.add({
         severity: 'error',
         summary: 'Error',
         detail: error.message || 'No se pudo actualizar el perfil',
         life: 3000,
      });
   } finally {
      savingUser.value = false;
   }
};

const resetForm = () => {
   initializeForms();
};

const resetUserForm = () => {
   initializeForms();
};

// Apply color theme immediately when color changes
const applyColorTheme = (color: string) => {
   // Convert hex to RGB for color mixing
   const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
         ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
           }
         : null;
   };

   const rgb = hexToRgb(color);
   if (rgb) {
      // Set primary color
      document.documentElement.style.setProperty('--primary-color', color);

      // Calculate light variant (10% opacity)
      document.documentElement.style.setProperty(
         '--primary-color-light',
         `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`
      );

      // Calculate dark variant (darker shade)
      const darkR = Math.max(0, rgb.r - 30);
      const darkG = Math.max(0, rgb.g - 30);
      const darkB = Math.max(0, rgb.b - 30);
      document.documentElement.style.setProperty(
         '--primary-color-dark',
         `rgb(${darkR}, ${darkG}, ${darkB})`
      );
   }
};

const handleLogoUpload = (event: any) => {
   const file = event.files[0];
   if (file) {
      // TODO: Implement file upload
      toast.add({
         severity: 'info',
         summary: 'Próximamente',
         detail: 'Subida de archivos en desarrollo',
         life: 3000,
      });
   }
};

const handleLanguageChange = (event: any) => {
   // Cambiar el idioma inmediatamente cuando se selecciona
   selectedLanguage.value = event.value;
   changeLanguage(event.value);

   const languageName = availableLocales.find(
      (l) => l.code === event.value
   )?.name;

   toast.add({
      severity: 'info',
      summary: 'Idioma Cambiado',
      detail: `Idioma cambiado a ${languageName}`,
      life: 2000,
   });
};

const resetTestData = () => {
   confirm.require({
      message:
         '¿Está seguro de resetear todos los datos de prueba? Esta acción no se puede deshacer.',
      header: 'Confirmar Reset',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
         resettingData.value = true;
         try {
            // Call the seed endpoint to reset data
            const response = await api.post('/seed/reset');

            toast.add({
               severity: 'success',
               summary: 'Datos Reseteados',
               detail: `Se resetearon exitosamente: ${response.data.room_types} tipos de habitación, ${response.data.rate_plans} tarifas, ${response.data.inventory_items} registros de inventario`,
               life: 5000,
            });
         } catch (error: any) {
            console.error('Error resetting data:', error);
            toast.add({
               severity: 'error',
               summary: 'Error',
               detail: error.message || 'No se pudieron resetear los datos',
               life: 3000,
            });
         } finally {
            resettingData.value = false;
         }
      },
   });
};

const exportData = async () => {
   exportingData.value = true;
   try {
      // Export bookings, inventory, and other data
      const [bookingsRes, inventoryRes, roomTypesRes] = await Promise.all([
         api.get('/bookings', { params: { limit: 1000 } }),
         api.get('/inventory', { params: { limit: 1000 } }),
         api.get('/room-types'),
      ]);

      const exportData = {
         tenant: user.value?.tenant,
         bookings: bookingsRes.data.data,
         inventory: inventoryRes.data.data,
         roomTypes: roomTypesRes.data.data,
         exportDate: new Date().toISOString(),
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `export-${user.value?.tenant.slug}-${
         new Date().toISOString().split('T')[0]
      }.json`;
      link.click();

      toast.add({
         severity: 'success',
         summary: 'Exportación Exitosa',
         detail: 'Los datos se exportaron correctamente',
         life: 3000,
      });
   } catch (error) {
      console.error('Error exporting data:', error);
      toast.add({
         severity: 'error',
         summary: 'Error',
         detail: 'No se pudieron exportar los datos',
         life: 3000,
      });
   } finally {
      exportingData.value = false;
   }
};

// Watch for color changes and apply theme immediately
watch(
   () => tenantForm.value.brand_primary,
   (newColor) => {
      if (newColor) {
         applyColorTheme(newColor);
      }
   }
);

onMounted(() => {
   initializeForms();
});
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

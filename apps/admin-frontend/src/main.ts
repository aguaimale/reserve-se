import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import i18n from './i18n';

// PrimeIcons
import 'primeicons/primeicons.css';

import App from './App.vue';
import './style.css';

// PrimeVue components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import ConfirmDialog from 'primevue/confirmdialog';
import ConfirmationService from 'primevue/confirmationservice';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import FileUpload from 'primevue/fileupload';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';
import Toolbar from 'primevue/toolbar';
import SplitButton from 'primevue/splitbutton';
import Menu from 'primevue/menu';
import Sidebar from 'primevue/sidebar';
import ColorPicker from 'primevue/colorpicker';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(PrimeVue, {
   theme: {
      preset: Aura,
      options: {
         prefix: 'p',
         darkModeSelector: 'system',
         cssLayer: false,
      },
   },
});
app.use(ToastService);
app.use(ConfirmationService);

// Register PrimeVue components globally
app.component('Button', Button);
app.component('InputText', InputText);
app.component('Password', Password);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Card', Card);
app.component('Toast', Toast);
app.component('ConfirmDialog', ConfirmDialog);
app.component('Dialog', Dialog);
app.component('Dropdown', Dropdown);
app.component('Calendar', Calendar);
app.component('FileUpload', FileUpload);
app.component('InputNumber', InputNumber);
app.component('Checkbox', Checkbox);
app.component('ProgressSpinner', ProgressSpinner);
app.component('Tag', Tag);
app.component('Toolbar', Toolbar);
app.component('SplitButton', SplitButton);
app.component('Menu', Menu);
app.component('Sidebar', Sidebar);
app.component('ColorPicker', ColorPicker);

app.mount('#app');

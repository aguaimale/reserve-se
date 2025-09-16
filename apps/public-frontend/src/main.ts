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
import Card from 'primevue/card';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';

const app = createApp(App);

app.use(createPinia());
app.use(router);
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
app.use(i18n);

// Register PrimeVue components globally
app.component('Button', Button);
app.component('Card', Card);
app.component('Toast', Toast);

app.mount('#app');

import { createI18n } from 'vue-i18n';
import es from './locales/es.json';
import en from './locales/en.json';
import pt from './locales/pt.json';

// Detectar idioma del navegador o usar español por defecto
const getDefaultLocale = () => {
   const browserLocale = navigator.language.split('-')[0];
   if (['es', 'en', 'pt'].includes(browserLocale)) {
      return browserLocale;
   }
   return 'es'; // Español por defecto
};

const i18n = createI18n({
   legacy: false, // Usar Composition API
   locale: getDefaultLocale(),
   fallbackLocale: 'es',
   messages: {
      es,
      en,
      pt,
   },
});

export default i18n;

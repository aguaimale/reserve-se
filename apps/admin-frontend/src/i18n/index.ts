import { createI18n } from 'vue-i18n';
import es from './locales/es.json';
import en from './locales/en.json';
import pt from './locales/pt.json';

// Detectar idioma del navegador o usar español por defecto
const getDefaultLocale = () => {
   // Primero verificar si hay configuración guardada del tenant
   const tenantSettings = localStorage.getItem('tenant_settings');
   if (tenantSettings) {
      try {
         const settings = JSON.parse(tenantSettings);
         if (
            settings.language &&
            ['es', 'en', 'pt'].includes(settings.language)
         ) {
            return settings.language;
         }
      } catch (e) {
         console.warn('Error parsing tenant settings');
      }
   }

   // Luego verificar localStorage
   const savedLocale = localStorage.getItem('app-locale');
   if (savedLocale && ['es', 'en', 'pt'].includes(savedLocale)) {
      return savedLocale;
   }

   // Finalmente usar idioma del navegador
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

// Función para cambiar idioma
export const setLocale = (locale: string) => {
   if (['es', 'en', 'pt'].includes(locale)) {
      i18n.global.locale.value = locale as 'es' | 'en' | 'pt';
      localStorage.setItem('app-locale', locale);

      // También guardar en la configuración del tenant
      const tenantSettings = localStorage.getItem('tenant_settings');
      let settings = {};
      if (tenantSettings) {
         try {
            settings = JSON.parse(tenantSettings);
         } catch (e) {
            console.warn('Error parsing tenant settings');
         }
      }
      settings = { ...settings, language: locale };
      localStorage.setItem('tenant_settings', JSON.stringify(settings));

      // Actualizar atributo lang del HTML
      document.documentElement.lang = locale;
   }
};

// Función para obtener idioma actual
export const getCurrentLocale = () => {
   return i18n.global.locale.value;
};

// Función para obtener idiomas disponibles
export const getAvailableLocales = () => {
   return [
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'pt', name: 'Português', flag: '🇧🇷' },
   ];
};

export default i18n;

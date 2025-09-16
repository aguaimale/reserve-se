import { createI18n } from 'vue-i18n';
import es from './locales/es.json';
import en from './locales/en.json';
import pt from './locales/pt.json';

// Función para crear instancia de i18n
export const createWidgetI18n = (locale: string = 'es') => {
   return createI18n({
      legacy: false, // Usar Composition API
      locale: locale,
      fallbackLocale: 'es',
      messages: {
         es,
         en,
         pt,
      },
   });
};

// Función para obtener idiomas disponibles
export const getAvailableLocales = () => {
   return [
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'pt', name: 'Português', flag: '🇧🇷' },
   ];
};

// Función para validar idioma
export const isValidLocale = (locale: string): locale is 'es' | 'en' | 'pt' => {
   return ['es', 'en', 'pt'].includes(locale);
};

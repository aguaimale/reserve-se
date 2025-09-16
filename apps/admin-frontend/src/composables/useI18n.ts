import { useI18n as useVueI18n } from 'vue-i18n';
import { setLocale, getCurrentLocale, getAvailableLocales } from '@/i18n';

export const useI18n = () => {
   const { t, locale } = useVueI18n();

   // Función para cambiar idioma
   const changeLanguage = (newLocale: string) => {
      setLocale(newLocale);
      locale.value = newLocale;
   };

   // Función para obtener traducción con parámetros
   const translate = (key: string, params?: Record<string, unknown>) => {
      try {
         return t(key, params || {});
      } catch (error) {
         console.warn(`Translation key not found: ${key}`);
         return key;
      }
   };

   // Función para traducciones plurales
   const translatePlural = (
      key: string,
      count: number,
      params?: Record<string, unknown>
   ) => {
      try {
         if (count === 1) {
            return t(key, params || {});
         } else {
            return t(`${key}_plural`, params || {});
         }
      } catch (error) {
         console.warn(`Translation key not found: ${key}`);
         return key;
      }
   };

   return {
      t: translate,
      tPlural: translatePlural,
      locale: getCurrentLocale(),
      availableLocales: getAvailableLocales(),
      changeLanguage,
   };
};

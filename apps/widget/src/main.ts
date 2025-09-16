import { createApp } from 'vue';
import App from './App.vue';
import './style.css';
import { createWidgetI18n, isValidLocale } from './i18n';

interface WidgetOptions {
   tenant?: string;
   language?: string;
   primaryColor?: string;
}

interface WidgetConfig {
   tenant: string;
   language: string;
   primaryColor: string;
}

// Función para leer dataset del script
function getScriptConfig(): WidgetConfig {
   const script = document.querySelector(
      'script[src*="booking-widget"]'
   ) as HTMLScriptElement;

   return {
      tenant: script?.dataset.tenant || 'default',
      language: script?.dataset.language || 'es',
      primaryColor: script?.dataset.primary || '#0EA5E9',
   };
}

// Función para inyectar CSS variables de theming
function injectThemeVariables(primaryColor: string) {
   const root = document.documentElement;
   root.style.setProperty('--color-primary', primaryColor);
   root.style.setProperty(
      '--color-primary-hover',
      adjustBrightness(primaryColor, -10)
   );
   root.style.setProperty(
      '--color-primary-light',
      adjustBrightness(primaryColor, 20)
   );
   root.style.setProperty('--radius', '8px');
}

// Función auxiliar para ajustar brillo del color
function adjustBrightness(hex: string, percent: number): string {
   const num = parseInt(hex.replace('#', ''), 16);
   const amt = Math.round(2.55 * percent);
   const R = (num >> 16) + amt;
   const G = ((num >> 8) & 0x00ff) + amt;
   const B = (num & 0x0000ff) + amt;

   return (
      '#' +
      (
         0x1000000 +
         (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
         (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
         (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
         .toString(16)
         .slice(1)
   );
}

// Función principal para montar el widget
export function mountWidget(selector: string, options: WidgetOptions = {}) {
   const element = document.querySelector(selector);
   if (!element) {
      console.error(`BookingWidget: Element not found: ${selector}`);
      return;
   }

   const config = getScriptConfig();
   const finalConfig = {
      ...config,
      ...options,
   };

   // Validate and set language
   const language = isValidLocale(finalConfig.language)
      ? finalConfig.language
      : 'es';

   // Aplicar theming
   injectThemeVariables(finalConfig.primaryColor);

   // Crear y montar la app Vue
   const app = createApp(App, {
      config: finalConfig,
   });

   // Setup i18n
   const i18n = createWidgetI18n(language);
   app.use(i18n);

   app.mount(element);

   return app;
}

// Exportar globalmente para uso UMD
if (typeof window !== 'undefined') {
   (window as any).BookingWidget = {
      mountWidget,
   };
}

# 🌍 Internacionalización del Widget - Reserve-SE

Este documento explica cómo usar el sistema de internacionalización en el widget de reservas.

## 📋 Idiomas Soportados

-  **Español (es)** - Idioma por defecto
-  **Inglés (en)** - English
-  **Portugués (pt)** - Português

## 🚀 Uso Básico

### 1. Configuración del Widget

```html
<script
   src="booking-widget.js"
   data-tenant="hotel-luna"
   data-language="es"
   data-primary="#0EA5E9"
></script>
<div id="booking-widget"></div>
<script>
   BookingWidget.mountWidget('#booking-widget');
</script>
```

### 2. Cambiar idioma programáticamente

```javascript
// Montar widget con idioma específico
BookingWidget.mountWidget('#booking-widget', {
   tenant: 'hotel-luna',
   language: 'en', // 'es', 'en', 'pt'
   primaryColor: '#0EA5E9',
});
```

### 3. Cambiar idioma dinámicamente

```javascript
// Remontar widget con nuevo idioma
const widget = BookingWidget.mountWidget('#booking-widget', {
   tenant: 'hotel-luna',
   language: 'pt',
   primaryColor: '#0EA5E9',
});

// Para cambiar idioma, desmontar y volver a montar
widget.unmount();
const newWidget = BookingWidget.mountWidget('#booking-widget', {
   tenant: 'hotel-luna',
   language: 'en',
   primaryColor: '#0EA5E9',
});
```

## 🎯 Claves de Traducción

### Estructura por Pantallas

```json
{
   "home": {
      "title": "Reservar Habitación",
      "checkin": "Fecha de entrada",
      "checkout": "Fecha de salida",
      "guests": "Huéspedes",
      "search": "Buscar disponibilidad"
   },
   "results": {
      "title": "Habitaciones Disponibles",
      "noResults": "No hay habitaciones disponibles",
      "selectRoom": "Seleccionar habitación"
   },
   "guest": {
      "title": "Información del Huésped",
      "firstName": "Nombre",
      "lastName": "Apellido",
      "email": "Email"
   },
   "confirmation": {
      "title": "¡Reserva Confirmada!",
      "locator": "Código de reserva",
      "bookingDetails": "Detalles de la reserva"
   }
}
```

## 🔧 Desarrollo

### Agregar Nuevas Traducciones

1. **Agregar clave en español (es.json)**

```json
{
   "nuevaSeccion": {
      "nuevaClave": "Texto en español"
   }
}
```

2. **Agregar traducciones en otros idiomas**

```json
// en.json
{
  "nuevaSeccion": {
    "nuevaClave": "Text in English"
  }
}

// pt.json
{
  "nuevaSeccion": {
    "nuevaClave": "Texto em português"
  }
}
```

3. **Usar en el componente**

```vue
<template>
   <div>{{ t('nuevaSeccion.nuevaClave') }}</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>
```

### Validación de Idioma

```typescript
import { isValidLocale } from './i18n';

const language = 'en';
if (isValidLocale(language)) {
   // Idioma válido
   console.log('Idioma soportado:', language);
} else {
   // Usar español por defecto
   console.log('Idioma no soportado, usando español');
}
```

## 📁 Estructura de Archivos

```
src/i18n/
├── index.ts              # Configuración principal
├── locales/
│   ├── es.json          # Traducciones en español
│   ├── en.json          # Traducciones en inglés
│   └── pt.json          # Traducciones en portugués
└── README.md            # Esta documentación
```

## 🎨 Integración con Temas

El widget respeta el idioma configurado independientemente del tema:

```javascript
// Widget en español con tema azul
BookingWidget.mountWidget('#widget1', {
   tenant: 'hotel-luna',
   language: 'es',
   primaryColor: '#0EA5E9',
});

// Widget en inglés con tema verde
BookingWidget.mountWidget('#widget2', {
   tenant: 'hotel-sol',
   language: 'en',
   primaryColor: '#10B981',
});
```

## 🔍 Debugging

Para debuggear traducciones:

1. **Verificar idioma configurado**

```javascript
console.log('Idioma actual:', widget.config.language);
```

2. **Comprobar claves existentes**

```javascript
// En el navegador, inspeccionar el objeto i18n
console.log(window.BookingWidget._i18n.global.messages);
```

3. **Validar formato de fechas**

```javascript
// Las fechas se formatean según el idioma
const date = new Date();
console.log(date.toLocaleDateString('es-ES')); // 15/12/2024
console.log(date.toLocaleDateString('en-US')); // 12/15/2024
console.log(date.toLocaleDateString('pt-BR')); // 15/12/2024
```

## 📝 Mejores Prácticas

1. **Usar claves descriptivas**: `home.checkin` en lugar de `checkin`
2. **Agrupar por pantalla**: Todas las claves de una pantalla juntas
3. **Mantener consistencia**: Misma estructura en todos los idiomas
4. **Usar parámetros**: Para textos dinámicos con `{variable}`
5. **Plurales**: Usar `_plural` para formas plurales
6. **Validar**: Siempre agregar la clave en los 3 idiomas

## 🌐 Detección Automática

El widget puede detectar automáticamente el idioma del navegador:

```javascript
// Detectar idioma del navegador
const browserLanguage = navigator.language.split('-')[0];
const supportedLanguages = ['es', 'en', 'pt'];
const language = supportedLanguages.includes(browserLanguage)
   ? browserLanguage
   : 'es'; // Fallback a español

BookingWidget.mountWidget('#booking-widget', {
   tenant: 'hotel-luna',
   language: language,
   primaryColor: '#0EA5E9',
});
```

## 🚀 Ejemplos

### Ejemplo Básico

```html
<!DOCTYPE html>
<html>
   <head>
      <title>Widget Multi-idioma</title>
   </head>
   <body>
      <div id="booking-widget"></div>

      <script src="booking-widget.js"></script>
      <script>
         BookingWidget.mountWidget('#booking-widget', {
            tenant: 'hotel-luna',
            language: 'en',
            primaryColor: '#0EA5E9',
         });
      </script>
   </body>
</html>
```

### Ejemplo con Selector de Idioma

```html
<!DOCTYPE html>
<html>
   <head>
      <title>Widget con Selector</title>
   </head>
   <body>
      <select id="language-selector">
         <option value="es">Español</option>
         <option value="en">English</option>
         <option value="pt">Português</option>
      </select>

      <div id="booking-widget"></div>

      <script src="booking-widget.js"></script>
      <script>
         let widget = null;

         function mountWidget(language) {
            if (widget) widget.unmount();

            widget = BookingWidget.mountWidget('#booking-widget', {
               tenant: 'hotel-luna',
               language: language,
               primaryColor: '#0EA5E9',
            });
         }

         // Montar inicialmente
         mountWidget('es');

         // Cambiar idioma
         document
            .getElementById('language-selector')
            .addEventListener('change', (e) => {
               mountWidget(e.target.value);
            });
      </script>
   </body>
</html>
```

## 🔮 Próximas Mejoras

-  [ ] Lazy loading de traducciones
-  [ ] Validación automática de claves faltantes
-  [ ] Herramientas de desarrollo para traducciones
-  [ ] Integración con servicios de traducción
-  [ ] Soporte para RTL (Right-to-Left)
-  [ ] Formateo automático de fechas y números por región

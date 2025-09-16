# 🌍 Internacionalización (i18n) - Reserve-SE

Este documento explica cómo usar el sistema de internacionalización implementado en el admin-frontend.

## 📋 Idiomas Soportados

-  **Español (es)** - Idioma por defecto
-  **Inglés (en)** - English
-  **Portugués (pt)** - Português

## 🚀 Uso Básico

### 1. Importar el composable

```typescript
import { useI18n } from '@/composables/useI18n';

const { t, changeLanguage, availableLocales } = useI18n();
```

### 2. Usar traducciones en templates

```vue
<template>
   <div>
      <h1>{{ t('common.loading') }}</h1>
      <button>{{ t('common.save') }}</button>
   </div>
</template>
```

### 3. Usar traducciones con parámetros

```vue
<template>
   <div>
      <h1>{{ t('dashboard.welcome', { name: user.name }) }}</h1>
      <p>{{ t('dashboard.subtitle', { hotel: user.tenant.name }) }}</p>
   </div>
</template>
```

### 4. Usar traducciones plurales

```typescript
const { tPlural } = useI18n();

// Para 1 elemento
tPlural('dashboard.nights', 1); // "noche"

// Para múltiples elementos
tPlural('dashboard.nights', 5); // "noches"
```

## 🔧 Cambiar Idioma

### Desde la configuración

El selector de idioma está disponible en la vista de configuración y cambia el idioma globalmente.

### Programáticamente

```typescript
const { changeLanguage } = useI18n();

// Cambiar a inglés
changeLanguage('en');

// Cambiar a portugués
changeLanguage('pt');

// Cambiar a español
changeLanguage('es');
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

## 🎯 Claves de Traducción

### Estructura Jerárquica

Las claves están organizadas jerárquicamente por funcionalidad:

```json
{
   "common": {
      "loading": "Cargando...",
      "save": "Guardar",
      "cancel": "Cancelar"
   },
   "navigation": {
      "dashboard": "Dashboard",
      "inventory": "Inventario",
      "bookings": "Reservas"
   },
   "auth": {
      "login": "Iniciar Sesión",
      "logout": "Cerrar Sesión"
   }
}
```

### Convenciones de Nomenclatura

-  **common**: Elementos comunes (botones, estados, etc.)
-  **navigation**: Elementos de navegación
-  **auth**: Autenticación y login
-  **dashboard**: Dashboard y KPIs
-  **inventory**: Gestión de inventario
-  **bookings**: Gestión de reservas
-  **settings**: Configuración
-  **errors**: Mensajes de error
-  **confirmations**: Confirmaciones y diálogos

## 🔄 Agregar Nuevas Traducciones

### 1. Agregar clave en español (es.json)

```json
{
   "nuevaSeccion": {
      "nuevaClave": "Texto en español"
   }
}
```

### 2. Agregar traducciones en otros idiomas

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

### 3. Usar en el componente

```vue
<template>
   <div>{{ t('nuevaSeccion.nuevaClave') }}</div>
</template>
```

## 🌐 Detección Automática de Idioma

El sistema detecta automáticamente el idioma del navegador y lo usa como idioma por defecto si está soportado. Si no, usa español como fallback.

### Orden de Prioridad

1. Idioma guardado en localStorage (`app-locale`)
2. Idioma del navegador
3. Español (fallback)

## 💾 Persistencia

El idioma seleccionado se guarda en `localStorage` con la clave `app-locale` y se restaura automáticamente en la siguiente sesión.

## 🎨 Integración con PrimeVue

El sistema está completamente integrado con PrimeVue y todos los componentes usan las traducciones automáticamente.

## 🔍 Debugging

Para debuggear traducciones:

1. Abrir DevTools
2. Verificar `localStorage.getItem('app-locale')`
3. Comprobar que las claves existen en todos los archivos de idioma
4. Verificar que no hay errores de TypeScript

## 📝 Mejores Prácticas

1. **Usar claves descriptivas**: `user.profile.name` en lugar de `name`
2. **Agrupar por funcionalidad**: Todas las claves relacionadas en la misma sección
3. **Mantener consistencia**: Misma estructura en todos los idiomas
4. **Usar parámetros**: Para textos dinámicos con `{variable}`
5. **Plurales**: Usar `_plural` para formas plurales
6. **Validar**: Siempre agregar la clave en los 3 idiomas

## 🚀 Próximas Mejoras

-  [ ] Lazy loading de traducciones
-  [ ] Validación automática de claves faltantes
-  [ ] Herramientas de desarrollo para traducciones
-  [ ] Integración con servicios de traducción
-  [ ] Soporte para RTL (Right-to-Left)

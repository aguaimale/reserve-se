# 🏨 Booking Widget

Widget embebible para reservas de hotel construido con Vue 3 + TypeScript.

## 🚀 Características

-  **Embebible**: Se integra fácilmente en cualquier sitio web como script UMD
-  **Responsive**: Funciona perfectamente en móvil, tablet y desktop
-  **Accesible**: Cumple con estándares WCAG para accesibilidad
-  **Personalizable**: Theming via CSS variables
-  **Multi-idioma**: Soporte para español e inglés
-  **Estados de carga**: Skeletons, empty states y manejo de errores

## 📦 Instalación y desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Vista previa del build
npm run preview
```

## 🔧 Integración

### 1. Incluir el script

```html
<script
   src="https://tu-dominio.com/dist/booking-widget.js"
   data-tenant="hotel-luna"
   data-language="es"
   data-primary="#0EA5E9"
></script>
```

### 2. Crear contenedor

```html
<div id="booking-widget"></div>
```

### 3. Inicializar

```html
<script>
   BookingWidget.mountWidget('#booking-widget', {});
</script>
```

## ⚙️ Configuración

### Atributos del script

-  **data-tenant**: Identificador del hotel/tenant
-  **data-language**: Idioma (`es` | `en`)
-  **data-primary**: Color primario en formato hex (ej: `#0EA5E9`)

### Opciones de montaje

```javascript
BookingWidget.mountWidget('#booking-widget', {
   tenant: 'hotel-luna',
   language: 'es',
   primaryColor: '#0EA5E9',
});
```

## 🎨 Theming

El widget utiliza CSS variables para el theming:

```css
:root {
   --color-primary: #0ea5e9;
   --color-primary-hover: #0284c7;
   --color-primary-light: #bae6fd;
   --radius: 8px;
}
```

## 🌐 API Endpoints

El widget consume los siguientes endpoints del backend:

-  `GET /api/public/config/{tenant}` - Configuración del tenant
-  `GET /api/public/availability` - Búsqueda de disponibilidad
-  `POST /api/public/booking/confirm` - Confirmación de reserva

## 📱 Flujo de usuario

1. **Home**: Selección de fechas y huéspedes
2. **Resultados**: Lista de habitaciones disponibles
3. **Datos**: Formulario de información del huésped
4. **Confirmación**: Resumen y código de reserva

## 🧪 Testing

Para probar el widget localmente:

1. Ejecutar el backend en `http://localhost:3000`
2. Compilar el widget: `npm run build`
3. Abrir `examples/embed.html` en el navegador

## 📋 Estados y validaciones

### Estados de carga

-  Skeletons durante búsquedas
-  Loading spinners en botones
-  Estados empty cuando no hay resultados

### Validaciones

-  Fechas válidas (entrada < salida, máximo 30 días)
-  Campos de huésped requeridos
-  Formato de email y teléfono
-  Términos y condiciones

## 🌍 Navegadores soportados

-  Chrome 80+
-  Firefox 75+
-  Safari 13+
-  Edge 80+

## 🏗️ Arquitectura

```
src/
├── components/          # Componentes Vue
│   ├── HomeScreen.vue      # Pantalla de filtros
│   ├── ResultsScreen.vue   # Lista de resultados
│   ├── GuestScreen.vue     # Formulario de datos
│   └── ConfirmationScreen.vue # Confirmación
├── services/           # Servicios
│   └── api.ts             # Cliente API
├── types/              # Tipos TypeScript
│   └── index.ts
├── App.vue             # Componente principal
├── main.ts             # Entry point y función mountWidget
└── style.css           # Estilos globales
```

## 🚀 Build y deploy

```bash
# Build para producción
npm run build

# Los archivos se generan en dist/
# - booking-widget.js (archivo principal)
# - booking-widget.css (estilos)
```

## 📄 Licencia

MIT

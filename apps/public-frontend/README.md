# 🌐 Public Frontend - Reserve-SE

Vistas dedicadas para hoteles del sistema híbrido Reserve-SE.

## 🚀 Características

-  **Vistas Dedicadas**: Página web completa para cada hotel
-  **SEO Optimizado**: Meta tags dinámicos y estructura semántica
-  **Theming Dinámico**: Colores y branding personalizados por hotel
-  **Widget Integrado**: Sistema de reservas embebido
-  **Responsive**: Optimizado para móvil, tablet y desktop
-  **Multi-idioma**: Soporte para español, inglés y portugués

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

## 🏗️ Arquitectura

### Rutas

-  `/` - Redirige a hotel por defecto
-  `/:tenant` - Vista dedicada del hotel (ej: `/hotel-luna`)
-  `/*` - Página 404

### Componentes

-  `HotelView.vue` - Vista principal del hotel
-  `NotFound.vue` - Página de error 404

### Servicios

-  `api.ts` - Cliente HTTP para comunicación con backend

## 🎨 Theming

El theming se aplica dinámicamente basado en la configuración del hotel:

```css
:root {
   --primary-color: #0ea5e9;
   --primary-color-light: rgba(14, 165, 233, 0.1);
   --primary-color-dark: rgb(0, 135, 203);
}
```

## 🔌 Integración del Widget

El widget se carga dinámicamente desde el proyecto `apps/widget`:

```javascript
// Cargar script del widget
const script = document.createElement('script');
script.src = 'http://localhost:5173/dist/booking-widget.umd.cjs';
document.head.appendChild(script);

// Montar el widget
BookingWidget.mountWidget('#booking-widget-container', {
   tenant: 'hotel-luna',
   language: 'es',
   primaryColor: '#0EA5E9',
});
```

## 🌐 API Endpoints

-  `GET /api/v1/tenants/:slug/config` - Configuración del hotel
-  `GET /api/v1/tenants/:slug/availability` - Disponibilidad
-  `POST /api/v1/tenants/:slug/booking/confirm` - Confirmar reserva

## 📱 Responsive Design

-  **Mobile First**: Diseño optimizado para móviles
-  **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
-  **Grid System**: CSS Grid y Flexbox para layouts flexibles

## 🔍 SEO

-  Meta tags dinámicos por hotel
-  Estructura semántica HTML5
-  Open Graph tags
-  Schema.org markup (futuro)

## 🚀 Despliegue

```bash
# Build para producción
npm run build

# Los archivos se generan en dist/
# Servir con cualquier servidor web estático
```

## 🔧 Configuración

### Variables de Entorno

```bash
VITE_API_BASE=http://localhost:3000/api/v1
```

### Desarrollo

-  Puerto: 5174 (diferente al admin-frontend)
-  Hot reload activado
-  Source maps habilitados

## 📊 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── views/              # Páginas principales
│   ├── HotelView.vue   # Vista del hotel
│   └── NotFound.vue    # Página 404
├── services/           # Servicios
│   └── api.ts         # Cliente HTTP
├── router/            # Configuración de rutas
├── i18n/              # Internacionalización
│   └── locales/       # Traducciones
├── App.vue            # Componente raíz
├── main.ts            # Punto de entrada
└── style.css          # Estilos globales
```

## 🎯 Próximas Mejoras

-  [ ] Galería de fotos dinámica
-  [ ] Información de servicios desde API
-  [ ] Reviews y calificaciones
-  [ ] Chat en vivo
-  [ ] Analytics y tracking
-  [ ] PWA (Progressive Web App)
-  [ ] Schema.org markup
-  [ ] Sitemap dinámico

# 🌐 Sistema Híbrido Reserve-SE

## 📋 Resumen

El sistema híbrido Reserve-SE combina **widget embebible** + **vistas dedicadas** para ofrecer la máxima flexibilidad a los hoteles.

## 🏗️ Arquitectura

### 1. **Widget Embebible** (Ya existía ✅)

-  **URL**: `https://reserve-se.com/dist/booking-widget.umd.cjs`
-  **Uso**: Se embebe en cualquier sitio web existente
-  **Ventajas**:
   -  Fácil integración
   -  No requiere hosting propio
   -  Personalizable via CSS
   -  Funciona en cualquier dominio

### 2. **Vistas Dedicadas** (Nuevo ✅)

-  **URL**: `https://reserve-se.com/hotel-luna`
-  **Uso**: Página web completa para cada hotel
-  **Ventajas**:
   -  SEO optimizado
   -  Branding completo del hotel
   -  Información adicional (galería, servicios, etc.)
   -  Mejor experiencia de usuario

## 🚀 Cómo Usar

### Para Desarrolladores

#### **Opción 1: Widget Embebible**

1. **Incluir el script**:

```html
<script
   src="https://reserve-se.com/dist/booking-widget.umd.cjs"
   data-tenant="hotel-luna"
   data-language="es"
   data-primary="#0EA5E9"
></script>
```

2. **Crear el contenedor**:

```html
<div id="booking-widget"></div>
```

3. **El widget se inicializa automáticamente**

#### **Opción 2: Vista Dedicada**

-  **URL directa**: `https://reserve-se.com/hotel-luna`
-  **Enlace desde tu sitio**: `<a href="https://reserve-se.com/hotel-luna">Reservar</a>`

### Para Hoteles

1. **Accede al panel de administración**: `https://reserve-se.com/admin`
2. **Ve a Configuración** → **"📋 Cómo integrar"**
3. **Copia el código** que necesites
4. **Usa la vista dedicada** para SEO y branding completo

## 🔧 Configuración del Backend

### Rutas Implementadas

-  `GET /` → Redirige a `/hotel-luna`
-  `GET /:tenant` → Vista dedicada del hotel
-  `GET /assets/*` → Archivos estáticos del frontend
-  `GET /sitemap.xml` → Sitemap dinámico
-  `GET /robots.txt` → Robots.txt

### Meta Tags Dinámicos

El backend genera automáticamente:

-  **Título**: `{Hotel Name} - Reservas Online`
-  **Descripción**: `Reserva tu habitación en {Hotel Name}...`
-  **Open Graph**: Para redes sociales
-  **Twitter Cards**: Para Twitter
-  **Canonical URL**: Para SEO

### Configuración del Tenant

```javascript
window.__TENANT_CONFIG__ = {
   id: 'uuid',
   name: 'Hotel Luna',
   slug: 'hotel-luna',
   brand_primary: '#0EA5E9',
   brand_logo: 'https://...',
   currency: 'ARS',
   timezone: 'America/Argentina/Buenos_Aires',
};
```

## 🎨 Theming Dinámico

### Colores Personalizados

```css
:root {
   --primary-color: #0ea5e9;
   --primary-color-light: rgba(14, 165, 233, 0.1);
   --primary-color-dark: rgb(0, 135, 203);
}
```

### Aplicación Automática

-  **Widget**: Usa `data-primary` attribute
-  **Vista Dedicada**: Se aplica automáticamente desde la configuración del tenant

## 📱 Responsive Design

-  **Mobile First**: Optimizado para móviles
-  **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
-  **Grid System**: CSS Grid y Flexbox

## 🔍 SEO Optimizado

### Meta Tags Dinámicos

```html
<title>Hotel Luna - Reservas Online</title>
<meta
   name="description"
   content="Reserva tu habitación en Hotel Luna. Disfruta de una experiencia única en nuestro hotel."
/>
<meta property="og:title" content="Hotel Luna - Reservas Online" />
<meta
   property="og:description"
   content="Reserva tu habitación en Hotel Luna. Disfruta de una experiencia única en nuestro hotel."
/>
<meta property="og:type" content="website" />
<meta property="og:url" content="https://reserve-se.com/hotel-luna" />
<meta property="og:image" content="https://reserve-se.com/logo.png" />
```

### Sitemap Dinámico

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <url>
      <loc>https://reserve-se.com/</loc>
      <lastmod>2024-09-16T14:30:00.000Z</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
   </url>
   <url>
      <loc>https://reserve-se.com/hotel-luna</loc>
      <lastmod>2024-09-16T14:30:00.000Z</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
   </url>
</urlset>
```

## 🚀 Desarrollo

### Comandos Disponibles

```bash
# Desarrollo completo (todos los servicios)
npm run dev

# Servicios individuales
npm run dev:backend    # Puerto 3000
npm run dev:admin      # Puerto 5173
npm run dev:widget     # Puerto 5173 (widget)
npm run dev:public     # Puerto 5174

# Build completo
npm run build:all

# Build individual
npm run build:backend
npm run build:admin
npm run build:widget
npm run build:public
```

### Estructura del Proyecto

```
reserve-se/
├── apps/
│   ├── backend/           # API + Servidor de vistas
│   ├── admin-frontend/    # Panel de administración
│   ├── widget/           # Widget embebible
│   └── public-frontend/  # Vistas dedicadas
├── package.json          # Scripts de desarrollo
└── SISTEMA_HIBRIDO.md    # Esta documentación
```

## 🌐 URLs del Sistema

### Desarrollo

-  **Backend API**: `http://localhost:3000/api/v1`
-  **Admin Panel**: `http://localhost:5173`
-  **Widget**: `http://localhost:5173/dist/booking-widget.umd.cjs`
-  **Vista Dedicada**: `http://localhost:3000/hotel-luna`

### Producción

-  **Backend API**: `https://reserve-se.com/api/v1`
-  **Admin Panel**: `https://reserve-se.com/admin`
-  **Widget**: `https://reserve-se.com/dist/booking-widget.umd.cjs`
-  **Vista Dedicada**: `https://reserve-se.com/hotel-luna`

## 🎯 Próximas Mejoras

-  [ ] Galería de fotos dinámica desde API
-  [ ] Información de servicios desde base de datos
-  [ ] Reviews y calificaciones
-  [ ] Chat en vivo
-  [ ] Analytics y tracking
-  [ ] PWA (Progressive Web App)
-  [ ] Schema.org markup
-  [ ] Sitemap dinámico mejorado
-  [ ] Cache de vistas dedicadas
-  [ ] CDN para archivos estáticos

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema híbrido, contacta al equipo de desarrollo de Reserve-SE.

# Frontend Administrativo - Reserve-SE

Panel de administración para el sistema de gestión hotelera Reserve-SE.

## 🚀 Características

-  **Autenticación JWT** con persistencia en localStorage
-  **Dashboard** con KPIs en tiempo real (check-ins, ocupación, ingresos, reservas)
-  **Gestión de Inventario** con edición inline y importación CSV
-  **Gestión de Reservas** con filtros avanzados y paginación
-  **Configuración** personalizable (colores, moneda, zona horaria)
-  **Tema personalizable** con CSS variables
-  **Responsive design** optimizado para móviles
-  **Internacionalización** en español

## 🛠️ Stack Tecnológico

-  **Vue 3** + Composition API
-  **TypeScript** para type safety
-  **PrimeVue** como librería de componentes UI
-  **Tailwind CSS** para estilos utilitarios
-  **Pinia** para gestión de estado
-  **Axios** para comunicación con API
-  **Vite** como bundler y dev server

## 📁 Estructura del Proyecto

```
src/
├── components/
│   └── layout/           # Componentes de layout (Sidebar, Header)
├── views/               # Páginas principales
│   ├── Login.vue       # Pantalla de login
│   ├── Dashboard.vue   # Dashboard con KPIs
│   ├── Inventory.vue   # Gestión de inventario
│   ├── Bookings.vue    # Gestión de reservas
│   └── Settings.vue    # Configuración
├── stores/             # Stores de Pinia
│   └── auth.ts        # Store de autenticación
├── services/          # Servicios
│   └── api.ts        # Cliente Axios configurado
├── router/           # Configuración de rutas
└── style.css        # Estilos globales y theming
```

## ⚡ Desarrollo

### Prerrequisitos

-  Node.js 18+
-  npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Crear archivo .env
echo "VITE_API_BASE=http://localhost:3000/api/v1" > .env
```

### Comandos disponibles

```bash
# Servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## 🔐 Credenciales de Prueba

El sistema incluye datos de prueba con las siguientes credenciales:

-  **Hotel Luna**: `manager@hotel-luna.com` / `password123`
-  **Hotel Sol**: `manager@hotel-sol.com` / `password123`

## 📊 Funcionalidades Principales

### Dashboard

-  KPIs en tiempo real: check-ins del día, ocupación, ingresos mensuales, reservas activas
-  Lista de próximas llegadas (próximos 7 días)
-  Estado del inventario por tipo de habitación
-  Estados de carga para mejor UX

### Inventario

-  Tabla con paginación y filtros por fecha y tipo de habitación
-  **Edición inline** de disponibilidad, precios y estado (abierto/cerrado)
-  **Importador CSV** con validación de formato
-  Actualización automática vía bulk-upsert API

### Reservas

-  Búsqueda inteligente por localizador, email o nombre
-  Filtros por estado y rango de fechas
-  Paginación con 20 registros por página
-  Vista detallada de reserva en modal
-  Funcionalidad de cancelación

### Configuración

-  **Información del hotel**: nombre, color primario, logo, moneda, zona horaria
-  **Perfil de usuario**: nombre, cambio de contraseña
-  **Zona de peligro**: resetear datos de prueba, exportar datos
-  Theming dinámico con CSS variables

## 🎨 Personalización

### Colores

El sistema soporta theming dinámico mediante CSS variables:

```css
:root {
   --primary-color: #0ea5e9;
   --primary-color-text: #ffffff;
}
```

Los colores se pueden cambiar desde la configuración y se aplican inmediatamente.

### Responsividad

-  Sidebar colapsable en móviles
-  Tablas con scroll horizontal
-  Formularios adaptables
-  Iconos y textos optimizados

## 🔌 Integración con API

El frontend consume la API REST del backend (`apps/backend`) mediante:

-  **Autenticación**: `POST /auth/login`, `GET /auth/me`
-  **Dashboard**: `GET /bookings`, `GET /room-types`, `GET /inventory`
-  **Inventario**: `GET /inventory`, `POST /inventory/bulk-upsert`
-  **Reservas**: `GET /bookings`, `PATCH /bookings/:id`
-  **Configuración**: `PATCH /auth/profile`

## 🚦 Estados de la Aplicación

-  **Loading states** en todas las operaciones asíncronas
-  **Error handling** con mensajes toast informativos
-  **Validación** de formularios con feedback visual
-  **Confirmaciones** para acciones destructivas

## 📱 Accesibilidad

-  Etiquetas ARIA apropiadas
-  Navegación por teclado
-  Contraste de colores adecuado
-  Mensajes de error descriptivos
-  Estados de carga visibles

## 🔧 Configuración de Desarrollo

### Variables de Entorno

```bash
VITE_API_BASE=http://localhost:3000/api/v1
```

### Proxy de Desarrollo

Vite está configurado para servir en puerto 5173 con hot reload activado.

## 📦 Build y Despliegue

```bash
# Build optimizado
npm run build

# Los archivos se generan en dist/
# Servir con cualquier servidor web estático
```

## 🐛 Debugging

-  Vue DevTools para inspeccionar componentes y estado
-  Network tab para monitorear requests API
-  Console logs informativos en desarrollo
-  Error boundaries para capturar errores

## 🚀 Próximas Mejoras

-  [ ] Notificaciones push
-  [ ] Exportación avanzada (PDF, Excel)
-  [ ] Gráficos y analytics avanzados
-  [ ] Modo offline con service workers
-  [ ] Tests unitarios y e2e
-  [ ] Internacionalización multi-idioma

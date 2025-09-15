# Reserve-SE Backend API

Backend API para sistema de reservas hoteleras con soporte multi-tenant usando Express, TypeScript, Prisma y PostgreSQL con Row Level Security (RLS).

## Características

-  **Multi-tenant**: Aislamiento completo de datos por tenant usando RLS
-  **Autenticación JWT**: Login seguro para administradores
-  **API Pública**: Endpoints para consultar disponibilidad y confirmar reservas
-  **API Admin**: CRUD completo para gestión de inventario y reservas
-  **Validación**: Esquemas Zod para validación de entrada
-  **Documentación**: OpenAPI/Swagger en `/docs`
-  **Tests**: Suite de tests con Vitest y Supertest
-  **Rate Limiting**: Protección contra abuso de la API

## Tecnologías

-  **Runtime**: Node.js + TypeScript
-  **Framework**: Express.js
-  **Base de datos**: PostgreSQL con Prisma ORM
-  **Cache**: Redis (opcional)
-  **Autenticación**: JWT + bcrypt
-  **Validación**: Zod
-  **Tests**: Vitest + Supertest
-  **Documentación**: Swagger UI

## Instalación

### Prerrequisitos

1. Node.js 18+
2. Docker y Docker Compose
3. Git

### Configuración

1. **Clonar e instalar dependencias**:

   ```bash
   cd apps/backend
   npm install
   ```

2. **Levantar infraestructura**:

   ```bash
   cd ../../infra
   docker compose up -d
   ```

3. **Configurar variables de entorno**:

   ```bash
   cp env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Ejecutar migraciones y seed**:

   ```bash
   npm run migrate
   npm run seed
   ```

5. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

El servidor estará disponible en `http://localhost:3000`

## Scripts Disponibles

-  `npm run dev` - Servidor de desarrollo con hot reload
-  `npm run build` - Compilar para producción
-  `npm run start` - Ejecutar versión compilada
-  `npm run test` - Ejecutar tests
-  `npm run test:watch` - Tests en modo watch
-  `npm run migrate` - Ejecutar migraciones
-  `npm run seed` - Poblar base de datos con datos de prueba
-  `npm run db:reset` - Resetear base de datos
-  `npm run db:studio` - Abrir Prisma Studio

## Endpoints Principales

### Públicos

-  `GET /api/v1/tenants/:slug/config` - Configuración del tenant
-  `GET /api/v1/availability` - Consultar disponibilidad
-  `POST /api/v1/bookings/confirm` - Confirmar reserva

### Autenticación

-  `POST /api/v1/auth/login` - Login de administrador
-  `GET /api/v1/auth/me` - Información del usuario autenticado

### Admin (requiere JWT)

-  `GET/POST/PUT/DELETE /api/v1/room-types` - Gestión de tipos de habitación
-  `GET/POST/PUT/DELETE /api/v1/rate-plans` - Gestión de tarifas
-  `GET /api/v1/inventory` - Consultar inventario
-  `POST /api/v1/inventory/bulk-upsert` - Actualización masiva de inventario
-  `GET/PATCH /api/v1/bookings` - Gestión de reservas

### Utilidades

-  `GET /healthz` - Health check
-  `GET /docs` - Documentación Swagger

## Datos de Prueba

Después del seed, tendrás:

**Tenants**:

-  Hotel Luna (`hotel-luna`)
-  Hotel Sol (`hotel-sol`)

**Usuarios**:

-  `manager@hotel-luna.com` / `password123`
-  `manager@hotel-sol.com` / `password123`

**Tipos de habitación**:

-  Habitación Doble (2 huéspedes)
-  Suite (4 huéspedes)

**Tarifas**:

-  Flexible (reembolsable)
-  No Reembolsable (mejor precio)

**Inventario**: 30 días con 3 habitaciones por tipo/tarifa

## Ejemplos de Uso

### 1. Consultar configuración del tenant

```bash
curl http://localhost:3000/api/v1/tenants/hotel-luna/config
```

### 2. Consultar disponibilidad

```bash
curl "http://localhost:3000/api/v1/availability?tenant=hotel-luna&checkin=2025-10-10&checkout=2025-10-12&guests=2"
```

### 3. Confirmar reserva

```bash
curl -X POST http://localhost:3000/api/v1/bookings/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "tenant": "hotel-luna",
    "room_type_id": "ROOM_TYPE_ID",
    "rate_plan_id": "RATE_PLAN_ID",
    "checkin": "2025-10-10",
    "checkout": "2025-10-12",
    "guests": 2,
    "customer": {
      "name": "Ana Pérez",
      "email": "ana@example.com",
      "phone": "+54911234567"
    }
  }'
```

### 4. Login de administrador

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@hotel-luna.com",
    "password": "password123"
  }'
```

## Row Level Security (RLS)

La aplicación implementa RLS para aislamiento completo entre tenants:

-  Cada query automáticamente filtra por `tenant_id`
-  Middleware `tenantResolver` establece el contexto del tenant
-  Los tests verifican el aislamiento entre tenants

## Tests

Ejecutar la suite completa:

```bash
npm test
```

Los tests incluyen:

-  **Autenticación**: Login y validación de tokens
-  **API Pública**: Disponibilidad y confirmación de reservas
-  **RLS**: Aislamiento entre tenants
-  **Validaciones**: Esquemas Zod

## Estructura del Proyecto

```
src/
├── index.ts              # Punto de entrada
├── middleware/           # Middlewares (auth, tenant, error)
├── routes/              # Rutas (auth, public, admin)
├── schemas/             # Validaciones Zod
├── utils/               # Utilidades (logger, prisma, swagger)
├── scripts/             # Scripts (seed)
└── tests/               # Tests
```

## Producción

1. **Variables de entorno**:

   ```bash
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   JWT_SECRET=secure-secret-key
   ```

2. **Compilar y ejecutar**:

   ```bash
   npm run build
   npm start
   ```

3. **Migraciones**:
   ```bash
   npm run migrate:prod
   ```

## Monitoreo

-  Health check: `GET /healthz`
-  Logs estructurados con Pino
-  Métricas de performance en logs de queries

## Seguridad

-  Rate limiting (100 req/15min por IP)
-  Helmet para headers de seguridad
-  CORS configurado
-  JWT con expiración 24h
-  Passwords hasheados con bcrypt
-  RLS para aislamiento de datos
-  Validación de entrada con Zod

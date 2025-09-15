export const swaggerSpec = {
   openapi: '3.0.0',
   info: {
      title: 'Reserve-SE API',
      version: '1.0.0',
      description: 'Hotel reservation system API with multi-tenant support',
   },
   servers: [
      {
         url: 'http://localhost:3000/api/v1',
         description: 'Development server',
      },
   ],
   components: {
      securitySchemes: {
         bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
         },
         apiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
         },
      },
      schemas: {
         Error: {
            type: 'object',
            properties: {
               error: {
                  type: 'string',
               },
               message: {
                  type: 'string',
               },
            },
         },
         TenantConfig: {
            type: 'object',
            properties: {
               name: { type: 'string' },
               slug: { type: 'string' },
               brand_primary: { type: 'string' },
               brand_logo: { type: 'string' },
               currency: { type: 'string' },
               timezone: { type: 'string' },
            },
         },
         AvailabilityResponse: {
            type: 'object',
            properties: {
               room_types: {
                  type: 'array',
                  items: {
                     type: 'object',
                     properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        max_guests: { type: 'integer' },
                        rate_plans: {
                           type: 'array',
                           items: {
                              type: 'object',
                              properties: {
                                 id: { type: 'string' },
                                 name: { type: 'string' },
                                 price_cents: { type: 'integer' },
                                 available: { type: 'integer' },
                              },
                           },
                        },
                     },
                  },
               },
            },
         },
         BookingConfirmRequest: {
            type: 'object',
            required: [
               'tenant',
               'room_type_id',
               'rate_plan_id',
               'checkin',
               'checkout',
               'guests',
               'customer',
            ],
            properties: {
               tenant: { type: 'string' },
               room_type_id: { type: 'string' },
               rate_plan_id: { type: 'string' },
               checkin: { type: 'string', format: 'date' },
               checkout: { type: 'string', format: 'date' },
               guests: { type: 'integer', minimum: 1 },
               customer: {
                  type: 'object',
                  required: ['name', 'email'],
                  properties: {
                     name: { type: 'string' },
                     email: { type: 'string', format: 'email' },
                     phone: { type: 'string' },
                  },
               },
            },
         },
         BookingConfirmResponse: {
            type: 'object',
            properties: {
               booking_id: { type: 'string' },
               locator: { type: 'string' },
               total_cents: { type: 'integer' },
               currency: { type: 'string' },
               status: { type: 'string' },
            },
         },
      },
   },
   paths: {
      '/tenants/{slug}/config': {
         get: {
            summary: 'Get tenant configuration',
            parameters: [
               {
                  name: 'slug',
                  in: 'path',
                  required: true,
                  schema: { type: 'string' },
               },
            ],
            responses: {
               200: {
                  description: 'Tenant configuration',
                  content: {
                     'application/json': {
                        schema: { $ref: '#/components/schemas/TenantConfig' },
                     },
                  },
               },
               404: {
                  description: 'Tenant not found',
                  content: {
                     'application/json': {
                        schema: { $ref: '#/components/schemas/Error' },
                     },
                  },
               },
            },
         },
      },
      '/availability': {
         get: {
            summary: 'Check room availability',
            parameters: [
               {
                  name: 'tenant',
                  in: 'query',
                  required: true,
                  schema: { type: 'string' },
               },
               {
                  name: 'checkin',
                  in: 'query',
                  required: true,
                  schema: { type: 'string', format: 'date' },
               },
               {
                  name: 'checkout',
                  in: 'query',
                  required: true,
                  schema: { type: 'string', format: 'date' },
               },
               {
                  name: 'guests',
                  in: 'query',
                  required: true,
                  schema: { type: 'integer', minimum: 1 },
               },
            ],
            responses: {
               200: {
                  description: 'Available rooms',
                  content: {
                     'application/json': {
                        schema: {
                           $ref: '#/components/schemas/AvailabilityResponse',
                        },
                     },
                  },
               },
            },
         },
      },
      '/bookings/confirm': {
         post: {
            summary: 'Confirm booking',
            requestBody: {
               required: true,
               content: {
                  'application/json': {
                     schema: {
                        $ref: '#/components/schemas/BookingConfirmRequest',
                     },
                  },
               },
            },
            responses: {
               201: {
                  description: 'Booking confirmed',
                  content: {
                     'application/json': {
                        schema: {
                           $ref: '#/components/schemas/BookingConfirmResponse',
                        },
                     },
                  },
               },
               400: {
                  description: 'Invalid request',
                  content: {
                     'application/json': {
                        schema: { $ref: '#/components/schemas/Error' },
                     },
                  },
               },
            },
         },
      },
   },
};

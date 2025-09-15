import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index';
import { prisma } from './setup';

describe('Public API', () => {
   let tenant: any;
   let roomType: any;
   let ratePlan: any;

   beforeEach(async () => {
      // Create test tenant
      tenant = await prisma.tenant.create({
         data: {
            name: 'Test Hotel',
            slug: 'test-hotel',
            brand_primary: '#2563eb',
            brand_logo: 'https://example.com/logo.png',
            currency: 'ARS',
            timezone: 'America/Argentina/Buenos_Aires',
         },
      });

      // Set tenant context for RLS
      await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenant.id}, true)`;

      // Create test room type
      roomType = await prisma.roomType.create({
         data: {
            tenant_id: tenant.id,
            name: 'Standard Room',
            description: 'A comfortable standard room',
            max_guests: 2,
         },
      });

      // Create test rate plan
      ratePlan = await prisma.ratePlan.create({
         data: {
            tenant_id: tenant.id,
            name: 'Flexible Rate',
            description: 'Flexible cancellation policy',
            is_refundable: true,
            cancellation_hrs: 24,
         },
      });

      // Create test inventory for next 3 days
      const today = new Date();
      for (let i = 1; i <= 3; i++) {
         const date = new Date(today);
         date.setDate(today.getDate() + i);

         await prisma.inventory.create({
            data: {
               tenant_id: tenant.id,
               room_type_id: roomType.id,
               rate_plan_id: ratePlan.id,
               date: date,
               allotment: 5,
               price_cents: 10000,
               min_stay: 1,
               max_stay: 7,
            },
         });
      }
   });

   describe('GET /api/v1/tenants/:slug/config', () => {
      it('should return tenant configuration', async () => {
         const response = await request(app).get(
            '/api/v1/tenants/test-hotel/config'
         );

         expect(response.status).toBe(200);
         expect(response.body).toEqual({
            name: tenant.name,
            slug: tenant.slug,
            brand_primary: tenant.brand_primary,
            brand_logo: tenant.brand_logo,
            currency: tenant.currency,
            timezone: tenant.timezone,
         });
      });

      it('should return 404 for non-existent tenant', async () => {
         const response = await request(app).get(
            '/api/v1/tenants/non-existent/config'
         );

         expect(response.status).toBe(404);
         expect(response.body).toHaveProperty('error');
      });
   });

   describe('GET /api/v1/availability', () => {
      it('should return available rooms', async () => {
         const tomorrow = new Date();
         tomorrow.setDate(tomorrow.getDate() + 1);
         const dayAfter = new Date();
         dayAfter.setDate(dayAfter.getDate() + 2);

         const checkin = tomorrow.toISOString().split('T')[0];
         const checkout = dayAfter.toISOString().split('T')[0];

         const response = await request(app).get('/api/v1/availability').query({
            tenant: 'test-hotel',
            checkin,
            checkout,
            guests: '2',
         });

         expect(response.status).toBe(200);
         expect(response.body).toHaveProperty('room_types');
         expect(response.body.room_types).toHaveLength(1);
         expect(response.body.room_types[0]).toHaveProperty('rate_plans');
         expect(response.body.room_types[0].rate_plans).toHaveLength(1);
         expect(response.body.room_types[0].rate_plans[0].available).toBe(5);
      });

      it('should return empty for dates without inventory', async () => {
         const futureDate = new Date();
         futureDate.setDate(futureDate.getDate() + 30);
         const futureDateAfter = new Date();
         futureDateAfter.setDate(futureDateAfter.getDate() + 31);

         const checkin = futureDate.toISOString().split('T')[0];
         const checkout = futureDateAfter.toISOString().split('T')[0];

         const response = await request(app).get('/api/v1/availability').query({
            tenant: 'test-hotel',
            checkin,
            checkout,
            guests: '2',
         });

         expect(response.status).toBe(200);
         expect(response.body.room_types).toHaveLength(0);
      });
   });

   describe('POST /api/v1/bookings/confirm', () => {
      it('should create a booking successfully', async () => {
         const tomorrow = new Date();
         tomorrow.setDate(tomorrow.getDate() + 1);
         const dayAfter = new Date();
         dayAfter.setDate(dayAfter.getDate() + 2);

         const checkin = tomorrow.toISOString().split('T')[0];
         const checkout = dayAfter.toISOString().split('T')[0];

         const response = await request(app)
            .post('/api/v1/bookings/confirm')
            .send({
               tenant: 'test-hotel',
               room_type_id: roomType.id,
               rate_plan_id: ratePlan.id,
               checkin,
               checkout,
               guests: 2,
               customer: {
                  name: 'John Doe',
                  email: 'john@example.com',
                  phone: '+1234567890',
               },
            });

         expect(response.status).toBe(201);
         expect(response.body).toHaveProperty('booking_id');
         expect(response.body).toHaveProperty('locator');
         expect(response.body).toHaveProperty('total_cents');
         expect(response.body.total_cents).toBe(10000); // 1 night * 10000 cents
         expect(response.body.currency).toBe('ARS');
         expect(response.body.status).toBe('confirmed');

         // Verify inventory was reduced
         const updatedInventory = await prisma.inventory.findFirst({
            where: {
               tenant_id: tenant.id,
               room_type_id: roomType.id,
               rate_plan_id: ratePlan.id,
               date: tomorrow,
            },
         });

         expect(updatedInventory?.allotment).toBe(4); // Reduced from 5 to 4
      });

      it('should reject booking for past dates', async () => {
         const yesterday = new Date();
         yesterday.setDate(yesterday.getDate() - 1);
         const today = new Date();

         const checkin = yesterday.toISOString().split('T')[0];
         const checkout = today.toISOString().split('T')[0];

         const response = await request(app)
            .post('/api/v1/bookings/confirm')
            .send({
               tenant: 'test-hotel',
               room_type_id: roomType.id,
               rate_plan_id: ratePlan.id,
               checkin,
               checkout,
               guests: 2,
               customer: {
                  name: 'John Doe',
                  email: 'john@example.com',
               },
            });

         expect(response.status).toBe(400);
         expect(response.body).toHaveProperty('error');
      });

      it('should reject booking when no availability', async () => {
         // First, reduce inventory to 0
         await prisma.inventory.updateMany({
            where: {
               tenant_id: tenant.id,
               room_type_id: roomType.id,
               rate_plan_id: ratePlan.id,
            },
            data: { allotment: 0 },
         });

         const tomorrow = new Date();
         tomorrow.setDate(tomorrow.getDate() + 1);
         const dayAfter = new Date();
         dayAfter.setDate(dayAfter.getDate() + 2);

         const checkin = tomorrow.toISOString().split('T')[0];
         const checkout = dayAfter.toISOString().split('T')[0];

         const response = await request(app)
            .post('/api/v1/bookings/confirm')
            .send({
               tenant: 'test-hotel',
               room_type_id: roomType.id,
               rate_plan_id: ratePlan.id,
               checkin,
               checkout,
               guests: 2,
               customer: {
                  name: 'John Doe',
                  email: 'john@example.com',
               },
            });

         expect(response.status).toBe(400);
         expect(response.body).toHaveProperty('error');
      });
   });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from './setup';

describe('Row Level Security (RLS)', () => {
   let tenant1: any;
   let tenant2: any;
   let roomType1: any;
   let roomType2: any;

   beforeEach(async () => {
      // Create two test tenants
      tenant1 = await prisma.tenant.create({
         data: {
            name: 'Hotel A',
            slug: 'hotel-a',
            currency: 'ARS',
         },
      });

      tenant2 = await prisma.tenant.create({
         data: {
            name: 'Hotel B',
            slug: 'hotel-b',
            currency: 'ARS',
         },
      });

      // Set tenant1 context and create room type
      await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenant1.id}, true)`;
      roomType1 = await prisma.roomType.create({
         data: {
            tenant_id: tenant1.id,
            name: 'Room A',
            max_guests: 2,
         },
      });

      // Set tenant2 context and create room type
      await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenant2.id}, true)`;
      roomType2 = await prisma.roomType.create({
         data: {
            tenant_id: tenant2.id,
            name: 'Room B',
            max_guests: 2,
         },
      });
   });

   it('should isolate room types by tenant', async () => {
      // Set tenant1 context
      await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenant1.id}, true)`;

      const roomTypesForTenant1 = await prisma.roomType.findMany();
      expect(roomTypesForTenant1).toHaveLength(1);
      expect(roomTypesForTenant1[0].id).toBe(roomType1.id);
      expect(roomTypesForTenant1[0].name).toBe('Room A');

      // Set tenant2 context
      await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenant2.id}, true)`;

      const roomTypesForTenant2 = await prisma.roomType.findMany();
      expect(roomTypesForTenant2).toHaveLength(1);
      expect(roomTypesForTenant2[0].id).toBe(roomType2.id);
      expect(roomTypesForTenant2[0].name).toBe('Room B');
   });

   it('should prevent access to other tenant data', async () => {
      // Set tenant1 context
      await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenant1.id}, true)`;

      // Try to find tenant2's room type - should return nothing
      const roomType = await prisma.roomType.findUnique({
         where: { id: roomType2.id },
      });

      expect(roomType).toBeNull();
   });

   it('should work with complex queries', async () => {
      // Create inventory for both tenants
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Set tenant1 context and create rate plan + inventory
      await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenant1.id}, true)`;
      const ratePlan1 = await prisma.ratePlan.create({
         data: {
            tenant_id: tenant1.id,
            name: 'Rate A',
         },
      });

      const inventory1 = await prisma.inventory.create({
         data: {
            tenant_id: tenant1.id,
            room_type_id: roomType1.id,
            rate_plan_id: ratePlan1.id,
            date: tomorrow,
            allotment: 5,
            price_cents: 10000,
         },
      });

      // Set tenant2 context and create rate plan + inventory
      await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenant2.id}, true)`;
      const ratePlan2 = await prisma.ratePlan.create({
         data: {
            tenant_id: tenant2.id,
            name: 'Rate B',
         },
      });

      const inventory2 = await prisma.inventory.create({
         data: {
            tenant_id: tenant2.id,
            room_type_id: roomType2.id,
            rate_plan_id: ratePlan2.id,
            date: tomorrow,
            allotment: 3,
            price_cents: 15000,
         },
      });

      // Test isolation with complex query
      await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenant1.id}, true)`;

      const roomTypesWithInventory = await prisma.roomType.findMany({
         include: {
            inventory: {
               include: {
                  rate_plan: true,
               },
            },
         },
      });

      expect(roomTypesWithInventory).toHaveLength(1);
      expect(roomTypesWithInventory[0].id).toBe(roomType1.id);
      expect(roomTypesWithInventory[0].inventory).toHaveLength(1);
      expect(roomTypesWithInventory[0].inventory[0].allotment).toBe(5);
      expect(roomTypesWithInventory[0].inventory[0].rate_plan.name).toBe(
         'Rate A'
      );
   });
});

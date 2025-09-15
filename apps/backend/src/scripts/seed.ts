import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

const generateApiKey = () => {
   return (
      'ak_' +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
   );
};

const generateLocator = () => {
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
   let result = '';
   for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
   }
   result += '-';
   for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
   }
   return result;
};

async function main() {
   logger.info('Starting database seed...');

   // Create tenants
   const hotelLuna = await prisma.tenant.create({
      data: {
         name: 'Hotel Luna',
         slug: 'hotel-luna',
         brand_primary: '#2563eb',
         brand_logo:
            'https://via.placeholder.com/200x80/2563eb/ffffff?text=Hotel+Luna',
         currency: 'ARS',
         timezone: 'America/Argentina/Buenos_Aires',
      },
   });

   const hotelSol = await prisma.tenant.create({
      data: {
         name: 'Hotel Sol',
         slug: 'hotel-sol',
         brand_primary: '#f59e0b',
         brand_logo:
            'https://via.placeholder.com/200x80/f59e0b/ffffff?text=Hotel+Sol',
         currency: 'ARS',
         timezone: 'America/Argentina/Buenos_Aires',
      },
   });

   logger.info('Created tenants');

   // Create users
   const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
   const hashedPassword = await bcrypt.hash('password123', saltRounds);

   await prisma.user.create({
      data: {
         tenant_id: hotelLuna.id,
         email: 'manager@hotel-luna.com',
         password: hashedPassword,
         name: 'Manager Luna',
         role: 'manager',
      },
   });

   await prisma.user.create({
      data: {
         tenant_id: hotelSol.id,
         email: 'manager@hotel-sol.com',
         password: hashedPassword,
         name: 'Manager Sol',
         role: 'manager',
      },
   });

   logger.info('Created users');

   // Create API Keys
   await prisma.apiKey.create({
      data: {
         tenant_id: hotelLuna.id,
         name: 'Default API Key',
         key: generateApiKey(),
      },
   });

   await prisma.apiKey.create({
      data: {
         tenant_id: hotelSol.id,
         name: 'Default API Key',
         key: generateApiKey(),
      },
   });

   logger.info('Created API keys');

   // Create room types for both tenants
   const roomTypesData = [
      {
         name: 'Habitación Doble',
         description: 'Habitación doble con baño privado',
         max_guests: 2,
      },
      {
         name: 'Suite',
         description: 'Suite con sala de estar separada',
         max_guests: 4,
      },
   ];

   const lunaRoomTypes = [];
   const solRoomTypes = [];

   for (const roomTypeData of roomTypesData) {
      const lunaRoomType = await prisma.roomType.create({
         data: {
            tenant_id: hotelLuna.id,
            ...roomTypeData,
         },
      });
      lunaRoomTypes.push(lunaRoomType);

      const solRoomType = await prisma.roomType.create({
         data: {
            tenant_id: hotelSol.id,
            ...roomTypeData,
         },
      });
      solRoomTypes.push(solRoomType);
   }

   logger.info('Created room types');

   // Create rate plans for both tenants
   const ratePlansData = [
      {
         name: 'Tarifa Flexible',
         description: 'Cancelación gratuita hasta 24hs antes',
         is_refundable: true,
         cancellation_hrs: 24,
      },
      {
         name: 'Tarifa No Reembolsable',
         description: 'No reembolsable - mejor precio',
         is_refundable: false,
         cancellation_hrs: 0,
      },
   ];

   const lunaRatePlans = [];
   const solRatePlans = [];

   for (const ratePlanData of ratePlansData) {
      const lunaRatePlan = await prisma.ratePlan.create({
         data: {
            tenant_id: hotelLuna.id,
            ...ratePlanData,
         },
      });
      lunaRatePlans.push(lunaRatePlan);

      const solRatePlan = await prisma.ratePlan.create({
         data: {
            tenant_id: hotelSol.id,
            ...ratePlanData,
         },
      });
      solRatePlans.push(solRatePlan);
   }

   logger.info('Created rate plans');

   // Create inventory for next 30 days
   const today = new Date();
   const inventoryPromises = [];

   for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Hotel Luna inventory
      for (const roomType of lunaRoomTypes) {
         for (const ratePlan of lunaRatePlans) {
            const basePrice = roomType.name.includes('Suite') ? 15000 : 8000;
            const priceMultiplier = ratePlan.is_refundable ? 1.2 : 1.0;
            const finalPrice = Math.round(basePrice * priceMultiplier);

            inventoryPromises.push(
               prisma.inventory.create({
                  data: {
                     tenant_id: hotelLuna.id,
                     room_type_id: roomType.id,
                     rate_plan_id: ratePlan.id,
                     date: date,
                     allotment: 3,
                     price_cents: finalPrice,
                     min_stay: 1,
                     max_stay: 7,
                  },
               })
            );
         }
      }

      // Hotel Sol inventory
      for (const roomType of solRoomTypes) {
         for (const ratePlan of solRatePlans) {
            const basePrice = roomType.name.includes('Suite') ? 18000 : 10000;
            const priceMultiplier = ratePlan.is_refundable ? 1.2 : 1.0;
            const finalPrice = Math.round(basePrice * priceMultiplier);

            inventoryPromises.push(
               prisma.inventory.create({
                  data: {
                     tenant_id: hotelSol.id,
                     room_type_id: roomType.id,
                     rate_plan_id: ratePlan.id,
                     date: date,
                     allotment: 3,
                     price_cents: finalPrice,
                     min_stay: 1,
                     max_stay: 7,
                  },
               })
            );
         }
      }
   }

   await Promise.all(inventoryPromises);
   logger.info('Created inventory for 30 days');

   // Create some sample bookings
   const tomorrow = new Date(today);
   tomorrow.setDate(today.getDate() + 1);
   const dayAfterTomorrow = new Date(today);
   dayAfterTomorrow.setDate(today.getDate() + 2);

   await prisma.booking.create({
      data: {
         tenant_id: hotelLuna.id,
         room_type_id: lunaRoomTypes[0].id,
         rate_plan_id: lunaRatePlans[0].id,
         locator: generateLocator(),
         checkin: tomorrow,
         checkout: dayAfterTomorrow,
         guests: 2,
         total_cents: 9600,
         currency: 'ARS',
         customer_name: 'Ana Pérez',
         customer_email: 'ana.perez@email.com',
         customer_phone: '+54911234567',
      },
   });

   await prisma.booking.create({
      data: {
         tenant_id: hotelSol.id,
         room_type_id: solRoomTypes[1].id,
         rate_plan_id: solRatePlans[1].id,
         locator: generateLocator(),
         checkin: tomorrow,
         checkout: dayAfterTomorrow,
         guests: 3,
         total_cents: 18000,
         currency: 'ARS',
         customer_name: 'Carlos Rodríguez',
         customer_email: 'carlos.rodriguez@email.com',
         customer_phone: '+54911765432',
      },
   });

   logger.info('Created sample bookings');
   logger.info('Database seed completed successfully!');
}

main()
   .catch((e) => {
      logger.error(e, 'Error during seed');
      process.exit(1);
   })
   .finally(async () => {
      await prisma.$disconnect();
   });

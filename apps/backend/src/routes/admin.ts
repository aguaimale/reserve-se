import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { requireAuth } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import {
   createRoomTypeSchema,
   updateRoomTypeSchema,
   createRatePlanSchema,
   updateRatePlanSchema,
   bulkInventoryUpsertSchema,
   bookingListQuerySchema,
   updateBookingSchema,
   paginationQuerySchema,
   updateTenantSchema,
} from '../schemas';

const router = Router();

// Apply authentication to all admin routes
router.use(requireAuth);

// ROOM TYPES CRUD

// GET /room-types
router.get('/room-types', async (req: any, res, next) => {
   try {
      const { page, limit } = paginationQuerySchema.parse(req.query);
      const skip = (page - 1) * limit;

      const [roomTypes, total] = await Promise.all([
         prisma.roomType.findMany({
            where: {
               tenant_id: req.user.tenant_id,
            },
            skip,
            take: limit,
            orderBy: { created_at: 'desc' },
         }),
         prisma.roomType.count({
            where: {
               tenant_id: req.user.tenant_id,
            },
         }),
      ]);

      res.json({
         data: roomTypes,
         pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
         },
      });
   } catch (error) {
      next(error);
   }
});

// POST /room-types
router.post('/room-types', async (req: any, res, next) => {
   try {
      const roomTypeData = createRoomTypeSchema.parse(req.body);

      const roomType = await prisma.roomType.create({
         data: {
            tenant_id: req.user.tenant_id,
            ...roomTypeData,
         },
      });

      res.status(201).json(roomType);
   } catch (error) {
      next(error);
   }
});

// GET /room-types/:id
router.get('/room-types/:id', async (req: any, res, next) => {
   try {
      const { id } = req.params;

      const roomType = await prisma.roomType.findFirst({
         where: {
            id,
            tenant_id: req.user.tenant_id,
         },
      });

      if (!roomType) {
         throw createError('Room type not found', 404);
      }

      res.json(roomType);
   } catch (error) {
      next(error);
   }
});

// PUT /room-types/:id
router.put('/room-types/:id', async (req: any, res, next) => {
   try {
      const { id } = req.params;
      const roomTypeData = updateRoomTypeSchema.parse(req.body);

      const roomType = await prisma.roomType.findFirst({
         where: {
            id,
            tenant_id: req.user.tenant_id,
         },
      });

      if (!roomType) {
         throw createError('Room type not found', 404);
      }

      const updatedRoomType = await prisma.roomType.update({
         where: { id },
         data: roomTypeData,
      });

      res.json(updatedRoomType);
   } catch (error) {
      next(error);
   }
});

// DELETE /room-types/:id
router.delete('/room-types/:id', async (req: any, res, next) => {
   try {
      const { id } = req.params;

      const roomType = await prisma.roomType.findFirst({
         where: {
            id,
            tenant_id: req.user.tenant_id,
         },
      });

      if (!roomType) {
         throw createError('Room type not found', 404);
      }

      // Check if room type has bookings
      const bookingCount = await prisma.booking.count({
         where: {
            room_type_id: id,
            tenant_id: req.user.tenant_id,
         },
      });

      if (bookingCount > 0) {
         throw createError(
            'Cannot delete room type with existing bookings',
            400
         );
      }

      await prisma.roomType.delete({
         where: { id },
      });

      res.status(204).send();
   } catch (error) {
      next(error);
   }
});

// RATE PLANS CRUD

// GET /rate-plans
router.get('/rate-plans', async (req: any, res, next) => {
   try {
      const { page, limit } = paginationQuerySchema.parse(req.query);
      const skip = (page - 1) * limit;

      const [ratePlans, total] = await Promise.all([
         prisma.ratePlan.findMany({
            where: {
               tenant_id: req.user.tenant_id,
            },
            skip,
            take: limit,
            orderBy: { created_at: 'desc' },
         }),
         prisma.ratePlan.count({
            where: {
               tenant_id: req.user.tenant_id,
            },
         }),
      ]);

      res.json({
         data: ratePlans,
         pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
         },
      });
   } catch (error) {
      next(error);
   }
});

// POST /rate-plans
router.post('/rate-plans', async (req: any, res, next) => {
   try {
      const ratePlanData = createRatePlanSchema.parse(req.body);

      const ratePlan = await prisma.ratePlan.create({
         data: {
            tenant_id: req.user.tenant_id,
            ...ratePlanData,
         },
      });

      res.status(201).json(ratePlan);
   } catch (error) {
      next(error);
   }
});

// GET /rate-plans/:id
router.get('/rate-plans/:id', async (req: any, res, next) => {
   try {
      const { id } = req.params;

      const ratePlan = await prisma.ratePlan.findFirst({
         where: {
            id,
            tenant_id: req.user.tenant_id,
         },
      });

      if (!ratePlan) {
         throw createError('Rate plan not found', 404);
      }

      res.json(ratePlan);
   } catch (error) {
      next(error);
   }
});

// PUT /rate-plans/:id
router.put('/rate-plans/:id', async (req: any, res, next) => {
   try {
      const { id } = req.params;
      const ratePlanData = updateRatePlanSchema.parse(req.body);

      const ratePlan = await prisma.ratePlan.findFirst({
         where: {
            id,
            tenant_id: req.user.tenant_id,
         },
      });

      if (!ratePlan) {
         throw createError('Rate plan not found', 404);
      }

      const updatedRatePlan = await prisma.ratePlan.update({
         where: { id },
         data: ratePlanData,
      });

      res.json(updatedRatePlan);
   } catch (error) {
      next(error);
   }
});

// DELETE /rate-plans/:id
router.delete('/rate-plans/:id', async (req: any, res, next) => {
   try {
      const { id } = req.params;

      const ratePlan = await prisma.ratePlan.findFirst({
         where: {
            id,
            tenant_id: req.user.tenant_id,
         },
      });

      if (!ratePlan) {
         throw createError('Rate plan not found', 404);
      }

      // Check if rate plan has bookings
      const bookingCount = await prisma.booking.count({
         where: {
            rate_plan_id: id,
            tenant_id: req.user.tenant_id,
         },
      });

      if (bookingCount > 0) {
         throw createError(
            'Cannot delete rate plan with existing bookings',
            400
         );
      }

      await prisma.ratePlan.delete({
         where: { id },
      });

      res.status(204).send();
   } catch (error) {
      next(error);
   }
});

// INVENTORY MANAGEMENT

// GET /inventory
router.get('/inventory', async (req: any, res, next) => {
   try {
      const { page, limit } = paginationQuerySchema.parse(req.query);
      const skip = (page - 1) * limit;

      // Parse optional query filters
      const dateFrom = req.query.date_from
         ? new Date(req.query.date_from as string)
         : undefined;
      const dateTo = req.query.date_to
         ? new Date(req.query.date_to as string)
         : undefined;
      const roomTypeId = req.query.room_type_id as string | undefined;
      const ratePlanId = req.query.rate_plan_id as string | undefined;

      const where: any = {
         tenant_id: req.user.tenant_id,
      };

      if (dateFrom || dateTo) {
         where.date = {};
         if (dateFrom) where.date.gte = dateFrom;
         if (dateTo) where.date.lte = dateTo;
      }

      if (roomTypeId) where.room_type_id = roomTypeId;
      if (ratePlanId) where.rate_plan_id = ratePlanId;

      const [inventory, total] = await Promise.all([
         prisma.inventory.findMany({
            where,
            skip,
            take: limit,
            include: {
               room_type: { select: { name: true } },
               rate_plan: { select: { name: true } },
            },
            orderBy: { date: 'asc' },
         }),
         prisma.inventory.count({ where }),
      ]);

      res.json({
         data: inventory,
         pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
         },
      });
   } catch (error) {
      next(error);
   }
});

// POST /inventory/bulk-upsert
router.post('/inventory/bulk-upsert', async (req: any, res, next) => {
   try {
      const { inventory } = bulkInventoryUpsertSchema.parse(req.body);

      // Verify all room types and rate plans belong to the tenant
      const roomTypeIds = [
         ...new Set(inventory.map((item) => item.room_type_id)),
      ];
      const ratePlanIds = [
         ...new Set(inventory.map((item) => item.rate_plan_id)),
      ];

      const [roomTypes, ratePlans] = await Promise.all([
         prisma.roomType.findMany({
            where: {
               id: { in: roomTypeIds },
               tenant_id: req.user.tenant_id,
            },
         }),
         prisma.ratePlan.findMany({
            where: {
               id: { in: ratePlanIds },
               tenant_id: req.user.tenant_id,
            },
         }),
      ]);

      if (roomTypes.length !== roomTypeIds.length) {
         throw createError('Some room types not found', 400);
      }

      if (ratePlans.length !== ratePlanIds.length) {
         throw createError('Some rate plans not found', 400);
      }

      // Perform bulk upsert
      const results = await Promise.all(
         inventory.map((item) =>
            prisma.inventory.upsert({
               where: {
                  tenant_id_room_type_id_rate_plan_id_date: {
                     tenant_id: req.user.tenant_id,
                     room_type_id: item.room_type_id,
                     rate_plan_id: item.rate_plan_id,
                     date: new Date(item.date),
                  },
               },
               update: {
                  allotment: item.allotment,
                  price_cents: item.price_cents,
                  min_stay: item.min_stay,
                  max_stay: item.max_stay,
                  is_closed: item.is_closed,
                  updated_at: new Date(),
               },
               create: {
                  tenant_id: req.user.tenant_id,
                  room_type_id: item.room_type_id,
                  rate_plan_id: item.rate_plan_id,
                  date: new Date(item.date),
                  allotment: item.allotment,
                  price_cents: item.price_cents,
                  min_stay: item.min_stay,
                  max_stay: item.max_stay,
                  is_closed: item.is_closed,
               },
            })
         )
      );

      res.json({
         message: `Successfully upserted ${results.length} inventory items`,
         count: results.length,
      });
   } catch (error) {
      next(error);
   }
});

// BOOKINGS MANAGEMENT

// GET /bookings
router.get('/bookings', async (req: any, res, next) => {
   try {
      const {
         page,
         limit,
         status,
         checkin_from,
         checkin_to,
         customer_email,
         customer_name,
         locator,
      } = bookingListQuerySchema.parse(req.query);

      const skip = (page - 1) * limit;

      const where: any = {
         tenant_id: req.user.tenant_id,
      };

      if (status) where.status = status;

      // Búsqueda por email
      if (customer_email) {
         where.customer_email = {
            contains: customer_email,
            mode: 'insensitive',
         };
      }

      // Búsqueda por nombre
      if (customer_name) {
         where.customer_name = {
            contains: customer_name,
            mode: 'insensitive',
         };
      }

      // Búsqueda por localizador
      if (locator) {
         where.locator = {
            contains: locator.toUpperCase(),
            mode: 'insensitive',
         };
      }

      if (checkin_from || checkin_to) {
         where.checkin = {};
         if (checkin_from) where.checkin.gte = new Date(checkin_from);
         if (checkin_to) where.checkin.lte = new Date(checkin_to);
      }

      const [bookings, total] = await Promise.all([
         prisma.booking.findMany({
            where,
            skip,
            take: limit,
            include: {
               room_type: { select: { name: true } },
               rate_plan: { select: { name: true } },
            },
            orderBy: { created_at: 'desc' },
         }),
         prisma.booking.count({ where }),
      ]);

      res.json({
         data: bookings,
         pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
         },
      });
   } catch (error) {
      next(error);
   }
});

// GET /bookings/:id
router.get('/bookings/:id', async (req: any, res, next) => {
   try {
      const { id } = req.params;

      const booking = await prisma.booking.findFirst({
         where: {
            id,
            tenant_id: req.user.tenant_id,
         },
         include: {
            room_type: true,
            rate_plan: true,
         },
      });

      if (!booking) {
         throw createError('Booking not found', 404);
      }

      res.json(booking);
   } catch (error) {
      next(error);
   }
});

// PATCH /bookings/:id
router.patch('/bookings/:id', async (req: any, res, next) => {
   try {
      const { id } = req.params;
      const { status, cancellation_reason } = updateBookingSchema.parse(
         req.body
      );

      const booking = await prisma.booking.findFirst({
         where: {
            id,
            tenant_id: req.user.tenant_id,
         },
      });

      if (!booking) {
         throw createError('Booking not found', 404);
      }

      if (booking.status === 'cancelled') {
         throw createError('Booking is already cancelled', 400);
      }

      // If cancelling, restore inventory
      if (status === 'cancelled') {
         const checkinDate = booking.checkin;
         const checkoutDate = booking.checkout;

         const inventory = await prisma.inventory.findMany({
            where: {
               tenant_id: req.user.tenant_id,
               room_type_id: booking.room_type_id,
               rate_plan_id: booking.rate_plan_id,
               date: {
                  gte: checkinDate,
                  lt: checkoutDate,
               },
            },
         });

         // Restore allotment
         const updatePromises = inventory.map((inv) =>
            prisma.inventory.update({
               where: { id: inv.id },
               data: { allotment: inv.allotment + 1 },
            })
         );

         await Promise.all(updatePromises);
      }

      const updateData: any = { status };
      if (cancellation_reason) {
         updateData.cancellation_reason = cancellation_reason;
      }

      const updatedBooking = await prisma.booking.update({
         where: { id },
         data: updateData,
      });

      res.json(updatedBooking);
   } catch (error) {
      next(error);
   }
});

// TENANT MANAGEMENT

// PATCH /tenant
router.patch('/tenant', async (req: any, res, next) => {
   try {
      const tenantData = updateTenantSchema.parse(req.body);

      // Verify tenant exists and belongs to user
      const existingTenant = await prisma.tenant.findUnique({
         where: { id: req.user.tenant_id },
      });

      if (!existingTenant) {
         throw createError('Tenant not found', 404);
      }

      // Update tenant
      const updatedTenant = await prisma.tenant.update({
         where: { id: req.user.tenant_id },
         data: {
            ...tenantData,
            updated_at: new Date(),
         },
      });

      res.json({
         id: updatedTenant.id,
         name: updatedTenant.name,
         slug: updatedTenant.slug,
         brand_primary: updatedTenant.brand_primary,
         brand_logo: updatedTenant.brand_logo,
         currency: updatedTenant.currency,
         timezone: updatedTenant.timezone,
      });
   } catch (error) {
      next(error);
   }
});

// GET /tenant
router.get('/tenant', async (req: any, res, next) => {
   try {
      const tenant = await prisma.tenant.findUnique({
         where: { id: req.user.tenant_id },
      });

      if (!tenant) {
         throw createError('Tenant not found', 404);
      }

      res.json({
         id: tenant.id,
         name: tenant.name,
         slug: tenant.slug,
         brand_primary: tenant.brand_primary,
         brand_logo: tenant.brand_logo,
         currency: tenant.currency,
         timezone: tenant.timezone,
      });
   } catch (error) {
      next(error);
   }
});

// DEVELOPMENT UTILITIES

// POST /seed/reset
router.post('/seed/reset', async (req: any, res, next) => {
   try {
      // Only allow in development/test environments
      if (process.env.NODE_ENV === 'production') {
         throw createError('Seed reset not allowed in production', 403);
      }

      const tenantId = req.user.tenant_id;

      // Set tenant context for RLS
      await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      // Delete existing data for this tenant (in reverse dependency order)
      await prisma.booking.deleteMany({
         where: { tenant_id: tenantId },
      });

      await prisma.inventory.deleteMany({
         where: { tenant_id: tenantId },
      });

      await prisma.ratePlan.deleteMany({
         where: { tenant_id: tenantId },
      });

      await prisma.roomType.deleteMany({
         where: { tenant_id: tenantId },
      });

      // Recreate room types
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

      const createdRoomTypes = [];
      for (const roomTypeData of roomTypesData) {
         const roomType = await prisma.roomType.create({
            data: {
               tenant_id: tenantId,
               ...roomTypeData,
            },
         });
         createdRoomTypes.push(roomType);
      }

      // Recreate rate plans
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

      const createdRatePlans = [];
      for (const ratePlanData of ratePlansData) {
         const ratePlan = await prisma.ratePlan.create({
            data: {
               tenant_id: tenantId,
               ...ratePlanData,
            },
         });
         createdRatePlans.push(ratePlan);
      }

      // Recreate inventory for next 30 days
      const today = new Date();
      const inventoryPromises = [];

      for (let i = 0; i < 30; i++) {
         const date = new Date(today);
         date.setDate(today.getDate() + i);

         for (const roomType of createdRoomTypes) {
            for (const ratePlan of createdRatePlans) {
               const basePrice = roomType.name.includes('Suite') ? 15000 : 8000;
               const priceMultiplier = ratePlan.is_refundable ? 1.2 : 1.0;
               const finalPrice = Math.round(basePrice * priceMultiplier);

               inventoryPromises.push(
                  prisma.inventory.create({
                     data: {
                        tenant_id: tenantId,
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

      res.json({
         message: 'Test data reset successfully',
         room_types: createdRoomTypes.length,
         rate_plans: createdRatePlans.length,
         inventory_items: inventoryPromises.length,
      });
   } catch (error) {
      next(error);
   }
});

// GET /occupancy
router.get('/occupancy', async (req: any, res, next) => {
   try {
      const tenantId = req.user.tenant_id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get total inventory for today
      const todayInventory = await prisma.inventory.findMany({
         where: {
            tenant_id: tenantId,
            date: today,
            is_closed: false,
         },
         include: {
            room_type: true,
         },
      });

      // Calculate total available rooms
      const totalAvailable = todayInventory.reduce(
         (sum, inv) => sum + inv.allotment,
         0
      );

      // Get occupied rooms (confirmed bookings for today)
      const occupiedRooms = await prisma.booking.count({
         where: {
            tenant_id: tenantId,
            status: 'confirmed',
            checkin: { lte: today },
            checkout: { gt: today },
         },
      });

      // Calculate occupancy percentage
      const occupancyRate =
         totalAvailable > 0
            ? Math.round((occupiedRooms / totalAvailable) * 100)
            : 0;

      res.json({
         date: today.toISOString().split('T')[0],
         total_available: totalAvailable,
         occupied: occupiedRooms,
         occupancy_rate: occupancyRate,
      });
   } catch (error) {
      next(error);
   }
});

export { router as adminRoutes };

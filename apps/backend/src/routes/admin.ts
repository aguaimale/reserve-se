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
      const { page, limit, status, checkin_from, checkin_to, customer_email } =
         bookingListQuerySchema.parse(req.query);

      const skip = (page - 1) * limit;

      const where: any = {
         tenant_id: req.user.tenant_id,
      };

      if (status) where.status = status;
      if (customer_email)
         where.customer_email = {
            contains: customer_email,
            mode: 'insensitive',
         };
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
      const { status } = updateBookingSchema.parse(req.body);

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

      const updatedBooking = await prisma.booking.update({
         where: { id },
         data: { status },
      });

      res.json(updatedBooking);
   } catch (error) {
      next(error);
   }
});

export { router as adminRoutes };

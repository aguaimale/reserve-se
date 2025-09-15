import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { availabilityQuerySchema, bookingConfirmSchema } from '../schemas';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Utility function to generate booking locator
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

// GET /tenants/:slug/config
router.get('/tenants/:slug/config', async (req, res, next) => {
   try {
      const { slug } = req.params;

      const tenant = await prisma.tenant.findUnique({
         where: { slug },
      });

      if (!tenant) {
         throw createError('Tenant not found', 404);
      }

      res.json({
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

// GET /availability
router.get('/availability', async (req: any, res, next) => {
   try {
      const { tenant, checkin, checkout, guests } =
         availabilityQuerySchema.parse(req.query);

      // Validate dates
      const checkinDate = new Date(checkin);
      const checkoutDate = new Date(checkout);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkinDate < today) {
         throw createError('Check-in date cannot be in the past', 400);
      }

      if (checkoutDate <= checkinDate) {
         throw createError('Check-out date must be after check-in date', 400);
      }

      // Find tenant
      const tenantRecord = await prisma.tenant.findUnique({
         where: { slug: tenant },
      });

      if (!tenantRecord) {
         throw createError('Tenant not found', 404);
      }

      // Set tenant context for RLS
      await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantRecord.id}, true)`;

      // Get room types that can accommodate the guests
      const roomTypes = await prisma.roomType.findMany({
         where: {
            tenant_id: tenantRecord.id,
            max_guests: { gte: guests },
            is_active: true,
         },
         include: {
            inventory: {
               where: {
                  date: {
                     gte: checkinDate,
                     lt: checkoutDate,
                  },
                  is_closed: false,
               },
               include: {
                  rate_plan: {
                     where: {
                        is_active: true,
                     },
                  },
               },
            },
         },
      });

      // Calculate nights
      const nights = Math.ceil(
         (checkoutDate.getTime() - checkinDate.getTime()) /
            (1000 * 60 * 60 * 24)
      );

      // Process availability
      const availability = roomTypes
         .map((roomType) => {
            // Group inventory by rate plan
            const ratePlanMap = new Map();

            roomType.inventory.forEach((inv) => {
               if (!inv.rate_plan) return;

               const key = inv.rate_plan.id;
               if (!ratePlanMap.has(key)) {
                  ratePlanMap.set(key, {
                     id: inv.rate_plan.id,
                     name: inv.rate_plan.name,
                     description: inv.rate_plan.description,
                     is_refundable: inv.rate_plan.is_refundable,
                     cancellation_hrs: inv.rate_plan.cancellation_hrs,
                     inventory: [],
                  });
               }
               ratePlanMap.get(key).inventory.push(inv);
            });

            const ratePlans = Array.from(ratePlanMap.values())
               .map((ratePlan) => {
                  // Check if all nights are available
                  const availableNights = ratePlan.inventory.length;
                  const minAllotment = Math.min(
                     ...ratePlan.inventory.map((inv: any) => inv.allotment)
                  );
                  const totalPrice = ratePlan.inventory.reduce(
                     (sum: number, inv: any) => sum + inv.price_cents,
                     0
                  );

                  return {
                     id: ratePlan.id,
                     name: ratePlan.name,
                     description: ratePlan.description,
                     is_refundable: ratePlan.is_refundable,
                     cancellation_hrs: ratePlan.cancellation_hrs,
                     price_cents: totalPrice,
                     price_per_night: Math.round(totalPrice / nights),
                     available: availableNights === nights ? minAllotment : 0,
                  };
               })
               .filter((rp) => rp.available > 0);

            return {
               id: roomType.id,
               name: roomType.name,
               description: roomType.description,
               max_guests: roomType.max_guests,
               rate_plans: ratePlans,
            };
         })
         .filter((rt) => rt.rate_plans.length > 0);

      res.json({
         checkin,
         checkout,
         nights,
         guests,
         room_types: availability,
      });
   } catch (error) {
      next(error);
   }
});

// POST /bookings/confirm
router.post('/bookings/confirm', async (req, res, next) => {
   try {
      const bookingData = bookingConfirmSchema.parse(req.body);

      // Validate dates
      const checkinDate = new Date(bookingData.checkin);
      const checkoutDate = new Date(bookingData.checkout);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkinDate < today) {
         throw createError('Check-in date cannot be in the past', 400);
      }

      if (checkoutDate <= checkinDate) {
         throw createError('Check-out date must be after check-in date', 400);
      }

      // Find tenant
      const tenant = await prisma.tenant.findUnique({
         where: { slug: bookingData.tenant },
      });

      if (!tenant) {
         throw createError('Tenant not found', 404);
      }

      // Set tenant context for RLS
      await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenant.id}, true)`;

      // Verify room type and rate plan belong to tenant
      const roomType = await prisma.roomType.findFirst({
         where: {
            id: bookingData.room_type_id,
            tenant_id: tenant.id,
            is_active: true,
         },
      });

      if (!roomType) {
         throw createError('Room type not found', 404);
      }

      if (roomType.max_guests < bookingData.guests) {
         throw createError(
            'Room type cannot accommodate the requested number of guests',
            400
         );
      }

      const ratePlan = await prisma.ratePlan.findFirst({
         where: {
            id: bookingData.rate_plan_id,
            tenant_id: tenant.id,
            is_active: true,
         },
      });

      if (!ratePlan) {
         throw createError('Rate plan not found', 404);
      }

      // Check availability and calculate total price
      const inventory = await prisma.inventory.findMany({
         where: {
            tenant_id: tenant.id,
            room_type_id: bookingData.room_type_id,
            rate_plan_id: bookingData.rate_plan_id,
            date: {
               gte: checkinDate,
               lt: checkoutDate,
            },
            is_closed: false,
         },
         orderBy: { date: 'asc' },
      });

      const nights = Math.ceil(
         (checkoutDate.getTime() - checkinDate.getTime()) /
            (1000 * 60 * 60 * 24)
      );

      if (inventory.length !== nights) {
         throw createError(
            'Not all nights are available for the selected dates',
            400
         );
      }

      const minAllotment = Math.min(...inventory.map((inv) => inv.allotment));
      if (minAllotment < 1) {
         throw createError('No availability for the selected dates', 400);
      }

      const totalPrice = inventory.reduce(
         (sum, inv) => sum + inv.price_cents,
         0
      );

      // Create booking
      const locator = generateLocator();

      const booking = await prisma.booking.create({
         data: {
            tenant_id: tenant.id,
            room_type_id: bookingData.room_type_id,
            rate_plan_id: bookingData.rate_plan_id,
            locator,
            checkin: checkinDate,
            checkout: checkoutDate,
            guests: bookingData.guests,
            total_cents: totalPrice,
            currency: tenant.currency,
            customer_name: bookingData.customer.name,
            customer_email: bookingData.customer.email,
            customer_phone: bookingData.customer.phone || null,
         },
      });

      // Update inventory (reduce allotment by 1)
      const updatePromises = inventory.map((inv) =>
         prisma.inventory.update({
            where: { id: inv.id },
            data: { allotment: inv.allotment - 1 },
         })
      );

      await Promise.all(updatePromises);

      res.status(201).json({
         booking_id: booking.id,
         locator: booking.locator,
         total_cents: booking.total_cents,
         currency: booking.currency,
         status: booking.status,
      });
   } catch (error) {
      next(error);
   }
});

export { router as publicRoutes };

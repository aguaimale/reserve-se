import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
   email: z.string().email('Invalid email format'),
   password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Booking schemas
export const bookingConfirmSchema = z.object({
   tenant: z.string().min(1, 'Tenant is required'),
   room_type_id: z.string().uuid('Invalid room type ID'),
   rate_plan_id: z.string().uuid('Invalid rate plan ID'),
   checkin: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid checkin date format (YYYY-MM-DD)'),
   checkout: z
      .string()
      .regex(
         /^\d{4}-\d{2}-\d{2}$/,
         'Invalid checkout date format (YYYY-MM-DD)'
      ),
   guests: z
      .number()
      .int()
      .min(1, 'At least 1 guest required')
      .max(10, 'Maximum 10 guests'),
   customer: z.object({
      name: z.string().min(1, 'Customer name is required'),
      email: z.string().email('Invalid email format'),
      phone: z.string().optional(),
   }),
});

// Availability query schema
export const availabilityQuerySchema = z.object({
   tenant: z.string().min(1, 'Tenant slug is required'),
   checkin: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid checkin date format (YYYY-MM-DD)'),
   checkout: z
      .string()
      .regex(
         /^\d{4}-\d{2}-\d{2}$/,
         'Invalid checkout date format (YYYY-MM-DD)'
      ),
   guests: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(
         z
            .number()
            .int()
            .min(1, 'At least 1 guest required')
            .max(10, 'Maximum 10 guests')
      ),
});

// Room type schemas
export const createRoomTypeSchema = z.object({
   name: z.string().min(1, 'Room type name is required'),
   description: z.string().optional(),
   max_guests: z
      .number()
      .int()
      .min(1, 'At least 1 guest capacity')
      .max(10, 'Maximum 10 guests'),
});

export const updateRoomTypeSchema = createRoomTypeSchema.partial();

// Rate plan schemas
export const createRatePlanSchema = z.object({
   name: z.string().min(1, 'Rate plan name is required'),
   description: z.string().optional(),
   is_refundable: z.boolean().default(true),
   cancellation_hrs: z
      .number()
      .int()
      .min(0, 'Cancellation hours must be non-negative')
      .default(24),
});

export const updateRatePlanSchema = createRatePlanSchema.partial();

// Inventory schemas
export const inventoryItemSchema = z.object({
   room_type_id: z.string().uuid('Invalid room type ID'),
   rate_plan_id: z.string().uuid('Invalid rate plan ID'),
   date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
   allotment: z.number().int().min(0, 'Allotment must be non-negative'),
   price_cents: z.number().int().min(0, 'Price must be non-negative'),
   min_stay: z
      .number()
      .int()
      .min(1, 'Minimum stay must be at least 1')
      .default(1),
   max_stay: z
      .number()
      .int()
      .min(1, 'Maximum stay must be at least 1')
      .default(30),
   is_closed: z.boolean().default(false),
});

export const bulkInventoryUpsertSchema = z.object({
   inventory: z
      .array(inventoryItemSchema)
      .min(1, 'At least one inventory item is required'),
});

// Booking list query schema
export const bookingListQuerySchema = z.object({
   page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .pipe(z.number().int().min(1, 'Page must be at least 1')),
   limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 20))
      .pipe(
         z
            .number()
            .int()
            .min(1, 'Limit must be at least 1')
            .max(100, 'Limit cannot exceed 100')
      ),
   status: z.enum(['confirmed', 'cancelled']).optional(),
   checkin_from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
      .optional(),
   checkin_to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
      .optional(),
   customer_email: z.string().email().optional(),
});

// Booking update schema
export const updateBookingSchema = z.object({
   status: z.enum(['cancelled'], 'Only cancellation is supported'),
});

// Pagination schema
export const paginationQuerySchema = z.object({
   page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .pipe(z.number().int().min(1, 'Page must be at least 1')),
   limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 20))
      .pipe(
         z
            .number()
            .int()
            .min(1, 'Limit must be at least 1')
            .max(100, 'Limit cannot exceed 100')
      ),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type BookingConfirmRequest = z.infer<typeof bookingConfirmSchema>;
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
export type CreateRoomTypeRequest = z.infer<typeof createRoomTypeSchema>;
export type UpdateRoomTypeRequest = z.infer<typeof updateRoomTypeSchema>;
export type CreateRatePlanRequest = z.infer<typeof createRatePlanSchema>;
export type UpdateRatePlanRequest = z.infer<typeof updateRatePlanSchema>;
export type BulkInventoryUpsertRequest = z.infer<
   typeof bulkInventoryUpsertSchema
>;
export type BookingListQuery = z.infer<typeof bookingListQuerySchema>;
export type UpdateBookingRequest = z.infer<typeof updateBookingSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

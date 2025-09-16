-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "cancellation_reason" TEXT,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- DropIndex
DROP INDEX "idx_api_keys_tenant_id";

-- DropIndex
DROP INDEX "idx_bookings_checkin";

-- DropIndex
DROP INDEX "idx_bookings_checkout";

-- DropIndex
DROP INDEX "idx_bookings_tenant_id";

-- DropIndex
DROP INDEX "idx_inventory_date";

-- DropIndex
DROP INDEX "idx_inventory_tenant_id";

-- DropIndex
DROP INDEX "idx_rate_plans_tenant_id";

-- DropIndex
DROP INDEX "idx_room_types_tenant_id";

-- DropIndex
DROP INDEX "idx_users_tenant_id";

-- AlterTable
ALTER TABLE "api_keys" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "inventory" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "rate_plans" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "room_types" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "tenants" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;

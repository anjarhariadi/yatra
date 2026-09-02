-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "color" TEXT NOT NULL DEFAULT 'chart-1';

-- Give each built-in type a distinct color
UPDATE "Category" SET "color" = 'chart-1' WHERE "type" = 'IDLE_CASH';
UPDATE "Category" SET "color" = 'chart-2' WHERE "type" = 'HOT_CASH';
UPDATE "Category" SET "color" = 'chart-3' WHERE "type" = 'EMERGENCY_FUND';

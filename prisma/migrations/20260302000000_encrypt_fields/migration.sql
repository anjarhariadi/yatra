-- Migration: Encrypt sensitive fields
-- This migration changes the Record.amount column from Decimal to String
-- to support encrypted storage. Notes fields remain as String but will
-- be encrypted at the application level.

-- First, clear existing data that was encrypted with broken key
TRUNCATE TABLE "Record" CASCADE;
TRUNCATE TABLE "Wallet" CASCADE;
TRUNCATE TABLE "Category" CASCADE;

ALTER TABLE "Record" ALTER COLUMN "amount" TYPE TEXT;

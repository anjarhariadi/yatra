/*
  Warnings:

  - You are about to drop the column `userId` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_userId_fkey";

-- DropForeignKey
ALTER TABLE "Record" DROP CONSTRAINT "Record_userId_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_userId_fkey";

-- DropIndex
DROP INDEX "Record_userId_idx";

-- AlterTable
ALTER TABLE "Record" DROP COLUMN "userId";

-- DropTable
DROP TABLE "User";

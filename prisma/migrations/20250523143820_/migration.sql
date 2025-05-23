/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ServiceIntervalRule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ServiceIntervalRule" DROP COLUMN "createdAt",
ADD COLUMN     "createOrderIndex" SERIAL NOT NULL;

/*
  Warnings:

  - You are about to drop the `Appointment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_carVin_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_serviceId_fkey";

-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "carName" VARCHAR(50);

-- DropTable
DROP TABLE "Appointment";

-- DropTable
DROP TABLE "Service";

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tittle" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "carVin" TEXT NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "carVin" TEXT NOT NULL,

    CONSTRAINT "CarAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mileage" INTEGER NOT NULL,
    "serviceBy" TEXT,
    "serviceCost" INTEGER,
    "serviceType" VARCHAR(100) NOT NULL,
    "serviceDetail" TEXT,
    "serviceNote" TEXT,
    "carVin" TEXT NOT NULL,

    CONSTRAINT "ServiceLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_carVin_fkey" FOREIGN KEY ("carVin") REFERENCES "Car"("vin") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarAccess" ADD CONSTRAINT "CarAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarAccess" ADD CONSTRAINT "CarAccess_carVin_fkey" FOREIGN KEY ("carVin") REFERENCES "Car"("vin") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceLog" ADD CONSTRAINT "ServiceLog_serviceBy_fkey" FOREIGN KEY ("serviceBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceLog" ADD CONSTRAINT "ServiceLog_carVin_fkey" FOREIGN KEY ("carVin") REFERENCES "Car"("vin") ON DELETE CASCADE ON UPDATE CASCADE;

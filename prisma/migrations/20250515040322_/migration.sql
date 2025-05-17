-- CreateEnum
CREATE TYPE "UpcomingServiceStatus" AS ENUM ('ACTIVE', 'SNOOZED', 'COMPLETE', 'DISMISSED');

-- CreateEnum
CREATE TYPE "UpcomingServiceTriggerReason" AS ENUM ('MILEAGE_THRESHOLD');

-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "mileage" INTEGER;

-- CreateTable
CREATE TABLE "ServiceIntervalRule" (
    "id" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "description" TEXT,
    "defaultIntervalMiles" INTEGER,
    "firstOccurrenceMiles" INTEGER,

    CONSTRAINT "ServiceIntervalRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpcomingService" (
    "id" TEXT NOT NULL,
    "carVin" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "serviceDescription" TEXT NOT NULL,
    "targetMileage" INTEGER NOT NULL,
    "status" "UpcomingServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "snoozedUntilMileage" INTEGER,
    "triggerReason" "UpcomingServiceTriggerReason",
    "completedByServiceLogId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UpcomingService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceIntervalRule_serviceType_key" ON "ServiceIntervalRule"("serviceType");

-- CreateIndex
CREATE UNIQUE INDEX "UpcomingService_completedByServiceLogId_key" ON "UpcomingService"("completedByServiceLogId");

-- CreateIndex
CREATE INDEX "UpcomingService_carVin_status_idx" ON "UpcomingService"("carVin", "status");

-- CreateIndex
CREATE INDEX "UpcomingService_carVin_serviceType_status_idx" ON "UpcomingService"("carVin", "serviceType", "status");

-- CreateIndex
CREATE INDEX "UpcomingService_status_targetMileage_idx" ON "UpcomingService"("status", "targetMileage");

-- AddForeignKey
ALTER TABLE "UpcomingService" ADD CONSTRAINT "UpcomingService_carVin_fkey" FOREIGN KEY ("carVin") REFERENCES "Car"("vin") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpcomingService" ADD CONSTRAINT "UpcomingService_completedByServiceLogId_fkey" FOREIGN KEY ("completedByServiceLogId") REFERENCES "ServiceLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

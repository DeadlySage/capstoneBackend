-- AlterTable
ALTER TABLE "ServiceIntervalRule" ALTER COLUMN "createOrderIndex" DROP NOT NULL,
ALTER COLUMN "createOrderIndex" DROP DEFAULT;
DROP SEQUENCE "ServiceIntervalRule_createOrderIndex_seq";

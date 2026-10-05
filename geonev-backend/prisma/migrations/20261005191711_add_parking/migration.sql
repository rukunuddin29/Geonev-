-- CreateEnum
CREATE TYPE "SpotType" AS ENUM ('CAR', 'BIKE', 'TRUCK', 'EV_CHARGING');

-- CreateEnum
CREATE TYPE "ChargerType" AS ENUM ('NONE', 'AC', 'DC', 'BOTH');

-- CreateTable
CREATE TABLE "Parking" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "spotType" "SpotType" NOT NULL,
    "totalSlots" INTEGER NOT NULL,
    "pricePerHour" DOUBLE PRECISION NOT NULL,
    "chargerType" "ChargerType" NOT NULL DEFAULT 'NONE',
    "powerKw" DOUBLE PRECISION,
    "images" TEXT[],
    "amenities" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hostId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Parking_city_idx" ON "Parking"("city");

-- CreateIndex
CREATE INDEX "Parking_spotType_idx" ON "Parking"("spotType");

-- CreateIndex
CREATE INDEX "Parking_hostId_idx" ON "Parking"("hostId");

-- CreateIndex
CREATE INDEX "Parking_isActive_idx" ON "Parking"("isActive");

-- CreateIndex
CREATE INDEX "OtpRecord_userId_idx" ON "OtpRecord"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- AddForeignKey
ALTER TABLE "Parking" ADD CONSTRAINT "Parking_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

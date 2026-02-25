/*
  Warnings:

  - You are about to drop the column `is_active` on the `App` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `App` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `App` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `App` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `badge` to the `App` table without a default value. This is not possible if the table is not empty.
  - Added the required column `heroAccent` to the `App` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iconName` to the `App` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `App` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stats` to the `App` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tagline` to the `App` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `App` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `App` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "App" DROP COLUMN "is_active",
DROP COLUMN "status",
DROP COLUMN "url",
ADD COLUMN     "badge" TEXT NOT NULL,
ADD COLUMN     "comingSoon" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "heroAccent" TEXT NOT NULL,
ADD COLUMN     "iconName" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "stats" JSONB NOT NULL,
ADD COLUMN     "tagline" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- CreateTable
CREATE TABLE "AppFeature" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AppFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppPlan" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userRange" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "description" TEXT NOT NULL,
    "isHighlighted" BOOLEAN NOT NULL DEFAULT false,
    "paypalPlanId" TEXT,
    "features" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AppPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppFAQ" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AppFAQ_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "App_slug_key" ON "App"("slug");

-- AddForeignKey
ALTER TABLE "AppFeature" ADD CONSTRAINT "AppFeature_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppPlan" ADD CONSTRAINT "AppPlan_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppFAQ" ADD CONSTRAINT "AppFAQ_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterEnum
ALTER TYPE "DeckStatus" ADD VALUE 'DRAFT';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "creditsBalance" SET DEFAULT 0;

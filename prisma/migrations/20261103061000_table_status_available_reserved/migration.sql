-- AlterEnum
BEGIN;
CREATE TYPE "TableStatus_new" AS ENUM ('AVAILABLE', 'RESERVED');
ALTER TABLE "public"."tables" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "tables" ALTER COLUMN "status" TYPE "TableStatus_new" USING ("status"::text::"TableStatus_new");
ALTER TYPE "TableStatus" RENAME TO "TableStatus_old";
ALTER TYPE "TableStatus_new" RENAME TO "TableStatus";
DROP TYPE "public"."TableStatus_old";
ALTER TABLE "tables" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;

/*
  Warnings:

  - You are about to alter the column `name` on the `products` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `products` MODIFY `name` ENUM('FANTA_PRO', 'FANTA_LIGHT', 'FANTA_UNBAN') NOT NULL;

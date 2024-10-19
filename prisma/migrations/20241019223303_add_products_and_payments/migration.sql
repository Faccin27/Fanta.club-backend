/*
  Warnings:

  - You are about to drop the column `description` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `products` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Double`.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_products` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `expiration` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_productId_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_userId_fkey`;

-- DropForeignKey
ALTER TABLE `user_products` DROP FOREIGN KEY `user_products_paymentId_fkey`;

-- DropForeignKey
ALTER TABLE `user_products` DROP FOREIGN KEY `user_products_productId_fkey`;

-- DropForeignKey
ALTER TABLE `user_products` DROP FOREIGN KEY `user_products_userId_fkey`;

-- AlterTable
ALTER TABLE `products` DROP COLUMN `description`,
    DROP COLUMN `type`,
    ADD COLUMN `expiration` ENUM('DAY', 'WEEK', 'MONTH', 'LIFETIME') NOT NULL,
    MODIFY `price` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `expiryDate` DATETIME(3) NULL,
    MODIFY `role` ENUM('User', 'Premium', 'Moderator', 'FANTA') NOT NULL DEFAULT 'User';

-- DropTable
DROP TABLE `payments`;

-- DropTable
DROP TABLE `user_products`;

-- CreateTable
CREATE TABLE `purchases` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `purchaseDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `paymentMethod` VARCHAR(191) NOT NULL,
    `receiptId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

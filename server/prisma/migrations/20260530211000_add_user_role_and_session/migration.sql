-- AlterTable
ALTER TABLE `User` ADD COLUMN `lastLoginAt` DATETIME(3) NULL,
    ADD COLUMN `refreshTokenHash` VARCHAR(191) NULL,
    ADD COLUMN `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE UNIQUE INDEX `User_refreshTokenHash_key` ON `User`(`refreshTokenHash`);

-- AlterTable
ALTER TABLE `User` ADD COLUMN `heightCm` DECIMAL(5, 2) NULL,
    ADD COLUMN `profileImagePath` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `WeightEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `weightKg` DECIMAL(5, 2) NOT NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `WeightEntry_userId_recordedAt_idx`(`userId`, `recordedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WeightEntry` ADD CONSTRAINT `WeightEntry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

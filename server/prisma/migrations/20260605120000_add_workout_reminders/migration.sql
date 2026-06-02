-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pushReminderEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailReminderEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminderDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "reminderTimeLocal" TEXT NOT NULL DEFAULT '18:00',
ADD COLUMN     "reminderTimezone" TEXT NOT NULL DEFAULT 'UTC',
ADD COLUMN     "lastEmailReminderSentAt" TIMESTAMP(3);

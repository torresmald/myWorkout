ALTER TABLE "UserPreferences"
ADD COLUMN "plannedWorkoutReminderEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "lastPlannedEmailReminderSentAt" TIMESTAMP(3);

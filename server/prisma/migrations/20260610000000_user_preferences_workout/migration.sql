ALTER TABLE "UserPreferences"
ADD COLUMN "restTimerSoundEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "showPrToast" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "confirmIncompleteFinish" BOOLEAN NOT NULL DEFAULT true;

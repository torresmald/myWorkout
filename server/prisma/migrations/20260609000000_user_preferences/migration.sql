-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'es',
    "themeMode" TEXT NOT NULL DEFAULT 'system',
    "weightUnit" TEXT NOT NULL DEFAULT 'kg',
    "pushReminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emailReminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "reminderDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "reminderTimeLocal" TEXT NOT NULL DEFAULT '18:00',
    "reminderTimezone" TEXT NOT NULL DEFAULT 'UTC',
    "lastEmailReminderSentAt" TIMESTAMP(3),
    "allowAutoPlaylist" BOOLEAN NOT NULL DEFAULT false,
    "spotifyPlaylistUrl" TEXT,
    "spotifyUserId" TEXT,
    "spotifyAccessToken" TEXT,
    "spotifyRefreshToken" TEXT,
    "spotifyTokenExpiresAt" TIMESTAMP(3),
    "spotifyDisplayName" TEXT,
    "spotifyPlaylistName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- Migrate existing user settings
INSERT INTO "UserPreferences" (
    "userId",
    "locale",
    "pushReminderEnabled",
    "emailReminderEnabled",
    "reminderDays",
    "reminderTimeLocal",
    "reminderTimezone",
    "lastEmailReminderSentAt",
    "allowAutoPlaylist",
    "spotifyPlaylistUrl",
    "spotifyUserId",
    "spotifyAccessToken",
    "spotifyRefreshToken",
    "spotifyTokenExpiresAt",
    "spotifyDisplayName",
    "spotifyPlaylistName",
    "updatedAt"
)
SELECT
    "id",
    "locale",
    "pushReminderEnabled",
    "emailReminderEnabled",
    "reminderDays",
    "reminderTimeLocal",
    "reminderTimezone",
    "lastEmailReminderSentAt",
    "allowAutoPlaylist",
    "spotifyPlaylistUrl",
    "spotifyUserId",
    "spotifyAccessToken",
    "spotifyRefreshToken",
    "spotifyTokenExpiresAt",
    "spotifyDisplayName",
    "spotifyPlaylistName",
    CURRENT_TIMESTAMP
FROM "User";

-- Drop moved columns from User
ALTER TABLE "User" DROP COLUMN "locale",
DROP COLUMN "pushReminderEnabled",
DROP COLUMN "emailReminderEnabled",
DROP COLUMN "reminderDays",
DROP COLUMN "reminderTimeLocal",
DROP COLUMN "reminderTimezone",
DROP COLUMN "lastEmailReminderSentAt",
DROP COLUMN "allowAutoPlaylist",
DROP COLUMN "spotifyPlaylistUrl",
DROP COLUMN "spotifyUserId",
DROP COLUMN "spotifyAccessToken",
DROP COLUMN "spotifyRefreshToken",
DROP COLUMN "spotifyTokenExpiresAt",
DROP COLUMN "spotifyDisplayName",
DROP COLUMN "spotifyPlaylistName";

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");
CREATE UNIQUE INDEX "UserPreferences_spotifyUserId_key" ON "UserPreferences"("spotifyUserId");

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

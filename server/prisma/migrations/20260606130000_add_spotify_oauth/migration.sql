-- AlterTable
ALTER TABLE "User" ADD COLUMN "spotifyUserId" TEXT;
ALTER TABLE "User" ADD COLUMN "spotifyAccessToken" TEXT;
ALTER TABLE "User" ADD COLUMN "spotifyRefreshToken" TEXT;
ALTER TABLE "User" ADD COLUMN "spotifyTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "spotifyDisplayName" TEXT;
ALTER TABLE "User" ADD COLUMN "spotifyPlaylistName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_spotifyUserId_key" ON "User"("spotifyUserId");

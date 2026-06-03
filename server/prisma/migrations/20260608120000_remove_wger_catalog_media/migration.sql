-- Remove wger static images; catalog media is curated via Cloudinary (GIF/video) or external URLs
UPDATE "ExerciseCatalog"
SET "mediaUrl" = NULL,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "mediaUrl" LIKE 'https://wger.de/%';

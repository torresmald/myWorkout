-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM ('CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'FULL_BODY');

-- CreateEnum
CREATE TYPE "CatalogMediaType" AS ENUM ('IMAGE', 'GIF', 'VIDEO', 'YOUTUBE');

-- CreateTable
CREATE TABLE "ExerciseCatalog" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEs" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descriptionEs" TEXT,
    "descriptionEn" TEXT,
    "muscleGroup" "MuscleGroup" NOT NULL,
    "mediaType" "CatalogMediaType" NOT NULL DEFAULT 'IMAGE',
    "mediaUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseCatalog_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "ExerciseType" ADD COLUMN "catalogExerciseId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseCatalog_slug_key" ON "ExerciseCatalog"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseType_userId_catalogExerciseId_key" ON "ExerciseType"("userId", "catalogExerciseId");

-- AddForeignKey
ALTER TABLE "ExerciseType" ADD CONSTRAINT "ExerciseType_catalogExerciseId_fkey" FOREIGN KEY ("catalogExerciseId") REFERENCES "ExerciseCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed catalog exercises
INSERT INTO "ExerciseCatalog" ("slug", "nameEs", "nameEn", "descriptionEs", "descriptionEn", "muscleGroup", "mediaType", "mediaUrl", "sortOrder", "updatedAt") VALUES
('bench-press', 'Press de banca', 'Bench press', 'Acuéstate en el banco, baja la barra al pecho y empuja hacia arriba.', 'Lie on the bench, lower the bar to your chest, and press up.', 'CHEST', 'IMAGE', NULL, 10, CURRENT_TIMESTAMP),
('incline-bench-press', 'Press inclinado', 'Incline bench press', NULL, NULL, 'CHEST', 'IMAGE', NULL, 20, CURRENT_TIMESTAMP),
('push-up', 'Flexiones', 'Push-up', NULL, NULL, 'CHEST', 'IMAGE', NULL, 30, CURRENT_TIMESTAMP),
('pull-up', 'Dominadas', 'Pull-up', NULL, NULL, 'BACK', 'IMAGE', NULL, 40, CURRENT_TIMESTAMP),
('barbell-row', 'Remo con barra', 'Barbell row', NULL, NULL, 'BACK', 'IMAGE', NULL, 50, CURRENT_TIMESTAMP),
('lat-pulldown', 'Jalón al pecho', 'Lat pulldown', NULL, NULL, 'BACK', 'IMAGE', NULL, 60, CURRENT_TIMESTAMP),
('squat', 'Sentadilla', 'Squat', 'Barra sobre trapecios, baja flexionando rodillas y cadera, sube empujando el suelo.', 'Bar on upper back, lower by bending knees and hips, drive up through the floor.', 'LEGS', 'IMAGE', NULL, 70, CURRENT_TIMESTAMP),
('deadlift', 'Peso muerto', 'Deadlift', NULL, NULL, 'BACK', 'IMAGE', NULL, 80, CURRENT_TIMESTAMP),
('romanian-deadlift', 'Peso muerto rumano', 'Romanian deadlift', NULL, NULL, 'LEGS', 'IMAGE', NULL, 90, CURRENT_TIMESTAMP),
('lunge', 'Zancadas', 'Lunge', NULL, NULL, 'LEGS', 'IMAGE', NULL, 100, CURRENT_TIMESTAMP),
('leg-press', 'Prensa de piernas', 'Leg press', NULL, NULL, 'LEGS', 'IMAGE', NULL, 110, CURRENT_TIMESTAMP),
('hip-thrust', 'Hip thrust', 'Hip thrust', NULL, NULL, 'LEGS', 'IMAGE', NULL, 120, CURRENT_TIMESTAMP),
('calf-raise', 'Elevación de gemelos', 'Calf raise', NULL, NULL, 'LEGS', 'IMAGE', NULL, 130, CURRENT_TIMESTAMP),
('overhead-press', 'Press militar', 'Overhead press', NULL, NULL, 'SHOULDERS', 'IMAGE', NULL, 140, CURRENT_TIMESTAMP),
('lateral-raise', 'Elevaciones laterales', 'Lateral raise', NULL, NULL, 'SHOULDERS', 'IMAGE', NULL, 150, CURRENT_TIMESTAMP),
('face-pull', 'Face pull', 'Face pull', NULL, NULL, 'SHOULDERS', 'IMAGE', NULL, 160, CURRENT_TIMESTAMP),
('barbell-curl', 'Curl con barra', 'Barbell curl', NULL, NULL, 'ARMS', 'IMAGE', NULL, 170, CURRENT_TIMESTAMP),
('triceps-pushdown', 'Extensiones en polea', 'Triceps pushdown', NULL, NULL, 'ARMS', 'IMAGE', NULL, 180, CURRENT_TIMESTAMP),
('plank', 'Plancha', 'Plank', NULL, NULL, 'CORE', 'IMAGE', NULL, 190, CURRENT_TIMESTAMP),
('crunch', 'Crunch abdominal', 'Crunch', NULL, NULL, 'CORE', 'IMAGE', NULL, 200, CURRENT_TIMESTAMP);

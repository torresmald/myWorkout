-- CreateEnum
CREATE TYPE "WorkoutStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "status" "WorkoutStatus" NOT NULL DEFAULT 'PLANNED',
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "WorkoutSet" (
    "id" SERIAL NOT NULL,
    "workoutExerciseId" INTEGER NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkoutSet_workoutExerciseId_idx" ON "WorkoutSet"("workoutExerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutSet_workoutExerciseId_setNumber_key" ON "WorkoutSet"("workoutExerciseId", "setNumber");

-- AddForeignKey
ALTER TABLE "WorkoutSet" ADD CONSTRAINT "WorkoutSet_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "WorkoutExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

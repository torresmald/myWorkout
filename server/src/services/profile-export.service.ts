import { userPublicSelect } from '../constants/auth.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import { ErrorCode } from '../constants/error-codes.constants.js'
import type { UserDataExport } from '../interfaces/user-preferences.interface.js'
import { decimalToNumber } from '../utils/decimal.util.js'
import { ensureUserPreferences, mapPreferencesToPublic } from './user-preferences.service.js'

export async function exportUserData(userId: number): Promise<UserDataExport> {
  await ensureUserPreferences(userId)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...userPublicSelect,
      workouts: {
        select: { name: true, date: true, status: true },
        orderBy: { date: 'desc' },
      },
      exerciseTypes: {
        select: { name: true, muscleGroup: true },
        orderBy: { name: 'asc' },
      },
      weightEntries: {
        select: { weightKg: true, recordedAt: true },
        orderBy: { recordedAt: 'desc' },
      },
    },
  })

  if (!user) {
    throw new AppError(ErrorCode.USER_NOT_FOUND, 404)
  }

  return {
    exportedAt: new Date().toISOString(),
    profile: {
      email: user.email,
      name: user.name,
      heightCm: decimalToNumber(user.heightCm),
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    },
    preferences: mapPreferencesToPublic(user.preferences),
    weightEntries: user.weightEntries.map((entry) => ({
      weightKg: decimalToNumber(entry.weightKg) ?? 0,
      recordedAt: entry.recordedAt.toISOString(),
    })),
    exerciseTypes: user.exerciseTypes.map((exercise) => ({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
    })),
    workouts: user.workouts.map((workout) => ({
      name: workout.name,
      date: workout.date.toISOString(),
      status: workout.status,
    })),
  }
}

import type { UserRole } from '../interfaces/role.interface.js'
import { ErrorCode } from '../constants/error-codes.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'

export interface AdminMetrics {
  totalUsers: number
  verifiedUsers: number
  adminUsers: number
  totalWorkouts: number
  totalExerciseTypes: number
  totalWeightEntries: number
  totalCatalogExercises: number
}

export interface AdminUserSummary {
  id: number
  email: string
  name: string | null
  role: UserRole
  emailVerifiedAt: Date | null
  lastLoginAt: Date | null
  createdAt: Date
  workoutCount: number
}

export interface AdminUsersPage {
  users: AdminUserSummary[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const [
    totalUsers,
    verifiedUsers,
    adminUsers,
    totalWorkouts,
    totalExerciseTypes,
    totalWeightEntries,
    totalCatalogExercises,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { emailVerifiedAt: { not: null } } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.workout.count(),
    prisma.exerciseType.count(),
    prisma.weightEntry.count(),
    prisma.exerciseCatalog.count(),
  ])

  return {
    totalUsers,
    verifiedUsers,
    adminUsers,
    totalWorkouts,
    totalExerciseTypes,
    totalWeightEntries,
    totalCatalogExercises,
  }
}

export async function listAdminUsers(page = 1, pageSize = 20): Promise<AdminUsersPage> {
  const safePage = Math.max(1, page)
  const safePageSize = Math.min(50, Math.max(1, pageSize))
  const skip = (safePage - 1) * safePageSize

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: safePageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: { workouts: true },
        },
      },
    }),
    prisma.user.count(),
  ])

  return {
    users: users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      workoutCount: user._count.workouts,
    })),
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
  }
}

export async function updateUserRole(
  actorUserId: number,
  targetUserId: number,
  role: UserRole,
): Promise<AdminUserSummary> {
  if (targetUserId === actorUserId) {
    throw new AppError(ErrorCode.CANNOT_CHANGE_OWN_ROLE, 400)
  }

  if (role !== 'USER' && role !== 'ADMIN') {
    throw new AppError(ErrorCode.INVALID_ROLE, 400)
  }

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true },
  })

  if (!user) {
    throw new AppError(ErrorCode.USER_NOT_FOUND, 404)
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { role },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerifiedAt: true,
      lastLoginAt: true,
      createdAt: true,
      _count: {
        select: { workouts: true },
      },
    },
  })

  return {
    id: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role,
    emailVerifiedAt: updated.emailVerifiedAt,
    lastLoginAt: updated.lastLoginAt,
    createdAt: updated.createdAt,
    workoutCount: updated._count.workouts,
  }
}

import { prisma } from '../config/prisma.js'
import type { Decimal } from '@prisma/client/runtime/library'
import {
  MAX_HEIGHT_CM,
  MAX_NAME_LENGTH,
  MAX_WEIGHT_KG,
  MIN_HEIGHT_CM,
  MIN_WEIGHT_KG,
} from '../constants/profile.constants.js'
import { userPublicSelect } from '../constants/auth.constants.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type { AddWeightBody, UpdateProfileBody, UpdateWeightBody, UserProfile, WeightEntryPublic } from '../interfaces/profile.interface.js'
import { decimalToNumber } from '../utils/decimal.util.js'
import { mapUserToPublic } from '../utils/user-profile.util.js'

async function getLatestWeightKg(userId: number): Promise<number | null> {
  const entry = await prisma.weightEntry.findFirst({
    where: { userId },
    orderBy: { recordedAt: 'desc' },
    select: { weightKg: true },
  })

  return decimalToNumber(entry?.weightKg ?? null)
}

function mapWeightEntry(entry: {
  id: number
  weightKg: Decimal
  recordedAt: Date
}): WeightEntryPublic {
  return {
    id: entry.id,
    weightKg: decimalToNumber(entry.weightKg) ?? 0,
    recordedAt: entry.recordedAt,
  }
}

function validateName(name: string | undefined): string | null | undefined {
  if (name === undefined) {
    return undefined
  }

  const trimmed = name.trim()

  if (trimmed.length === 0) {
    return null
  }

  if (trimmed.length > MAX_NAME_LENGTH) {
    throw new AppError(`El nombre no puede superar ${MAX_NAME_LENGTH} caracteres`, 400)
  }

  return trimmed
}

function validateHeightCm(heightCm: number | null | undefined): number | null | undefined {
  if (heightCm === undefined) {
    return undefined
  }

  if (heightCm === null) {
    return null
  }

  if (!Number.isFinite(heightCm) || heightCm < MIN_HEIGHT_CM || heightCm > MAX_HEIGHT_CM) {
    throw new AppError(`La altura debe estar entre ${MIN_HEIGHT_CM} y ${MAX_HEIGHT_CM} cm`, 400)
  }

  return Number(heightCm.toFixed(1))
}

function validateWeightKg(weightKg: number | undefined): number {
  if (weightKg === undefined || !Number.isFinite(weightKg)) {
    throw new AppError('El peso es obligatorio', 400)
  }

  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    throw new AppError(`El peso debe estar entre ${MIN_WEIGHT_KG} y ${MAX_WEIGHT_KG} kg`, 400)
  }

  return Number(weightKg.toFixed(2))
}

function validateRecordedAt(recordedAt: string | undefined): Date | undefined {
  if (recordedAt === undefined) {
    return undefined
  }

  const trimmed = recordedAt.trim()

  if (!trimmed) {
    throw new AppError('La fecha es obligatoria', 400)
  }

  const parsed = new Date(trimmed)

  if (Number.isNaN(parsed.getTime())) {
    throw new AppError('Fecha inválida', 400)
  }

  return parsed
}

async function getWeightEntriesForUser(userId: number): Promise<WeightEntryPublic[]> {
  const weightEntries = await prisma.weightEntry.findMany({
    where: { userId },
    orderBy: { recordedAt: 'desc' },
    select: {
      id: true,
      weightKg: true,
      recordedAt: true,
    },
  })

  return weightEntries.map(mapWeightEntry)
}

async function buildWeightChangeResult(userId: number) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: userPublicSelect,
  })
  const latestWeightKg = await getLatestWeightKg(userId)
  const weightEntries = await getWeightEntriesForUser(userId)

  return {
    profile: mapUserToPublic(user, latestWeightKg),
    weightEntries,
  }
}

async function findWeightEntryForUser(userId: number, entryId: number) {
  const entry = await prisma.weightEntry.findFirst({
    where: {
      id: entryId,
      userId,
    },
  })

  if (!entry) {
    throw new AppError('Registro de peso no encontrado', 404)
  }

  return entry
}

export async function getUserProfile(userId: number): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userPublicSelect,
  })

  if (!user) {
    throw new AppError('Usuario no encontrado', 404)
  }

  const [latestWeightKg, weightEntries] = await Promise.all([
    getLatestWeightKg(userId),
    getWeightEntriesForUser(userId),
  ])

  return {
    ...mapUserToPublic(user, latestWeightKg),
    weightEntries,
  }
}

export async function updateUserProfile(userId: number, body: UpdateProfileBody) {
  const name = validateName(body.name)
  const heightCm = validateHeightCm(body.heightCm)

  if (name === undefined && heightCm === undefined) {
    throw new AppError('No hay datos para actualizar', 400)
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(heightCm !== undefined ? { heightCm } : {}),
    },
    select: userPublicSelect,
  })

  const latestWeightKg = await getLatestWeightKg(userId)
  return mapUserToPublic(user, latestWeightKg)
}

export async function addWeightEntry(userId: number, body: AddWeightBody) {
  const weightKg = validateWeightKg(body.weightKg)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })

  if (!user) {
    throw new AppError('Usuario no encontrado', 404)
  }

  const entry = await prisma.weightEntry.create({
    data: {
      userId,
      weightKg,
    },
    select: {
      id: true,
      weightKg: true,
      recordedAt: true,
    },
  })

  const result = await buildWeightChangeResult(userId)

  return {
    entry: mapWeightEntry(entry),
    ...result,
  }
}

export async function updateWeightEntry(userId: number, entryId: number, body: UpdateWeightBody) {
  await findWeightEntryForUser(userId, entryId)

  const weightKg = body.weightKg !== undefined ? validateWeightKg(body.weightKg) : undefined
  const recordedAt = validateRecordedAt(body.recordedAt)

  if (weightKg === undefined && recordedAt === undefined) {
    throw new AppError('No hay datos para actualizar', 400)
  }

  const entry = await prisma.weightEntry.update({
    where: { id: entryId },
    data: {
      ...(weightKg !== undefined ? { weightKg } : {}),
      ...(recordedAt !== undefined ? { recordedAt } : {}),
    },
    select: {
      id: true,
      weightKg: true,
      recordedAt: true,
    },
  })

  const result = await buildWeightChangeResult(userId)

  return {
    entry: mapWeightEntry(entry),
    ...result,
  }
}

export async function deleteWeightEntry(userId: number, entryId: number) {
  await findWeightEntryForUser(userId, entryId)

  await prisma.weightEntry.delete({
    where: { id: entryId },
  })

  return buildWeightChangeResult(userId)
}

export { getLatestWeightKg }

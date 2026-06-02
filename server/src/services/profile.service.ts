import { ErrorCode } from '../constants/error-codes.constants.js'
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
import { parseAppLocale } from '../utils/locale.util.js'
import { mapUserToPublic } from '../utils/user-profile.util.js'
import { normalizeSpotifyPlaylistUrl } from '../utils/spotify.util.js'

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
    throw new AppError(ErrorCode.NAME_MAX_LENGTH, 400, { max: MAX_NAME_LENGTH })
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
    throw new AppError(ErrorCode.HEIGHT_OUT_OF_RANGE, 400, { min: MIN_HEIGHT_CM, max: MAX_HEIGHT_CM })
  }

  return Number(heightCm.toFixed(1))
}

function validateWeightKg(weightKg: number | undefined): number {
  if (weightKg === undefined || !Number.isFinite(weightKg)) {
    throw new AppError(ErrorCode.WEIGHT_REQUIRED, 400)
  }

  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    throw new AppError(ErrorCode.WEIGHT_OUT_OF_RANGE, 400, { min: MIN_WEIGHT_KG, max: MAX_WEIGHT_KG })
  }

  return Number(weightKg.toFixed(2))
}

function validateRecordedAt(recordedAt: string | undefined): Date | undefined {
  if (recordedAt === undefined) {
    return undefined
  }

  const trimmed = recordedAt.trim()

  if (!trimmed) {
    throw new AppError(ErrorCode.DATE_REQUIRED, 400)
  }

  const parsed = new Date(trimmed)

  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(ErrorCode.INVALID_DATE, 400)
  }

  return parsed
}

function validateSpotifyPlaylistUrl(
  spotifyPlaylistUrl: string | null | undefined,
): string | null | undefined {
  if (spotifyPlaylistUrl === undefined) {
    return undefined
  }

  if (spotifyPlaylistUrl === null || !spotifyPlaylistUrl.trim()) {
    return null
  }

  const normalized = normalizeSpotifyPlaylistUrl(spotifyPlaylistUrl)

  if (!normalized) {
    throw new AppError(ErrorCode.INVALID_SPOTIFY_PLAYLIST_URL, 400)
  }

  return normalized
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
    throw new AppError(ErrorCode.WEIGHT_ENTRY_NOT_FOUND, 404)
  }

  return entry
}

export async function getUserProfile(userId: number): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userPublicSelect,
  })

  if (!user) {
    throw new AppError(ErrorCode.USER_NOT_FOUND, 404)
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

export async function updateUserProfile(userId: number, body: UpdateProfileBody): Promise<UserProfile> {
  const name = validateName(body.name)
  const heightCm = validateHeightCm(body.heightCm)
  const weightKg = body.weightKg !== undefined ? validateWeightKg(body.weightKg) : undefined
  const locale = body.locale !== undefined ? parseAppLocale(body.locale) : undefined
  const spotifyPlaylistUrl = validateSpotifyPlaylistUrl(body.spotifyPlaylistUrl)

  if (
    name === undefined &&
    heightCm === undefined &&
    weightKg === undefined &&
    locale === undefined &&
    spotifyPlaylistUrl === undefined
  ) {
    throw new AppError(ErrorCode.NO_DATA_TO_UPDATE, 400)
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })

  if (!user) {
    throw new AppError(ErrorCode.USER_NOT_FOUND, 404)
  }

  if (name !== undefined || heightCm !== undefined || locale !== undefined || spotifyPlaylistUrl !== undefined) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(heightCm !== undefined ? { heightCm } : {}),
        ...(locale !== undefined ? { locale } : {}),
        ...(spotifyPlaylistUrl !== undefined
          ? { spotifyPlaylistUrl, spotifyPlaylistName: null }
          : {}),
      },
    })
  }

  if (weightKg !== undefined) {
    const latestWeightKg = await getLatestWeightKg(userId)

    if (latestWeightKg === null || latestWeightKg !== weightKg) {
      await prisma.weightEntry.create({
        data: {
          userId,
          weightKg,
        },
      })
    }
  }

  return getUserProfile(userId)
}

export async function addWeightEntry(userId: number, body: AddWeightBody) {
  const weightKg = validateWeightKg(body.weightKg)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })

  if (!user) {
    throw new AppError(ErrorCode.USER_NOT_FOUND, 404)
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
    throw new AppError(ErrorCode.NO_DATA_TO_UPDATE, 400)
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

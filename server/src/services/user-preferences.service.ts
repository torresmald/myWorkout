import { ErrorCode } from '../constants/error-codes.constants.js'
import { prisma } from '../config/prisma.js'
import {
  THEME_MODES,
  WEIGHT_UNITS,
  defaultUserPreferences,
  type ThemeMode,
  type WeightUnit,
} from '../constants/user-preferences.constants.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type {
  UpdateUserPreferencesBody,
  UserPreferencesPublic,
} from '../interfaces/user-preferences.interface.js'
import { parseAppLocale } from '../utils/locale.util.js'
import { normalizeSpotifyPlaylistUrl } from '../utils/spotify.util.js'

type PreferencesRecord = {
  locale: string
  themeMode: string
  weightUnit: string
  allowAutoPlaylist: boolean
  restTimerSoundEnabled: boolean
  showPrToast: boolean
  confirmIncompleteFinish: boolean
  spotifyPlaylistUrl: string | null
  spotifyUserId: string | null
  spotifyDisplayName: string | null
  spotifyPlaylistName: string | null
}

function parseThemeMode(value: string | undefined): ThemeMode | undefined {
  if (value === undefined) {
    return undefined
  }

  if (!(THEME_MODES as readonly string[]).includes(value)) {
    throw new AppError(ErrorCode.INVALID_THEME_MODE, 400)
  }

  return value as ThemeMode
}

function parseWeightUnit(value: string | undefined): WeightUnit | undefined {
  if (value === undefined) {
    return undefined
  }

  if (!(WEIGHT_UNITS as readonly string[]).includes(value)) {
    throw new AppError(ErrorCode.INVALID_WEIGHT_UNIT, 400)
  }

  return value as WeightUnit
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

export function mapPreferencesToPublic(preferences: PreferencesRecord | null): UserPreferencesPublic {
  const prefs = preferences ?? defaultUserPreferences

  return {
    locale: parseAppLocale(prefs.locale),
    themeMode: parseThemeMode(prefs.themeMode) ?? 'system',
    weightUnit: parseWeightUnit(prefs.weightUnit) ?? 'kg',
    allowAutoPlaylist: prefs.allowAutoPlaylist,
    restTimerSoundEnabled: prefs.restTimerSoundEnabled,
    showPrToast: prefs.showPrToast,
    confirmIncompleteFinish: prefs.confirmIncompleteFinish,
    spotifyPlaylistUrl: prefs.spotifyPlaylistUrl,
    spotifyConnected: Boolean(prefs.spotifyUserId),
    spotifyDisplayName: prefs.spotifyDisplayName,
    spotifyPlaylistName: prefs.spotifyPlaylistName,
  }
}

export async function ensureUserPreferences(userId: number) {
  const existing = await prisma.userPreferences.findUnique({
    where: { userId },
  })

  if (existing) {
    return existing
  }

  return prisma.userPreferences.create({
    data: {
      userId,
    },
  })
}

export async function updateUserPreferences(
  userId: number,
  body: UpdateUserPreferencesBody,
): Promise<UserPreferencesPublic> {
  const locale = body.locale !== undefined ? parseAppLocale(body.locale) : undefined
  const themeMode = parseThemeMode(body.themeMode)
  const weightUnit = parseWeightUnit(body.weightUnit)
  const allowAutoPlaylist =
    body.allowAutoPlaylist !== undefined ? body.allowAutoPlaylist : undefined
  const restTimerSoundEnabled =
    body.restTimerSoundEnabled !== undefined ? body.restTimerSoundEnabled : undefined
  const showPrToast = body.showPrToast !== undefined ? body.showPrToast : undefined
  const confirmIncompleteFinish =
    body.confirmIncompleteFinish !== undefined ? body.confirmIncompleteFinish : undefined
  const spotifyPlaylistUrl = validateSpotifyPlaylistUrl(body.spotifyPlaylistUrl)

  if (
    locale === undefined &&
    themeMode === undefined &&
    weightUnit === undefined &&
    allowAutoPlaylist === undefined &&
    restTimerSoundEnabled === undefined &&
    showPrToast === undefined &&
    confirmIncompleteFinish === undefined &&
    spotifyPlaylistUrl === undefined
  ) {
    throw new AppError(ErrorCode.NO_DATA_TO_UPDATE, 400)
  }

  await ensureUserPreferences(userId)

  const updated = await prisma.userPreferences.update({
    where: { userId },
    data: {
      ...(locale !== undefined ? { locale } : {}),
      ...(themeMode !== undefined ? { themeMode } : {}),
      ...(weightUnit !== undefined ? { weightUnit } : {}),
      ...(allowAutoPlaylist !== undefined ? { allowAutoPlaylist } : {}),
      ...(restTimerSoundEnabled !== undefined ? { restTimerSoundEnabled } : {}),
      ...(showPrToast !== undefined ? { showPrToast } : {}),
      ...(confirmIncompleteFinish !== undefined ? { confirmIncompleteFinish } : {}),
      ...(spotifyPlaylistUrl !== undefined
        ? { spotifyPlaylistUrl, spotifyPlaylistName: null }
        : {}),
    },
    select: {
      locale: true,
      themeMode: true,
      weightUnit: true,
      allowAutoPlaylist: true,
      restTimerSoundEnabled: true,
      showPrToast: true,
      confirmIncompleteFinish: true,
      spotifyPlaylistUrl: true,
      spotifyUserId: true,
      spotifyDisplayName: true,
      spotifyPlaylistName: true,
    },
  })

  return mapPreferencesToPublic(updated)
}

import type { AppLocale } from '../constants/locale.constants.js'
import type { ThemeMode, WeightUnit } from '../constants/user-preferences.constants.js'

export interface UserPreferencesPublic {
  locale: AppLocale
  themeMode: ThemeMode
  weightUnit: WeightUnit
  allowAutoPlaylist: boolean
  restTimerSoundEnabled: boolean
  showPrToast: boolean
  confirmIncompleteFinish: boolean
  spotifyPlaylistUrl: string | null
  spotifyConnected: boolean
  spotifyDisplayName: string | null
  spotifyPlaylistName: string | null
}

export interface UpdateUserPreferencesBody {
  locale?: string
  themeMode?: string
  weightUnit?: string
  allowAutoPlaylist?: boolean
  restTimerSoundEnabled?: boolean
  showPrToast?: boolean
  confirmIncompleteFinish?: boolean
  spotifyPlaylistUrl?: string | null
}

export interface UserDataExport {
  exportedAt: string
  profile: {
    email: string
    name: string | null
    heightCm: number | null
    role: string
    createdAt: string
  }
  preferences: UserPreferencesPublic
  weightEntries: Array<{ weightKg: number; recordedAt: string }>
  exerciseTypes: Array<{ name: string; muscleGroup: string | null }>
  workouts: Array<{ name: string; date: string; status: string }>
}

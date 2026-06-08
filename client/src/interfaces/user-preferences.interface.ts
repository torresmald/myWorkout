import type { AppLocale } from '@/constants/locale.constants'
import type { ThemeMode } from '@/constants/theme.constants'
import type { WeightUnit } from '@/constants/weight-unit.constants'

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
  locale?: AppLocale
  themeMode?: ThemeMode
  weightUnit?: WeightUnit
  allowAutoPlaylist?: boolean
  restTimerSoundEnabled?: boolean
  showPrToast?: boolean
  confirmIncompleteFinish?: boolean
  spotifyPlaylistUrl?: string | null
}

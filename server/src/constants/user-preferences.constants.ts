export const THEME_MODES = ['light', 'dark', 'system'] as const
export const WEIGHT_UNITS = ['kg', 'lb'] as const

export type ThemeMode = (typeof THEME_MODES)[number]
export type WeightUnit = (typeof WEIGHT_UNITS)[number]

export const userPreferencesPublicSelect = {
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
} as const

export const userPreferencesReminderSelect = {
  locale: true,
  pushReminderEnabled: true,
  emailReminderEnabled: true,
  plannedWorkoutReminderEnabled: true,
  reminderDays: true,
  reminderTimeLocal: true,
  reminderTimezone: true,
  lastEmailReminderSentAt: true,
  lastPlannedEmailReminderSentAt: true,
} as const

export const userPreferencesSpotifySelect = {
  spotifyUserId: true,
  spotifyAccessToken: true,
  spotifyRefreshToken: true,
  spotifyTokenExpiresAt: true,
  spotifyDisplayName: true,
  spotifyPlaylistName: true,
  spotifyPlaylistUrl: true,
} as const

export const defaultUserPreferences = {
  locale: 'es',
  themeMode: 'system',
  weightUnit: 'kg',
  pushReminderEnabled: false,
  emailReminderEnabled: false,
  plannedWorkoutReminderEnabled: false,
  reminderDays: [],
  reminderTimeLocal: '18:00',
  reminderTimezone: 'UTC',
  allowAutoPlaylist: false,
  restTimerSoundEnabled: true,
  showPrToast: true,
  confirmIncompleteFinish: true,
  spotifyPlaylistUrl: null,
  spotifyUserId: null,
  spotifyDisplayName: null,
  spotifyPlaylistName: null,
} as const

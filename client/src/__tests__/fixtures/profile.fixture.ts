import type { UserProfile, WeightEntryPublic } from '@/interfaces/profile.interface'
import type { UserPublic } from '@/interfaces/auth.interface'

export function createWeightEntry(
  overrides: Partial<WeightEntryPublic> = {},
): WeightEntryPublic {
  return {
    id: 1,
    weightKg: 75,
    recordedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function createUserPublic(overrides: Partial<UserPublic> = {}): UserPublic {
  return {
    id: 1,
    email: 'user@example.com',
    name: 'Test User',
    role: 'USER',
    locale: 'es',
    themeMode: 'system',
    weightUnit: 'kg',
    createdAt: '2026-01-01T00:00:00.000Z',
    heightCm: 180,
    targetWeightKg: null,
    profileImageUrl: null,
    spotifyPlaylistUrl: null,
    allowAutoPlaylist: false,
    restTimerSoundEnabled: true,
    showPrToast: true,
    confirmIncompleteFinish: true,
    spotifyConnected: false,
    spotifyDisplayName: null,
    spotifyPlaylistName: null,
    latestWeightKg: 75,
    bmi: 23.1,
    bmiCategory: 'NORMAL',
    ...overrides,
  }
}

export function createUserProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    ...createUserPublic(),
    weightEntries: [createWeightEntry()],
    ...overrides,
  }
}

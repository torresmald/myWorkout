import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as spotifyApi from '@/api/spotify.api'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import type { UserProfile } from '@/interfaces/profile.interface'
import type { SpotifyConnectionPublic } from '@/interfaces/spotify.interface'
import { useAuthStore } from '@/stores/auth.store'
import { useProfileStore } from '@/stores/profile.store'
import { useSpotifyStore } from '@/stores/spotify.store'

vi.mock('@/api/spotify.api', () => ({
  getConnection: vi.fn(),
  getPlaylists: vi.fn(),
  getConnectUrl: vi.fn(),
  setWorkoutPlaylist: vi.fn(),
  disconnect: vi.fn(),
}))

vi.mock('@/api/profile.api', () => ({
  getProfile: vi.fn(),
}))

const mockConnection: SpotifyConnectionPublic = {
  connected: true,
  displayName: 'Test User',
  workoutPlaylistId: 'playlist-1',
  workoutPlaylistName: 'Workout Mix',
  workoutPlaylistUrl: 'https://open.spotify.com/playlist/1',
}

const mockProfile: UserProfile = {
  id: 1,
  email: 'user@example.com',
  name: 'Test User',
  role: 'USER',
  locale: 'es',
  createdAt: '2026-01-01T00:00:00.000Z',
  heightCm: null,
  profileImageUrl: null,
  spotifyPlaylistUrl: null,
  spotifyConnected: false,
  spotifyDisplayName: null,
  spotifyPlaylistName: null,
  latestWeightKg: null,
  bmi: null,
  bmiCategory: null,
  weightEntries: [],
}

describe('spotify store', () => {
  beforeEach(() => {
    setupTestPinia()
    vi.mocked(spotifyApi.getConnection).mockResolvedValue(mockConnection)
    vi.mocked(spotifyApi.getPlaylists).mockResolvedValue([
      { id: 'playlist-1', name: 'Workout Mix', url: 'https://example.com', imageUrl: null, trackCount: 10 },
    ])
    vi.mocked(spotifyApi.getConnectUrl).mockResolvedValue({ url: 'https://spotify.com/connect' })
    vi.mocked(spotifyApi.setWorkoutPlaylist).mockResolvedValue(mockConnection)
    vi.mocked(spotifyApi.disconnect).mockResolvedValue({
      ...mockConnection,
      connected: false,
      workoutPlaylistId: null,
      workoutPlaylistName: null,
      workoutPlaylistUrl: null,
    })
  })

  it('carga la conexión de Spotify', async () => {
    const store = useSpotifyStore()

    const connection = await store.fetchConnection()

    expect(connection).toEqual(mockConnection)
    expect(store.connection).toEqual(mockConnection)
    expect(store.loadingConnection).toBe(false)
  })

  it('carga las playlists de Spotify', async () => {
    const store = useSpotifyStore()

    const playlists = await store.fetchPlaylists()

    expect(playlists).toHaveLength(1)
    expect(store.loadingPlaylists).toBe(false)
  })

  it('redirige al flujo de conexión de Spotify', async () => {
    const store = useSpotifyStore()
    const locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
      href: '',
    } as Location)

    await store.startConnect()

    expect(window.location.href).toBe('https://spotify.com/connect')
    expect(store.connecting).toBe(false)
    locationSpy.mockRestore()
  })

  it('guarda la playlist de entrenamiento y sincroniza el perfil', async () => {
    const profileStore = useProfileStore()
    const authStore = useAuthStore()
    profileStore.profile = { ...mockProfile }
    authStore.setUser({ ...mockProfile })
    const fetchProfileSpy = vi.spyOn(profileStore, 'fetchProfile').mockResolvedValue(mockProfile)
    const store = useSpotifyStore()

    await store.saveWorkoutPlaylist('playlist-1')

    expect(spotifyApi.setWorkoutPlaylist).toHaveBeenCalledWith('playlist-1')
    expect(profileStore.profile?.spotifyConnected).toBe(true)
    expect(authStore.user?.spotifyConnected).toBe(true)
    expect(fetchProfileSpy).toHaveBeenCalled()
    expect(store.savingPlaylist).toBe(false)
  })

  it('desconecta la cuenta y limpia las playlists', async () => {
    const profileStore = useProfileStore()
    profileStore.profile = { ...mockProfile }
    vi.spyOn(profileStore, 'fetchProfile').mockResolvedValue(mockProfile)
    const store = useSpotifyStore()
    store.playlists = [{ id: 'playlist-1', name: 'Mix', url: 'https://example.com', imageUrl: null, trackCount: 1 }]

    await store.disconnectAccount()

    expect(store.playlists).toEqual([])
    expect(store.connection?.connected).toBe(false)
    expect(store.disconnecting).toBe(false)
  })

  it('no actualiza el perfil si no hay perfil cargado al guardar playlist', async () => {
    const store = useSpotifyStore()
    const profileStore = useProfileStore()
    vi.spyOn(profileStore, 'fetchProfile').mockResolvedValue(mockProfile)

    await store.saveWorkoutPlaylist('playlist-1')

    expect(profileStore.profile).toBeNull()
  })
})

import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createUserProfile } from '@/__tests__/fixtures/profile.fixture'
import { createSpotifyPlaylist } from '@/__tests__/fixtures/spotify.fixture'
import { profileRoutes } from '@/__tests__/helpers/test-routes'
import { mountWithPlugins, setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import * as profileApi from '@/api/profile.api'
import * as spotifyApi from '@/api/spotify.api'
import SpotifyWorkoutSettings from '@/components/profile/SpotifyWorkoutSettings.vue'
import { i18n } from '@/i18n'
import { useModalStore } from '@/stores/modal.store'
import { useProfileStore } from '@/stores/profile.store'
import { useSpotifyStore } from '@/stores/spotify.store'
import { useToastStore } from '@/stores/toast.store'

vi.mock('@/api/profile.api', () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  addWeight: vi.fn(),
  updateWeight: vi.fn(),
  deleteWeight: vi.fn(),
  uploadAvatar: vi.fn(),
  deleteAvatar: vi.fn(),
}))

vi.mock('@/api/spotify.api', () => ({
  getConnection: vi.fn(),
  getPlaylists: vi.fn(),
  getConnectUrl: vi.fn(),
  setWorkoutPlaylist: vi.fn(),
  disconnect: vi.fn(),
}))

describe('SpotifyWorkoutSettings', () => {
  beforeEach(() => {
    vi.mocked(profileApi.getProfile).mockResolvedValue(createUserProfile())
    vi.mocked(spotifyApi.getConnection).mockResolvedValue({
      connected: false,
      displayName: null,
      workoutPlaylistId: null,
      workoutPlaylistUrl: null,
      workoutPlaylistName: null,
    })
  })

  it('muestra botón de conectar cuando no hay conexión', async () => {
    const { wrapper } = await mountWithPlugins(SpotifyWorkoutSettings, { routes: profileRoutes })
    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('profile.spotify.connectButton'))
  })

  it('muestra datos conectados y playlists', async () => {
    vi.mocked(spotifyApi.getConnection).mockResolvedValue({
      connected: true,
      displayName: 'Spotify User',
      workoutPlaylistId: 'abc1234567890123456789',
      workoutPlaylistUrl: 'https://open.spotify.com/playlist/abc1234567890123456789',
      workoutPlaylistName: 'Workout Mix',
    })
    vi.mocked(spotifyApi.getPlaylists).mockResolvedValue([
      createSpotifyPlaylist({ id: 'abc1234567890123456789', name: 'Workout Mix', trackCount: 20 }),
    ])

    const { wrapper } = await mountWithPlugins(SpotifyWorkoutSettings, { routes: profileRoutes })
    await flushPromises()

    expect(wrapper.text()).toContain('Spotify User')
    expect(wrapper.find('#spotify-playlist-select').exists()).toBe(true)
  })

  it('procesa query spotify=connected al montar', async () => {
    const pinia = setupTestPinia()
    const toastStore = useToastStore(pinia)
    const successSpy = vi.spyOn(toastStore, 'success')

    await mountWithPlugins(SpotifyWorkoutSettings, {
      pinia,
      routes: profileRoutes,
      initialRoute: '/profile?spotify=connected',
    })

    await flushPromises()

    expect(successSpy).toHaveBeenCalled()
  })

  it('muestra error con query spotify=error', async () => {
    const pinia = setupTestPinia()
    const toastStore = useToastStore(pinia)
    const errorSpy = vi.spyOn(toastStore, 'error')

    await mountWithPlugins(SpotifyWorkoutSettings, {
      pinia,
      routes: profileRoutes,
      initialRoute: '/profile?spotify=error',
    })

    await flushPromises()

    expect(errorSpy).toHaveBeenCalledWith(i18n.global.t('profile.spotify.connectError'))
  })

  it('desconecta cuenta tras confirmación', async () => {
    vi.mocked(spotifyApi.getConnection).mockResolvedValue({
      connected: true,
      displayName: 'User',
      workoutPlaylistId: null,
      workoutPlaylistUrl: null,
      workoutPlaylistName: null,
    })
    vi.mocked(spotifyApi.disconnect).mockResolvedValue({
      connected: false,
      displayName: null,
      workoutPlaylistId: null,
      workoutPlaylistUrl: null,
      workoutPlaylistName: null,
    })

    const { pinia, wrapper } = await mountWithPlugins(SpotifyWorkoutSettings, {
      routes: profileRoutes,
    })
    const modalStore = useModalStore(pinia)
    vi.spyOn(modalStore, 'confirm').mockResolvedValue(true)

    await flushPromises()
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(spotifyApi.disconnect).toHaveBeenCalled()
  })

  it('guarda playlist seleccionada', async () => {
    vi.mocked(spotifyApi.getConnection).mockResolvedValue({
      connected: true,
      displayName: 'User',
      workoutPlaylistId: null,
      workoutPlaylistUrl: null,
      workoutPlaylistName: null,
    })
    vi.mocked(spotifyApi.getPlaylists).mockResolvedValue([
      createSpotifyPlaylist({ id: 'abc1234567890123456789', name: 'Mix', trackCount: 10 }),
    ])
    vi.mocked(spotifyApi.setWorkoutPlaylist).mockResolvedValue({
      connected: true,
      displayName: 'User',
      workoutPlaylistId: 'abc1234567890123456789',
      workoutPlaylistUrl: 'https://open.spotify.com/playlist/abc1234567890123456789',
      workoutPlaylistName: 'Mix',
    })

    const { wrapper } = await mountWithPlugins(SpotifyWorkoutSettings, { routes: profileRoutes })
    await flushPromises()

    await wrapper.find('#spotify-playlist-select').setValue('abc1234567890123456789')
    const saveButtons = wrapper.findAll('button').filter((b) =>
      b.text().includes(i18n.global.t('profile.spotify.savePlaylistButton')),
    )
    await saveButtons[0]!.trigger('click')
    await flushPromises()

    expect(spotifyApi.setWorkoutPlaylist).toHaveBeenCalledWith('abc1234567890123456789')
  })

  it('guarda URL manual de playlist', async () => {
    const profile = createUserProfile({ spotifyPlaylistUrl: null })
    vi.mocked(profileApi.getProfile).mockResolvedValue(profile)
    vi.mocked(profileApi.updateProfile).mockResolvedValue({
      ...profile,
      spotifyPlaylistUrl: 'https://open.spotify.com/playlist/new123456789012345678',
    })

    const { wrapper } = await mountWithPlugins(SpotifyWorkoutSettings, { routes: profileRoutes })
    const profileStore = useProfileStore()
    await profileStore.fetchProfile()
    await flushPromises()

    await wrapper.find('#spotify-playlist-url').setValue(
      'https://open.spotify.com/playlist/new123456789012345678',
    )
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(profileApi.updateProfile).toHaveBeenCalled()
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/api/client'
import * as spotifyApi from '@/api/spotify.api'

vi.mock('@/api/client', () => ({
  api: vi.fn(),
}))

describe('spotify.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getConnectUrl obtiene URL de conexión', async () => {
    vi.mocked(api).mockResolvedValue({ url: 'https://spotify.test/connect' })

    await spotifyApi.getConnectUrl()

    expect(api).toHaveBeenCalledWith('/spotify/connect-url')
  })

  it('getConnection obtiene estado de conexión', async () => {
    vi.mocked(api).mockResolvedValue({ connected: true })

    await spotifyApi.getConnection()

    expect(api).toHaveBeenCalledWith('/spotify/connection')
  })

  it('getPlaylists obtiene playlists', async () => {
    vi.mocked(api).mockResolvedValue([])

    await spotifyApi.getPlaylists()

    expect(api).toHaveBeenCalledWith('/spotify/playlists')
  })

  it('setWorkoutPlaylist asigna playlist de entrenamiento', async () => {
    vi.mocked(api).mockResolvedValue({})

    await spotifyApi.setWorkoutPlaylist('playlist-123')

    expect(api).toHaveBeenCalledWith('/spotify/workout-playlist', {
      method: 'PUT',
      body: JSON.stringify({ playlistId: 'playlist-123' }),
    })
  })

  it('disconnect desconecta Spotify', async () => {
    vi.mocked(api).mockResolvedValue({})

    await spotifyApi.disconnect()

    expect(api).toHaveBeenCalledWith('/spotify/disconnect', {
      method: 'DELETE',
    })
  })
})

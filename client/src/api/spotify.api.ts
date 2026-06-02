import { api } from '@/api/client'
import type { SpotifyConnectionPublic, SpotifyPlaylistPublic } from '@/interfaces/spotify.interface'

export function getConnectUrl() {
  return api<{ url: string }>('/spotify/connect-url')
}

export function getConnection() {
  return api<SpotifyConnectionPublic>('/spotify/connection')
}

export function getPlaylists() {
  return api<SpotifyPlaylistPublic[]>('/spotify/playlists')
}

export function setWorkoutPlaylist(playlistId: string) {
  return api<SpotifyConnectionPublic>('/spotify/workout-playlist', {
    method: 'PUT',
    body: JSON.stringify({ playlistId }),
  })
}

export function disconnect() {
  return api<SpotifyConnectionPublic>('/spotify/disconnect', {
    method: 'DELETE',
  })
}

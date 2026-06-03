import type { SpotifyPlaylistPublic } from '@/interfaces/spotify.interface'

export function createSpotifyPlaylist(
  overrides: Partial<SpotifyPlaylistPublic> = {},
): SpotifyPlaylistPublic {
  return {
    id: 'playlist-1',
    name: 'Workout Mix',
    url: 'https://open.spotify.com/playlist/playlist-1',
    imageUrl: null,
    trackCount: 42,
    ...overrides,
  }
}

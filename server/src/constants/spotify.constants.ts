export const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID?.trim() ?? ''
export const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET?.trim() ?? ''
export const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI?.trim() ?? ''

export const SPOTIFY_SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-read-private',
] as const

export const SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize'
export const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
export const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1'

export const SPOTIFY_OAUTH_STATE_TTL = '10m'

export function isSpotifyConfigured(): boolean {
  return Boolean(SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET && SPOTIFY_REDIRECT_URI)
}

export function assertSpotifyConfigured(): void {
  if (!isSpotifyConfigured()) {
    throw new Error('Spotify OAuth is not configured')
  }
}

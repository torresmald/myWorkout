export interface SpotifyOAuthStatePayload {
  userId: number
  purpose: 'spotify_oauth'
}

export interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope?: string
}

export interface SpotifyUserProfileResponse {
  id: string
  display_name: string | null
}

export interface SpotifyPlaylistItemResponse {
  id: string
  name: string
  tracks: {
    total: number
  }
  external_urls: {
    spotify: string
  }
  images: Array<{
    url: string
  }>
}

export interface SpotifyPlaylistsResponse {
  items: SpotifyPlaylistItemResponse[]
}

export interface SpotifyPlaylistPublic {
  id: string
  name: string
  url: string
  imageUrl: string | null
  trackCount: number
}

export interface SpotifyConnectionPublic {
  connected: boolean
  displayName: string | null
  workoutPlaylistId: string | null
  workoutPlaylistName: string | null
  workoutPlaylistUrl: string | null
}

export interface SetSpotifyWorkoutPlaylistBody {
  playlistId?: string
}

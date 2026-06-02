export interface SpotifyConnectionPublic {
  connected: boolean
  displayName: string | null
  workoutPlaylistId: string | null
  workoutPlaylistName: string | null
  workoutPlaylistUrl: string | null
}

export interface SpotifyPlaylistPublic {
  id: string
  name: string
  url: string
  imageUrl: string | null
  trackCount: number
}

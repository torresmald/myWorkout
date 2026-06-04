import type { UserPublic } from '@/interfaces/auth.interface'

import { openSpotifyPlaylist } from './spotify.util'

type WorkoutPlaylistUser = Pick<UserPublic, 'allowAutoPlaylist' | 'spotifyPlaylistUrl'> | null | undefined

export function shouldAutoOpenWorkoutPlaylist(user: WorkoutPlaylistUser): boolean {
  return Boolean(user?.allowAutoPlaylist && user.spotifyPlaylistUrl)
}

export function tryAutoOpenWorkoutPlaylist(user: WorkoutPlaylistUser): boolean {
  const playlistUrl = user?.spotifyPlaylistUrl

  if (!shouldAutoOpenWorkoutPlaylist(user) || !playlistUrl) {
    return false
  }

  openSpotifyPlaylist(playlistUrl)
  return true
}

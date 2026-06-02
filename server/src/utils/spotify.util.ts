const SPOTIFY_PLAYLIST_URI_REGEX = /^spotify:playlist:([a-zA-Z0-9]{22})$/
const SPOTIFY_PLAYLIST_URL_REGEX =
  /^https:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?playlist\/([a-zA-Z0-9]{22})(?:\?.*)?$/

export function parseSpotifyPlaylistId(input: string): string | null {
  const trimmed = input.trim()

  if (!trimmed) {
    return null
  }

  const uriMatch = trimmed.match(SPOTIFY_PLAYLIST_URI_REGEX)
  if (uriMatch?.[1]) {
    return uriMatch[1]
  }

  const urlMatch = trimmed.match(SPOTIFY_PLAYLIST_URL_REGEX)
  if (urlMatch?.[1]) {
    return urlMatch[1]
  }

  return null
}

export function buildSpotifyPlaylistUrl(playlistId: string): string {
  return `https://open.spotify.com/playlist/${playlistId}`
}

export function normalizeSpotifyPlaylistUrl(input: string): string | null {
  const playlistId = parseSpotifyPlaylistId(input)

  if (!playlistId) {
    return null
  }

  return buildSpotifyPlaylistUrl(playlistId)
}

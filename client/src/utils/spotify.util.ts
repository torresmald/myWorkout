export function openSpotifyPlaylist(url: string): void {
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function parseSpotifyPlaylistIdFromUrl(url: string): string | null {
  const match = url.match(/playlist\/([a-zA-Z0-9]{22})/)
  return match?.[1] ?? null
}

export function buildSpotifyAppUrl(webUrl: string): string {
  const playlistId = parseSpotifyPlaylistIdFromUrl(webUrl)
  return playlistId ? `https://open.spotify.com/playlist/${playlistId}` : webUrl
}

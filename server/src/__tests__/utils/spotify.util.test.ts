import { describe, expect, it } from 'vitest'

import {
  buildSpotifyPlaylistUrl,
  normalizeSpotifyPlaylistUrl,
  parseSpotifyPlaylistId,
} from '../../utils/spotify.util.js'

const PLAYLIST_ID = '37i9dQZF1DXcBWIGoYBM5M'

describe('spotify.util', () => {
  it('extrae id desde URI o URL', () => {
    expect(parseSpotifyPlaylistId(`spotify:playlist:${PLAYLIST_ID}`)).toBe(PLAYLIST_ID)
    expect(parseSpotifyPlaylistId(`https://open.spotify.com/playlist/${PLAYLIST_ID}`)).toBe(
      PLAYLIST_ID,
    )
    expect(
      parseSpotifyPlaylistId(
        `https://open.spotify.com/intl-es/playlist/${PLAYLIST_ID}?si=abc`,
      ),
    ).toBe(PLAYLIST_ID)
  })

  it('rechaza entradas inválidas', () => {
    expect(parseSpotifyPlaylistId('')).toBeNull()
    expect(parseSpotifyPlaylistId('https://example.com')).toBeNull()
  })

  it('normaliza y construye URLs canónicas', () => {
    expect(normalizeSpotifyPlaylistUrl(`spotify:playlist:${PLAYLIST_ID}`)).toBe(
      buildSpotifyPlaylistUrl(PLAYLIST_ID),
    )
  })
})

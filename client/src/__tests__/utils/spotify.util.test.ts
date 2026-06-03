import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  buildSpotifyAppUrl,
  openSpotifyPlaylist,
  parseSpotifyPlaylistIdFromUrl,
} from '@/utils/spotify.util'

describe('spotify.util', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('extrae el id de playlist de una URL web', () => {
    const url = 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=abc'

    expect(parseSpotifyPlaylistIdFromUrl(url)).toBe('37i9dQZF1DXcBWIGoYBM5M')
  })

  it('devuelve null cuando la URL no contiene playlist', () => {
    expect(parseSpotifyPlaylistIdFromUrl('https://open.spotify.com/track/abc')).toBeNull()
  })

  it('construye URL de app con id limpio', () => {
    const webUrl = 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M'

    expect(buildSpotifyAppUrl(webUrl)).toBe(
      'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    )
  })

  it('devuelve la URL original si no puede parsear el id', () => {
    const url = 'https://example.com/playlist'

    expect(buildSpotifyAppUrl(url)).toBe(url)
  })

  it('abre la playlist en una nueva pestaña', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    openSpotifyPlaylist('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M')

    expect(click).toHaveBeenCalled()
    click.mockRestore()
  })
})

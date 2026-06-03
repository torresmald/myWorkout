import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import SpotifyPlayCard from '@/components/spotify/SpotifyPlayCard.vue'
import { i18n } from '@/i18n'
import * as spotifyUtil from '@/utils/spotify.util'

vi.mock('@/utils/spotify.util', () => ({
  openSpotifyPlaylist: vi.fn(),
}))

describe('SpotifyPlayCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra tarjeta con playlist y reproduce al pulsar play', async () => {
    const { wrapper } = await mountWithPlugins(SpotifyPlayCard, {
      props: {
        playlistUrl: 'https://open.spotify.com/playlist/abc1234567890123456789',
        playlistName: 'Workout Mix',
        variant: 'card',
      },
    })

    expect(wrapper.text()).toContain('Workout Mix')
    expect(wrapper.text()).toContain(i18n.global.t('spotify.playCard.playHint'))

    await wrapper.find('button').trigger('click')
    expect(spotifyUtil.openSpotifyPlaylist).toHaveBeenCalledWith(
      'https://open.spotify.com/playlist/abc1234567890123456789',
    )
  })

  it('muestra mensaje genérico cuando hay URL pero no nombre', async () => {
    const { wrapper } = await mountWithPlugins(SpotifyPlayCard, {
      props: {
        playlistUrl: 'https://open.spotify.com/playlist/abc1234567890123456789',
        variant: 'card',
      },
    })

    expect(wrapper.text()).toContain(i18n.global.t('spotify.playCard.playlistReady'))
  })

  it('muestra enlace de configuración sin playlist en variante card', async () => {
    const { wrapper } = await mountWithPlugins(SpotifyPlayCard, {
      props: { playlistUrl: null, variant: 'card' },
    })

    expect(wrapper.text()).toContain(i18n.global.t('spotify.playCard.noPlaylist'))
    expect(wrapper.find('a').attributes('href')).toBe('/profile')
  })

  it('renderiza botón compacto cuando hay playlist', async () => {
    const { wrapper } = await mountWithPlugins(SpotifyPlayCard, {
      props: {
        playlistUrl: 'https://open.spotify.com/playlist/abc1234567890123456789',
        variant: 'compact',
      },
    })

    expect(wrapper.find('button').text()).toContain(i18n.global.t('spotify.playCard.playButton'))
    await wrapper.find('button').trigger('click')
    expect(spotifyUtil.openSpotifyPlaylist).toHaveBeenCalled()
  })

  it('no renderiza botón compacto sin playlist', async () => {
    const { wrapper } = await mountWithPlugins(SpotifyPlayCard, {
      props: { playlistUrl: null, variant: 'compact' },
    })

    expect(wrapper.find('button').exists()).toBe(false)
  })
})

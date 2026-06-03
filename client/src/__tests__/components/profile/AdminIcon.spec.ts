import { describe, expect, it } from 'vitest'

import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import AdminIcon from '@/components/profile/AdminIcon.vue'
import { i18n } from '@/i18n'

describe('AdminIcon', () => {
  it('renderiza el SVG sin tooltip por defecto', async () => {
    const { wrapper } = await mountWithPlugins(AdminIcon)

    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true')
  })

  it('muestra tooltip cuando se proporciona', async () => {
    const tooltip = i18n.global.t('admin.goToAdmin')
    const { wrapper } = await mountWithPlugins(AdminIcon, {
      props: { tooltip, size: 32, position: 'bottom' },
    })

    expect(wrapper.find('svg').attributes('aria-label')).toBe(tooltip)
  })
})

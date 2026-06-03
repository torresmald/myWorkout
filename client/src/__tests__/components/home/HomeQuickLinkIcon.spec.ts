import { describe, expect, it } from 'vitest'

import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import HomeQuickLinkIcon from '@/components/home/HomeQuickLinkIcon.vue'
import type { HomeQuickLinkIcon as HomeQuickLinkIconType } from '@/constants/home.constants'

const icons: HomeQuickLinkIconType[] = ['dumbbell', 'chart', 'list', 'user']

describe('HomeQuickLinkIcon', () => {
  it.each(icons)('renderiza el icono "%s"', async (icon) => {
    const { wrapper } = await mountWithPlugins(HomeQuickLinkIcon, {
      props: { icon },
    })

    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true)
  })
})

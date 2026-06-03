import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { useHomeQuickLinks } from '@/composables/useHomeQuickLinks'
import { HOME_QUICK_LINKS } from '@/constants/home.constants'
import { i18n } from '@/i18n'

function mountHomeQuickLinks() {
  let quickLinks!: ReturnType<typeof useHomeQuickLinks>

  const TestComponent = defineComponent({
    setup() {
      quickLinks = useHomeQuickLinks()
      return { quickLinks }
    },
    template: '<div />',
  })

  mount(TestComponent, {
    global: {
      plugins: [i18n],
    },
  })

  return quickLinks
}

describe('useHomeQuickLinks', () => {
  it('devuelve enlaces rápidos con etiquetas y descripciones traducidas', () => {
    const quickLinks = mountHomeQuickLinks()
    const links = quickLinks.value

    expect(links).toHaveLength(HOME_QUICK_LINKS.length)

    for (const [index, link] of links.entries()) {
      const source = HOME_QUICK_LINKS[index]!

      expect(link.to).toBe(source.to)
      expect(link.icon).toBe(source.icon)
      expect(link.label).toBe(i18n.global.t(source.labelKey))
      expect(link.description).toBe(i18n.global.t(source.descriptionKey))
    }
  })
})

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { useNavItems } from '@/composables/useNavItems'
import { NAV_ITEMS } from '@/constants/nav.constants'
import { i18n } from '@/i18n'

function mountNavItems() {
  let navItems!: ReturnType<typeof useNavItems>

  const TestComponent = defineComponent({
    setup() {
      navItems = useNavItems()
      return { navItems }
    },
    template: '<div />',
  })

  mount(TestComponent, {
    global: {
      plugins: [i18n],
    },
  })

  return navItems
}

describe('useNavItems', () => {
  it('devuelve los ítems de navegación con etiquetas traducidas', () => {
    const navItems = mountNavItems()
    const items = navItems.value

    expect(items).toHaveLength(NAV_ITEMS.length)

    for (const [index, item] of items.entries()) {
      expect(item.routeName).toBe(NAV_ITEMS[index]?.routeName)
      expect(item.to).toBe(NAV_ITEMS[index]?.to)
      expect(item.label).toBe(i18n.global.t(NAV_ITEMS[index]!.labelKey))
    }
  })
})

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import { i18n } from '@/i18n'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'

describe('ThemeToggle', () => {
  it('renderiza ThemeToggleFlag', () => {
    const pinia = setupTestPinia()

    const wrapper = mount(ThemeToggle, {
      global: { plugins: [pinia, i18n] },
    })

    expect(wrapper.find('.theme-toggle__scene').exists()).toBe(true)
  })
})

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import LanguageToggle from '@/components/ui/LanguageToggle.vue'
import { i18n } from '@/i18n'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'

describe('LanguageToggle', () => {
  it('renderiza LanguageToggleFlag', () => {
    const pinia = setupTestPinia()

    const wrapper = mount(LanguageToggle, {
      global: { plugins: [pinia, i18n] },
    })

    expect(wrapper.find('.language-toggle__scene').exists()).toBe(true)
  })
})

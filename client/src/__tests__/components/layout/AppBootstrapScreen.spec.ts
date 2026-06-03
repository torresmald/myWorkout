import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import AppBootstrapScreen from '@/components/layout/AppBootstrapScreen.vue'
import { i18n } from '@/i18n'

describe('AppBootstrapScreen', () => {
  it('muestra el mensaje de carga de sesión al usuario', () => {
    const wrapper = mount(AppBootstrapScreen, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    expect(wrapper.text()).toContain(i18n.global.t('app.bootstrap.message'))
    expect(wrapper.text()).toContain(i18n.global.t('app.bootstrap.hint'))
  })
})

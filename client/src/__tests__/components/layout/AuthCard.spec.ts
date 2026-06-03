import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import AuthCard from '@/components/layout/AuthCard.vue'

describe('AuthCard', () => {
  it('muestra título, descripción y slot', () => {
    const wrapper = mount(AuthCard, {
      props: {
        title: 'Iniciar sesión',
        description: 'Accede a tu cuenta',
      },
      slots: { default: '<input data-testid="form-field" />' },
    })

    expect(wrapper.find('h1').text()).toBe('Iniciar sesión')
    expect(wrapper.text()).toContain('Accede a tu cuenta')
    expect(wrapper.find('[data-testid="form-field"]').exists()).toBe(true)
  })

  it('muestra overlay de carga con mensaje por defecto', () => {
    const wrapper = mount(AuthCard, {
      props: {
        title: 'Registro',
        description: 'Crea tu cuenta',
        loading: true,
      },
    })

    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Procesando...')
  })

  it('muestra mensaje de carga personalizado', () => {
    const wrapper = mount(AuthCard, {
      props: {
        title: 'Registro',
        description: 'Crea tu cuenta',
        loading: true,
        loadingMessage: 'Guardando...',
      },
    })

    expect(wrapper.text()).toContain('Guardando...')
  })

  it('aplica variante glass', () => {
    const wrapper = mount(AuthCard, {
      props: {
        title: 'Login',
        description: 'Desc',
        variant: 'glass',
      },
    })

    expect(wrapper.find('.backdrop-blur-xl').exists()).toBe(true)
  })
})

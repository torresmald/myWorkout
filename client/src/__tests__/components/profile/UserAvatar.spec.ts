import { describe, expect, it } from 'vitest'

import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import UserAvatar from '@/components/profile/UserAvatar.vue'

describe('UserAvatar', () => {
  it('muestra iniciales cuando no hay imagen', async () => {
    const { wrapper } = await mountWithPlugins(UserAvatar, {
      props: { email: 'john.doe@example.com', name: 'John Doe', size: 'sm' },
    })

    expect(wrapper.text()).toContain('JD')
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('muestra imagen con cache buster cuando hay URL y cacheKey', async () => {
    const { wrapper } = await mountWithPlugins(UserAvatar, {
      props: {
        email: 'user@example.com',
        name: 'User',
        imageUrl: 'https://example.com/avatar.jpg',
        cacheKey: 12345,
        size: 'lg',
      },
    })

    const src = wrapper.find('img').attributes('src')
    expect(src).toContain('https://example.com/avatar.jpg')
    expect(src).toContain('12345')
  })

  it('usa primera letra del email si no hay nombre', async () => {
    const { wrapper } = await mountWithPlugins(UserAvatar, {
      props: { email: 'alice@example.com', size: 'md' },
    })

    expect(wrapper.text()).toContain('A')
  })
})

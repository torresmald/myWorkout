import { defineComponent } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'

import { useAuthRedirect } from '@/composables/useAuthRedirect'

function mountAuthRedirect(initialPath: string) {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/login', name: 'login', component: { template: '<div />' } },
      { path: '/workouts', name: 'workouts', component: { template: '<div />' } },
    ],
  })

  let redirectAfterAuth!: () => Promise<void>

  const TestComponent = defineComponent({
    setup() {
      const authRedirect = useAuthRedirect()
      redirectAfterAuth = authRedirect.redirectAfterAuth
      return {}
    },
    template: '<div />',
  })

  mount(TestComponent, {
    global: {
      plugins: [router],
    },
  })

  return { router, redirectAfterAuth: () => redirectAfterAuth() }
}

describe('useAuthRedirect', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('redirige a la ruta del query redirect cuando es válida', async () => {
    const { router, redirectAfterAuth } = mountAuthRedirect('/login?redirect=/workouts')

    await router.push('/login?redirect=/workouts')
    await router.isReady()
    await redirectAfterAuth()
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/workouts')
  })

  it('redirige a home cuando redirect no es string', async () => {
    const { router, redirectAfterAuth } = mountAuthRedirect('/login')

    await router.push({ path: '/login', query: { redirect: ['a', 'b'] } })
    await router.isReady()
    await redirectAfterAuth()
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('redirige a home cuando redirect no empieza por /', async () => {
    const { router, redirectAfterAuth } = mountAuthRedirect('/login')

    await router.push('/login?redirect=https://evil.com')
    await router.isReady()
    await redirectAfterAuth()
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('redirige a home cuando redirect es protocol-relative', async () => {
    const { router, redirectAfterAuth } = mountAuthRedirect('/login')

    await router.push('/login?redirect=//evil.com')
    await router.isReady()
    await redirectAfterAuth()
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('redirige a home cuando no hay query redirect', async () => {
    const { router, redirectAfterAuth } = mountAuthRedirect('/login')

    await router.push('/login')
    await router.isReady()
    await redirectAfterAuth()
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/')
  })
})

import { mount, type Stubs, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import type { Component } from 'vue'
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type Router,
} from 'vue-router'

import { coreRoutes } from '@/__tests__/helpers/test-routes'
import { i18n } from '@/i18n'

export function setupTestPinia(): Pinia {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

function normalizePath(path: string): string {
  return path.split('?')[0] ?? path
}

function routeExists(routes: RouteRecordRaw[], path: string): boolean {
  const normalizedPath = normalizePath(path)

  return routes.some((route) => {
    if (route.path === normalizedPath) {
      return true
    }

    if (!route.path.includes(':')) {
      return false
    }

    const pattern = route.path.replace(/:[^/]+/g, '[^/]+')
    return new RegExp(`^${pattern}$`).test(normalizedPath)
  })
}

function resolveInitialLocation(routes: RouteRecordRaw[], preferred?: string): string {
  if (preferred && routeExists(routes, preferred)) {
    return preferred
  }

  if (routes.some((route) => route.path === '/')) {
    return '/'
  }

  return routes[0]?.path ?? '/'
}

export function createTestRouter(routes: RouteRecordRaw[] = coreRoutes): Router {
  return createRouter({
    history: createWebHistory(),
    routes,
  })
}

export const chartComponentStubs = {
  Line: { template: '<canvas data-testid="line-chart" />' },
  Bar: { template: '<canvas data-testid="bar-chart" />' },
}

interface MountWithPluginsOptions {
  pinia?: Pinia
  routes?: RouteRecordRaw[]
  initialRoute?: string
  props?: Record<string, unknown>
  attachTo?: HTMLElement
  stubs?: Stubs
}

export async function mountWithPlugins(
  component: Component,
  options: MountWithPluginsOptions = {},
): Promise<{ pinia: Pinia; router: Router; wrapper: VueWrapper }> {
  const pinia = options.pinia ?? setupTestPinia()
  const routes = options.routes ?? coreRoutes
  const router = createTestRouter(routes)

  await prepareTestRouter(router, routes, options.initialRoute)

  const wrapper = mount(component, {
    props: options.props,
    attachTo: options.attachTo,
    global: {
      plugins: [pinia, router, i18n],
      stubs: options.stubs,
    },
  })

  await router.isReady()

  return { pinia, router, wrapper }
}

export async function prepareTestRouter(
  router: Router,
  routes: RouteRecordRaw[],
  initialRoute?: string,
): Promise<void> {
  await router.push(resolveInitialLocation(routes, initialRoute))
  await router.isReady()
}

export async function navigateTo(router: Router, path: string): Promise<void> {
  await router.push(path)
  await router.isReady()
}

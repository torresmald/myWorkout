import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import type { Component } from 'vue'
import { createRouter, createWebHistory, type RouteRecordRaw, type Router } from 'vue-router'

import { i18n } from '@/i18n'

const defaultRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: { template: '<div data-testid="home-view" />' },
  },
  {
    path: '/exercise-catalog',
    name: 'exercise-catalog',
    component: { template: '<div />' },
    meta: {
      titleKey: 'routes.exerciseCatalog.title',
      pageDescriptionKey: 'routes.exerciseCatalog.description',
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: { template: '<div data-testid="profile-view" />' },
  },
  {
    path: '/workouts',
    name: 'workouts',
    component: { template: '<div data-testid="workouts-view" />' },
  },
  {
    path: '/exercise-types',
    name: 'exercise-types',
    component: { template: '<div />' },
  },
  {
    path: '/cookies',
    name: 'cookies',
    component: { template: '<div />' },
  },
]

export function setupTestPinia(): Pinia {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

export function createTestRouter(routes: RouteRecordRaw[] = defaultRoutes): Router {
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
  stubs?: Record<string, unknown | boolean>
}

export async function mountWithPlugins(
  component: Component,
  options: MountWithPluginsOptions = {},
): Promise<{ pinia: Pinia; router: Router; wrapper: VueWrapper }> {
  const pinia = options.pinia ?? setupTestPinia()
  const router = createTestRouter(options.routes)

  if (options.initialRoute) {
    await router.push(options.initialRoute)
    await router.isReady()
  }

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

export async function navigateTo(router: Router, path: string): Promise<void> {
  await router.push(path)
  await router.isReady()
}

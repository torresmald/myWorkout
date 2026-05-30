<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { NAV_ITEMS } from '@/constants/nav.constants'
import { APP_NAME } from '@/constants/app.constants'
import { BTN_GHOST_CLASS } from '@/constants/ui.constants'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()
const { user } = storeToRefs(authStore)

function isActive(routeName: string): boolean {
  return route.name === routeName
}

function linkClasses(active: boolean): string {
  return active
    ? 'bg-blue-50 text-blue-700'
    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
}

async function handleLogout() {
  authStore.logout()
  toastStore.success('Sesión cerrada')
  await router.push('/login')
}
</script>

<template>
  <header class="border-b border-gray-200 bg-white shadow-sm">
    <div
      class="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0 sm:h-14"
    >
      <RouterLink to="/" class="text-lg font-bold text-gray-900 transition hover:text-blue-700">
        {{ APP_NAME }}
      </RouterLink>

      <nav class="flex flex-wrap items-center gap-1">
        <RouterLink
          v-for="item in NAV_ITEMS"
          :key="item.routeName"
          :to="item.to"
          class="rounded-lg px-3 py-2 text-sm font-medium transition"
          :class="linkClasses(isActive(item.routeName))"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="flex items-center gap-3 sm:shrink-0">
        <span class="truncate text-sm text-gray-600">{{ user?.email }}</span>
        <button type="button" :class="BTN_GHOST_CLASS" @click="handleLogout">
          Salir
        </button>
      </div>
    </div>
  </header>
</template>

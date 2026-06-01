<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import UserAvatar from '@/components/profile/UserAvatar.vue'
import { NAV_ITEMS } from '@/constants/nav.constants'
import { APP_NAME } from '@/constants/app.constants'
import { BTN_DANGER_CLASS } from '@/constants/ui.constants'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()
const { user } = storeToRefs(authStore)

const isMenuOpen = ref(false)

function isActive(routeName: string): boolean {
  return route.name === routeName
}

function linkClasses(active: boolean): string {
  return active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
}

function mobileLinkClasses(active: boolean): string {
  return active
    ? 'bg-blue-50 text-blue-700'
    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
}

function closeMenu() {
  isMenuOpen.value = false
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

async function handleLogout() {
  closeMenu()
  authStore.logout()
  toastStore.success('Sesión cerrada')
  await router.push('/login')
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

watch(
  () => route.fullPath,
  () => {
    closeMenu()
  },
)

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm pt-[env(safe-area-inset-top,0px)]"
  >
    <div class="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
      <RouterLink
        to="/"
        class="shrink-0 text-base font-bold text-gray-900 transition hover:text-blue-700 sm:text-lg"
        @click="closeMenu"
      >
        {{ APP_NAME }}
      </RouterLink>

      <nav class="hidden items-center gap-1 sm:flex">
        <RouterLink
          v-for="item in NAV_ITEMS"
          :key="item.routeName"
          :to="item.to"
          class="shrink-0 rounded-lg px-3 py-2.5 text-sm font-medium transition"
          :class="linkClasses(isActive(item.routeName))"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="flex items-center gap-3 sm:shrink-0">
        <button
          type="button"
          class="rounded-full ring-offset-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:hidden"
          :class="{ 'ring-2 ring-blue-500': isMenuOpen }"
          :aria-expanded="isMenuOpen"
          aria-controls="mobile-header-menu"
          aria-label="Abrir menú de navegación"
          @click="toggleMenu"
        >
          <UserAvatar
            v-if="user"
            :name="user.name"
            :email="user.email"
            :image-url="user.profileImageUrl"
            size="sm"
          />
        </button>

        <RouterLink
          v-if="user"
          to="/profile"
          class="hidden rounded-full transition hover:opacity-90 sm:block"
          aria-label="Ir a mi perfil"
        >
          <UserAvatar
            :name="user.name"
            :email="user.email"
            :image-url="user.profileImageUrl"
            size="sm"
          />
        </RouterLink>

        <button
          type="button"
          :class="[BTN_DANGER_CLASS, 'hidden sm:inline-flex']"
          @click="handleLogout"
        >
          Salir
        </button>
      </div>
    </div>

    <div
      v-if="isMenuOpen"
      id="mobile-header-menu"
      class="border-t border-gray-200 bg-white sm:hidden"
    >
      <div class="mx-auto max-w-5xl px-4 py-4">
        <div v-if="user" class="mb-4 flex items-center gap-3 border-b border-gray-100 pb-4">
          <UserAvatar
            :name="user.name"
            :email="user.email"
            :image-url="user.profileImageUrl"
            size="md"
          />
          <div class="min-w-0">
            <p class="truncate font-medium text-gray-900">
              {{ user.name || 'Mi cuenta' }}
            </p>
            <p class="truncate text-sm text-gray-500">{{ user.email }}</p>
          </div>
        </div>

        <nav class="flex flex-col gap-1">
          <RouterLink
            v-for="item in NAV_ITEMS"
            :key="item.routeName"
            :to="item.to"
            class="min-h-11 rounded-lg px-3 py-2.5 text-base font-medium transition"
            :class="mobileLinkClasses(isActive(item.routeName))"
            @click="closeMenu"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <button type="button" :class="[BTN_DANGER_CLASS, 'mt-4 w-full']" @click="handleLogout">
          Salir
        </button>
      </div>
    </div>
  </header>
</template>

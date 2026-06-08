import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { updatePreferences } from '@/api/profile.api'
import {
  THEME_MODES,
  type ResolvedTheme,
  type ThemeMode,
} from '@/constants/theme.constants'
import { useAuthStore } from '@/stores/auth.store'
import { getAccessToken } from '@/utils/storage.util'

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: ResolvedTheme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

export const useThemeStore = defineStore('theme', () => {
  const systemTheme = ref<ResolvedTheme>(getSystemTheme())
  const mode = ref<ThemeMode>('system')
  const syncingFromServer = ref(false)

  const resolvedTheme = computed<ResolvedTheme>(() =>
    mode.value === 'system' ? systemTheme.value : mode.value,
  )

  applyTheme(resolvedTheme.value)

  watch(resolvedTheme, (theme) => {
    applyTheme(theme)
  })

  watch(mode, async (nextMode) => {
    if (syncingFromServer.value) {
      return
    }

    if (!getAccessToken()) {
      return
    }

    try {
      const prefs = await updatePreferences({ themeMode: nextMode })
      const authStore = useAuthStore()

      if (authStore.user) {
        authStore.setUser({ ...authStore.user, ...prefs })
      }
    } catch {
      // Keep UI theme even if persistence fails temporarily.
    }
  })

  function setMode(nextMode: ThemeMode): void {
    mode.value = nextMode
  }

  function syncFromUser(themeMode: ThemeMode): void {
    if (!(THEME_MODES as readonly string[]).includes(themeMode)) {
      return
    }

    syncingFromServer.value = true
    mode.value = themeMode
    syncingFromServer.value = false
  }

  function toggleTheme(): void {
    setMode(resolvedTheme.value === 'dark' ? 'light' : 'dark')
  }

  function initSystemListener(): void {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      systemTheme.value = event.matches ? 'dark' : 'light'
    })
  }

  return {
    mode,
    resolvedTheme,
    preference: resolvedTheme,
    isDark: () => resolvedTheme.value === 'dark',
    setMode,
    syncFromUser,
    toggleTheme,
    initSystemListener,
  }
})

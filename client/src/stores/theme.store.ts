import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { THEME_STORAGE_KEY, type ThemePreference } from '@/constants/theme.constants'

function getStoredTheme(): ThemePreference | null {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)

  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  return null
}

function getSystemTheme(): ThemePreference {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: ThemePreference): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

export const useThemeStore = defineStore('theme', () => {
  const preference = ref<ThemePreference>(getStoredTheme() ?? getSystemTheme())

  applyTheme(preference.value)

  watch(preference, (theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    applyTheme(theme)
  })

  function toggleTheme(): void {
    preference.value = preference.value === 'dark' ? 'light' : 'dark'
  }

  function initSystemListener(): void {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      if (getStoredTheme()) {
        return
      }

      preference.value = event.matches ? 'dark' : 'light'
    })
  }

  return {
    preference,
    isDark: () => preference.value === 'dark',
    toggleTheme,
    initSystemListener,
  }
})

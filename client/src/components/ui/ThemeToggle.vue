<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { BTN_ICON_GHOST_CLASS } from '@/constants/ui.constants'
import { useThemeStore } from '@/stores/theme.store'

const themeStore = useThemeStore()
const { preference } = storeToRefs(themeStore)
</script>

<template>
  <button
    type="button"
    :class="BTN_ICON_GHOST_CLASS"
    :aria-label="preference === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'"
    @click="themeStore.toggleTheme()"
  >
    <svg
      v-if="preference === 'dark'"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      class="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke-linecap="round"
      />
    </svg>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      class="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M21 14.5A8.5 8.5 0 1 1 10.5 3.5a6.5 6.5 0 0 0 10.6 11Z"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>

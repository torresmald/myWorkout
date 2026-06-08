<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import { useThemeStore } from '@/stores/theme.store'

const themeStore = useThemeStore()
const { resolvedTheme } = storeToRefs(themeStore)
const { t } = useI18n()

const ariaLabel = computed(() =>
  resolvedTheme.value === 'dark' ? t('layout.switchToLight') : t('layout.switchToDark'),
)
</script>

<template>
  <button
    type="button"
    class="inline-flex h-9 w-9 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated"
    :aria-label="ariaLabel"
    @click="themeStore.toggleTheme()"
  >
    <span class="theme-toggle__scene">
      <span
        class="theme-toggle__card"
        :class="{ 'theme-toggle__card--dark': resolvedTheme === 'dark' }"
      >
        <span class="theme-toggle__face theme-toggle__face--front">
          <img
            src="/themes/sun.png"
            :alt="t('layout.switchToLight')"
            class="h-7 w-7 object-contain"
            width="28"
            height="28"
          />
        </span>
        <span class="theme-toggle__face theme-toggle__face--back">
          <img
            src="/themes/moon.png"
            :alt="t('layout.switchToDark')"
            class="h-7 w-7 object-contain"
            width="28"
            height="28"
          />
        </span>
      </span>
    </span>
  </button>
</template>

<style scoped>
.theme-toggle__scene {
  display: inline-flex;
  width: 1.75rem;
  height: 1.75rem;
  perspective: 600px;
}

.theme-toggle__card {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.45s ease;
}

.theme-toggle__card--dark {
  transform: rotateY(180deg);
}

.theme-toggle__face {
  position: absolute;
  inset: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
}

.theme-toggle__face--back {
  transform: rotateY(180deg);
}
</style>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

import LanguageToggle from '@/components/ui/LanguageToggle.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import { APP_NAME } from '@/constants/app.constants'
</script>

<template>
  <div
    class="relative flex min-h-dvh flex-col items-center justify-center bg-bg-page px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]"
  >
    <div class="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] flex items-center gap-2">
      <LanguageToggle />
      <ThemeToggle />
    </div>

    <RouterLink
      to="/login"
      class="mb-8 text-2xl font-bold text-text-primary transition hover:text-blue-700 dark:hover:text-blue-400"
    >
      {{ APP_NAME }}
    </RouterLink>

    <RouterView />
  </div>
</template>

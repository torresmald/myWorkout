<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import AppLogo from '@/components/layout/AppLogo.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const { t } = useI18n()
</script>

<template>
  <div
    class="app-bootstrap fixed inset-0 z-[100] flex flex-col items-center justify-center px-6"
    role="status"
    aria-live="polite"
    :aria-label="t('app.bootstrap.message')"
  >
    <div class="app-bootstrap__backdrop" aria-hidden="true" />

    <div class="relative z-10 flex flex-col items-center gap-6 text-center">
      <AppLogo show-text inverted size="lg" />

      <div class="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" class="text-white" />
        <p class="text-base font-medium text-white">{{ t('app.bootstrap.message') }}</p>
        <p class="max-w-xs text-sm text-white/75">{{ t('app.bootstrap.hint') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-bootstrap__backdrop {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to bottom, rgb(0 0 0 / 72%), rgb(0 0 0 / 55%)),
    url('/images/gym-bg.jpg');
  background-position: center;
  background-size: cover;
}
</style>

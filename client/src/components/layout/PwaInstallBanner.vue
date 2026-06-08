<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { usePwaInstall } from '@/composables/usePwaInstall'
import { BTN_PRIMARY_CLASS, BTN_SECONDARY_CLASS } from '@/constants/ui.constants'

const { t } = useI18n()
const { canInstall, showBanner, install, dismissBanner } = usePwaInstall()

async function handleInstall() {
  if (canInstall.value) {
    await install()
    return
  }

  dismissBanner()
}
</script>

<template>
  <div
    v-if="showBanner"
    class="border-b border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950"
    role="region"
    :aria-label="t('layout.pwaInstall.title')"
  >
    <div class="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm font-semibold text-blue-900 dark:text-blue-100">
          {{ t('layout.pwaInstall.title') }}
        </p>
        <p class="mt-1 text-sm text-blue-800 dark:text-blue-200">
          {{ canInstall ? t('layout.pwaInstall.description') : t('layout.pwaInstall.manualHint') }}
        </p>
      </div>

      <div class="flex shrink-0 flex-wrap gap-2">
        <button type="button" :class="BTN_SECONDARY_CLASS" @click="dismissBanner">
          {{ t('layout.pwaInstall.dismiss') }}
        </button>
        <button
          v-if="canInstall"
          type="button"
          :class="BTN_PRIMARY_CLASS"
          @click="handleInstall"
        >
          {{ t('layout.pwaInstall.install') }}
        </button>
      </div>
    </div>
  </div>
</template>

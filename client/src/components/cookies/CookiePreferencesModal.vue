<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import AppModal from '@/components/ui/AppModal.vue'
import { useCookieConsentStore } from '@/stores/cookie-consent.store'
import { BTN_PRIMARY_CLASS, BTN_SECONDARY_CLASS } from '@/constants/ui.constants'

const cookieStore = useCookieConsentStore()
const { t } = useI18n()

const analytics = ref(cookieStore.preferences.analytics)
const thirdParty = ref(cookieStore.preferences.thirdParty)

watch(
  () => cookieStore.preferencesModalOpen,
  (open) => {
    if (open) {
      analytics.value = cookieStore.preferences.analytics
      thirdParty.value = cookieStore.preferences.thirdParty
    }
  },
)

function handleSave() {
  cookieStore.savePreferences({
    analytics: analytics.value,
    thirdParty: thirdParty.value,
  })
}
</script>

<template>
  <AppModal
    :open="cookieStore.preferencesModalOpen"
    :title="t('cookies.preferences.title')"
    @close="cookieStore.closePreferences()"
  >
    <p class="text-sm leading-relaxed text-text-secondary">
      {{ t('cookies.preferences.description') }}
    </p>

    <ul class="mt-5 space-y-4">
      <li class="rounded-lg border border-border-default bg-bg-muted/40 p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-medium text-text-primary">{{ t('cookies.preferences.essential.title') }}</p>
            <p class="mt-1 text-sm text-text-secondary">
              {{ t('cookies.preferences.essential.description') }}
            </p>
          </div>
          <span class="shrink-0 text-xs font-medium uppercase tracking-wide text-text-muted">
            {{ t('cookies.preferences.alwaysOn') }}
          </span>
        </div>
      </li>

      <li class="rounded-lg border border-border-default bg-bg-muted/40 p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-medium text-text-primary">{{ t('cookies.preferences.preferences.title') }}</p>
            <p class="mt-1 text-sm text-text-secondary">
              {{ t('cookies.preferences.preferences.description') }}
            </p>
          </div>
          <span class="shrink-0 text-xs font-medium uppercase tracking-wide text-text-muted">
            {{ t('cookies.preferences.alwaysOn') }}
          </span>
        </div>
      </li>

      <li class="rounded-lg border border-border-default p-4">
        <label class="flex cursor-pointer items-start justify-between gap-3">
          <span>
            <span class="font-medium text-text-primary">{{ t('cookies.preferences.analytics.title') }}</span>
            <span class="mt-1 block text-sm text-text-secondary">
              {{ t('cookies.preferences.analytics.description') }}
            </span>
          </span>
          <input
            v-model="analytics"
            type="checkbox"
            class="mt-1 h-5 w-5 shrink-0 rounded border-border-default text-blue-600 focus:ring-blue-500"
          />
        </label>
      </li>

      <li class="rounded-lg border border-border-default p-4">
        <label class="flex cursor-pointer items-start justify-between gap-3">
          <span>
            <span class="font-medium text-text-primary">{{ t('cookies.preferences.thirdParty.title') }}</span>
            <span class="mt-1 block text-sm text-text-secondary">
              {{ t('cookies.preferences.thirdParty.description') }}
            </span>
          </span>
          <input
            v-model="thirdParty"
            type="checkbox"
            class="mt-1 h-5 w-5 shrink-0 rounded border-border-default text-blue-600 focus:ring-blue-500"
          />
        </label>
      </li>
    </ul>

    <template #footer>
      <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="button" :class="BTN_SECONDARY_CLASS" @click="cookieStore.closePreferences()">
          {{ t('common.cancel') }}
        </button>
        <button type="button" :class="BTN_PRIMARY_CLASS" @click="handleSave">
          {{ t('cookies.preferences.save') }}
        </button>
      </div>
    </template>
  </AppModal>
</template>

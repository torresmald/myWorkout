<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useCookieConsentStore } from '@/stores/cookie-consent.store'
import { BTN_PRIMARY_CLASS, BTN_SECONDARY_CLASS, LINK_MUTED_CLASS } from '@/constants/ui.constants'

const cookieStore = useCookieConsentStore()
const { t } = useI18n()

function handleAcceptAll() {
  cookieStore.acceptAll()
}

function handleRejectNonEssential() {
  cookieStore.rejectNonEssential()
}

function handleCustomize() {
  cookieStore.openPreferences()
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <aside
      v-if="cookieStore.showBanner"
      class="fixed inset-x-0 bottom-0 z-40 border-t border-border-default bg-bg-elevated/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgb(0_0_0/12%)] backdrop-blur-md"
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-description"
    >
      <div class="mx-auto flex max-w-5xl flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="min-w-0 flex-1">
          <h2 id="cookie-banner-title" class="text-base font-semibold text-text-primary">
            {{ t('cookies.banner.title') }}
          </h2>
          <p id="cookie-banner-description" class="mt-2 text-sm leading-relaxed text-text-secondary">
            {{ t('cookies.banner.description') }}
            <RouterLink to="/cookies" :class="[LINK_MUTED_CLASS, 'ml-1 font-medium underline']">
              {{ t('cookies.banner.policyLink') }}
            </RouterLink>
          </p>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <button type="button" :class="BTN_SECONDARY_CLASS" @click="handleCustomize">
            {{ t('cookies.banner.customize') }}
          </button>
          <button type="button" :class="BTN_SECONDARY_CLASS" @click="handleRejectNonEssential">
            {{ t('cookies.banner.rejectNonEssential') }}
          </button>
          <button type="button" :class="BTN_PRIMARY_CLASS" @click="handleAcceptAll">
            {{ t('cookies.banner.acceptAll') }}
          </button>
        </div>
      </div>
    </aside>
  </Transition>
</template>

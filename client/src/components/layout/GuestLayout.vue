<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AppLogo from '@/components/layout/AppLogo.vue'
import LanguageToggle from '@/components/ui/LanguageToggle.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import { useCookieConsentStore } from '@/stores/cookie-consent.store'

const { t } = useI18n()
const cookieStore = useCookieConsentStore()
</script>

<template>
  <div
    class="guest-layout relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]"
  >
    <div class="guest-layout__backdrop" aria-hidden="true" />

    <div
      class="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-20 flex items-center gap-2 rounded-full border border-white/20 bg-black/30 p-1.5 backdrop-blur-md"
    >
      <LanguageToggle />
      <ThemeToggle />
    </div>

    <RouterLink
      to="/login"
      class="relative z-10 mb-8 transition hover:opacity-90"
    >
      <AppLogo show-text inverted size="lg" />
    </RouterLink>

    <div class="relative z-10 w-full max-w-md">
      <RouterView />
    </div>

    <footer class="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-white/75">
      <RouterLink to="/cookies" class="underline-offset-2 hover:text-white hover:underline">
        {{ t('cookies.footer.cookies') }}
      </RouterLink>
      <button
        type="button"
        class="underline-offset-2 hover:text-white hover:underline"
        @click="cookieStore.openPreferences()"
      >
        {{ t('cookies.footer.preferences') }}
      </button>
    </footer>
  </div>
</template>

<style scoped>
.guest-layout__backdrop {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to bottom, rgb(0 0 0 / 72%), rgb(0 0 0 / 55%)),
    url('/images/gym-bg.jpg');
  background-position: center;
  background-size: cover;
}

:deep(.guest-layout .language-toggle__scene),
:deep(.guest-layout .theme-toggle__scene) {
  filter: drop-shadow(0 1px 2px rgb(0 0 0 / 40%));
}
</style>

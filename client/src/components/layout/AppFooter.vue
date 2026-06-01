<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import { APP_NAME } from '@/constants/app.constants'
import { useCookieConsentStore } from '@/stores/cookie-consent.store'
import { LINK_MUTED_CLASS } from '@/constants/ui.constants'

const GITHUB_URL = 'https://github.com/torresmald'
const GITHUB_USERNAME = 'torresmald'

const cookieStore = useCookieConsentStore()
const { t } = useI18n()
</script>

<template>
  <footer class="mt-auto border-t border-border-default bg-bg-elevated pb-[env(safe-area-inset-bottom,0px)]">
    <div
      class="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-4 text-center text-sm text-text-muted sm:px-6"
    >
      <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <RouterLink to="/cookies" :class="LINK_MUTED_CLASS">
          {{ t('cookies.footer.cookies') }}
        </RouterLink>
        <button
          type="button"
          :class="LINK_MUTED_CLASS"
          @click="cookieStore.openPreferences()"
        >
          {{ t('cookies.footer.preferences') }}
        </button>
      </div>

      <div class="flex w-full flex-col items-center gap-2 sm:flex-row sm:justify-between">
        <p>&copy; {{ new Date().getFullYear() }} {{ APP_NAME }}</p>

        <a
          :href="GITHUB_URL"
          target="_blank"
          rel="noopener noreferrer"
          :class="LINK_MUTED_CLASS"
          class="inline-flex items-center gap-2 font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="h-5 w-5"
            aria-hidden="true"
          >
            <path
              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"
            />
          </svg>
          @{{ GITHUB_USERNAME }}
        </a>
      </div>
    </div>
  </footer>
</template>

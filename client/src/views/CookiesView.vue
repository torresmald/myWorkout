<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AppLogo from '@/components/layout/AppLogo.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import { COOKIE_INVENTORY } from '@/constants/cookie.constants'
import { useCookieConsentStore } from '@/stores/cookie-consent.store'
import {
  BTN_PRIMARY_CLASS,
  BTN_SECONDARY_CLASS,
  CARD_BODY_CLASS,
  LINK_MUTED_CLASS,
  SECTION_TITLE_CLASS,
} from '@/constants/ui.constants'

const cookieStore = useCookieConsentStore()
const { t } = useI18n()

const categoryDescriptions = computed(() => [
  {
    key: 'essential',
    title: t('cookies.categories.essential'),
    description: t('cookies.preferences.essential.description'),
  },
  {
    key: 'preferences',
    title: t('cookies.categories.preferences'),
    description: t('cookies.preferences.preferences.description'),
  },
  {
    key: 'analytics',
    title: t('cookies.categories.analytics'),
    description: t('cookies.preferences.analytics.description'),
  },
  {
    key: 'thirdParty',
    title: t('cookies.categories.thirdParty'),
    description: t('cookies.preferences.thirdParty.description'),
  },
])
</script>

<template>
  <div class="app-shell min-h-dvh bg-bg-page">
    <header class="border-b border-border-default bg-bg-elevated">
      <PageContainer class="flex items-center justify-between py-4">
        <RouterLink to="/" class="transition hover:opacity-90">
          <AppLogo show-text size="sm" />
        </RouterLink>
        <RouterLink to="/" :class="LINK_MUTED_CLASS">
          {{ t('cookies.policy.back') }}
        </RouterLink>
      </PageContainer>
    </header>

    <PageContainer max-width="3xl" class="py-8">
      <h1 class="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
        {{ t('cookies.policy.title') }}
      </h1>
      <p class="mt-2 text-sm text-text-muted">{{ t('cookies.policy.lastUpdated') }}</p>
      <p class="mt-4 text-sm leading-relaxed text-text-secondary">{{ t('cookies.policy.intro') }}</p>

      <section :class="[CARD_BODY_CLASS, 'mt-8']">
        <h2 :class="SECTION_TITLE_CLASS">{{ t('cookies.policy.categoriesTitle') }}</h2>
        <ul class="space-y-4">
          <li
            v-for="category in categoryDescriptions"
            :key="category.key"
            class="rounded-lg border border-border-default p-4"
          >
            <p class="font-medium text-text-primary">{{ category.title }}</p>
            <p class="mt-1 text-sm text-text-secondary">{{ category.description }}</p>
          </li>
        </ul>
      </section>

      <section :class="[CARD_BODY_CLASS, 'mt-6 overflow-hidden']">
        <h2 :class="SECTION_TITLE_CLASS">{{ t('cookies.policy.inventoryTitle') }}</h2>

        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead>
              <tr class="border-b border-border-default text-text-muted">
                <th class="px-2 py-3 font-medium">{{ t('cookies.policy.table.name') }}</th>
                <th class="px-2 py-3 font-medium">{{ t('cookies.policy.table.type') }}</th>
                <th class="px-2 py-3 font-medium">{{ t('cookies.policy.table.category') }}</th>
                <th class="px-2 py-3 font-medium">{{ t('cookies.policy.table.duration') }}</th>
                <th class="px-2 py-3 font-medium">{{ t('cookies.policy.table.provider') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in COOKIE_INVENTORY"
                :key="item.key"
                class="border-b border-border-default last:border-b-0"
              >
                <td class="px-2 py-3 font-mono text-xs text-text-primary sm:text-sm">{{ item.key }}</td>
                <td class="px-2 py-3 text-text-secondary">
                  {{ t(`cookies.storageTypes.${item.storage}`) }}
                </td>
                <td class="px-2 py-3 text-text-secondary">
                  {{ t(`cookies.categories.${item.category}`) }}
                </td>
                <td class="px-2 py-3 text-text-secondary">{{ t(item.durationKey) }}</td>
                <td class="px-2 py-3 text-text-secondary">
                  {{ item.providerKey ? t(item.providerKey) : '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div class="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" :class="BTN_PRIMARY_CLASS" @click="cookieStore.openPreferences()">
          {{ t('cookies.policy.managePreferences') }}
        </button>
        <RouterLink to="/" :class="BTN_SECONDARY_CLASS">
          {{ t('cookies.policy.back') }}
        </RouterLink>
      </div>
    </PageContainer>
  </div>
</template>

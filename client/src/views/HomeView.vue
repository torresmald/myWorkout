<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import { useHomeQuickLinks } from '@/composables/useHomeQuickLinks'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { CARD_INTERACTIVE_CLASS } from '@/constants/ui.constants'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const { t } = useI18n()
const quickLinks = useHomeQuickLinks()

const greeting = computed(() =>
  t('home.greeting', { name: user.value?.name ?? user.value?.email ?? '' }),
)
</script>

<template>
  <PageContainer max-width="3xl">
    <PageHeader :title="greeting" :description="t('home.subtitle')" />

    <div class="grid gap-4 sm:grid-cols-2">
      <RouterLink
        v-for="link in quickLinks"
        :key="link.to"
        :to="link.to"
        :class="CARD_INTERACTIVE_CLASS"
      >
        <h2 class="text-lg font-semibold text-text-primary">{{ link.label }}</h2>
        <p class="mt-2 text-sm text-text-secondary">{{ link.description }}</p>
        <span class="mt-4 inline-block text-sm font-medium text-blue-600 dark:text-blue-400">
          {{ t('common.goTo') }}
        </span>
      </RouterLink>
    </div>
  </PageContainer>
</template>

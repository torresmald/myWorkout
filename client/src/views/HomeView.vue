<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'

import PageContainer from '@/components/layout/PageContainer.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { HOME_QUICK_LINKS } from '@/constants/home.constants'
import { CARD_INTERACTIVE_CLASS } from '@/constants/ui.constants'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
</script>

<template>
  <PageContainer max-width="3xl">
    <PageHeader
      :title="`Hola, ${user?.name ?? user?.email}`"
      description="¿Qué quieres hacer hoy?"
    />

    <div class="grid gap-4 sm:grid-cols-2">
      <RouterLink
        v-for="link in HOME_QUICK_LINKS"
        :key="link.to"
        :to="link.to"
        :class="CARD_INTERACTIVE_CLASS"
      >
        <h2 class="text-lg font-semibold text-text-primary">{{ link.label }}</h2>
        <p class="mt-2 text-sm text-text-secondary">{{ link.description }}</p>
        <span class="mt-4 inline-block text-sm font-medium text-blue-600 dark:text-blue-400">Ir →</span>
      </RouterLink>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'

import PageContainer from '@/components/layout/PageContainer.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { getHealth } from '@/api/health.api'
import { HOME_QUICK_LINKS } from '@/constants/home.constants'
import { CARD_COMPACT_CLASS, CARD_INTERACTIVE_CLASS } from '@/constants/ui.constants'
import type { HealthData } from '@/interfaces/health.interface'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/utils/error.util'

const authStore = useAuthStore()
const toastStore = useToastStore()
const { user } = storeToRefs(authStore)

const health = ref<HealthData | null>(null)
const loadingHealth = ref(true)

onMounted(async () => {
  try {
    health.value = await getHealth()
  } catch (e) {
    toastStore.error(getErrorMessage(e, 'Error al comprobar el estado del sistema'))
  } finally {
    loadingHealth.value = false
  }
})
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
        <h2 class="text-lg font-semibold text-gray-900">{{ link.label }}</h2>
        <p class="mt-2 text-sm text-gray-600">{{ link.description }}</p>
        <span class="mt-4 inline-block text-sm font-medium text-blue-600">Ir →</span>
      </RouterLink>
    </div>

    <section :class="CARD_COMPACT_CLASS">
      <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span class="font-medium text-gray-700">Estado del sistema</span>

        <p v-if="loadingHealth" class="text-gray-500">Comprobando...</p>

        <div v-else-if="health" class="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-600">
          <span>
            API:
            <span class="font-medium text-green-600">ok</span>
          </span>
          <span>
            BD:
            <span
              class="font-medium"
              :class="health.database === 'connected' ? 'text-green-600' : 'text-amber-600'"
            >
              {{ health.database === 'connected' ? 'Conectada' : 'Desconectada' }}
            </span>
          </span>
        </div>
      </div>
    </section>
  </PageContainer>
</template>

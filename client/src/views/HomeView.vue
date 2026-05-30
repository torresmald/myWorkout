<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { getHealth } from '@/api/health.api'
import type { HealthData } from '@/interfaces/health.interface'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/utils/error.util'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()
const { user } = storeToRefs(authStore)

const health = ref<HealthData | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    health.value = await getHealth()
  } catch (e) {
    toastStore.error(getErrorMessage(e, 'Error al comprobar el estado del sistema'))
  } finally {
    loading.value = false
  }
})

async function handleLogout() {
  authStore.logout()
  toastStore.success('Sesión cerrada')
  await router.push('/login')
}
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
    <h1 class="text-3xl font-bold text-gray-900">My Workout</h1>
    <p class="text-gray-600">Gestor de entrenamientos</p>

    <section class="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-800">Sesión</h2>
      <p class="text-sm text-green-600">Conectado como {{ user?.email }} ({{ user?.role }})</p>
      <button
        type="button"
        class="mt-4 text-sm font-medium text-red-600 hover:text-red-700"
        @click="handleLogout"
      >
        Cerrar sesión
      </button>
    </section>

    <section class="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-800">Ejercicios</h2>
      <RouterLink
        to="/exercise-types"
        class="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        Gestionar tipos de ejercicio →
      </RouterLink>
    </section>

    <section class="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-800">Estado del sistema</h2>

      <p v-if="loading" class="text-gray-500">Comprobando API...</p>

      <dl v-else-if="health" class="space-y-2 text-sm">
        <div class="flex justify-between">
          <dt class="text-gray-500">API</dt>
          <dd class="font-medium text-green-600">ok</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-gray-500">Base de datos</dt>
          <dd
            class="font-medium"
            :class="health.database === 'connected' ? 'text-green-600' : 'text-amber-600'"
          >
            {{ health.database === 'connected' ? 'Conectada' : 'Desconectada' }}
          </dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-gray-500">Timestamp</dt>
          <dd class="font-mono text-xs text-gray-700">{{ health.timestamp }}</dd>
        </div>
      </dl>
    </section>
  </main>
</template>

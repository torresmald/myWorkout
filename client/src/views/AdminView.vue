<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import PageContainer from '@/components/layout/PageContainer.vue'
import RoutePageHeader from '@/components/layout/RoutePageHeader.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import {
  BTN_SECONDARY_CLASS,
  CARD_COMPACT_CLASS,
  INPUT_CLASS,
  TEXT_MUTED_CLASS,
} from '@/constants/ui.constants'
import type { UserRole } from '@/interfaces/role.interface'
import { useAdminStore } from '@/stores/admin.store'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { formatWorkoutDate } from '@/utils/date.util'
import { getErrorMessage } from '@/utils/error.util'

const adminStore = useAdminStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const { metrics, users, page, totalPages, total, loading, updatingUserId } = storeToRefs(adminStore)

const metricCards = [
  { key: 'totalUsers', label: 'Usuarios' },
  { key: 'verifiedUsers', label: 'Verificados' },
  { key: 'adminUsers', label: 'Administradores' },
  { key: 'totalWorkouts', label: 'Entrenamientos' },
  { key: 'totalExerciseTypes', label: 'Tipos de ejercicio' },
  { key: 'totalWeightEntries', label: 'Registros de peso' },
] as const

onMounted(async () => {
  try {
    await adminStore.loadDashboard()
  } catch (error) {
    toastStore.error(getErrorMessage(error, 'No se pudo cargar el panel de administración'))
  }
})

async function handleRoleChange(userId: number, role: UserRole) {
  try {
    await adminStore.changeUserRole(userId, role)
    toastStore.success('Rol actualizado')
  } catch (error) {
    toastStore.error(getErrorMessage(error, 'No se pudo actualizar el rol'))
  }
}

async function goToPage(nextPage: number) {
  if (nextPage < 1 || nextPage > totalPages.value) {
    return
  }

  try {
    await adminStore.fetchUsers(nextPage)
  } catch (error) {
    toastStore.error(getErrorMessage(error, 'No se pudo cargar la página'))
  }
}
</script>

<template>
  <PageContainer>
    <RoutePageHeader
      title="Administración"
      description="Métricas de la plataforma y gestión de usuarios"
    />

    <div v-if="metrics" class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="card in metricCards" :key="card.key" :class="CARD_COMPACT_CLASS">
        <p :class="TEXT_MUTED_CLASS">{{ card.label }}</p>
        <p class="mt-1 text-2xl font-bold text-text-primary">{{ metrics[card.key] }}</p>
      </div>
    </div>

    <section :class="CARD_COMPACT_CLASS">
      <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-base font-semibold text-text-primary">Usuarios ({{ total }})</h2>
        <LoadingSpinner v-if="loading" size="sm" class="text-blue-600" />
      </div>

      <div v-if="users.length === 0 && !loading" :class="TEXT_MUTED_CLASS">
        No hay usuarios registrados.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead>
            <tr class="border-b border-border-default text-text-muted">
              <th class="px-2 py-3 font-medium">Email</th>
              <th class="px-2 py-3 font-medium">Nombre</th>
              <th class="px-2 py-3 font-medium">Rol</th>
              <th class="px-2 py-3 font-medium">Entrenamientos</th>
              <th class="px-2 py-3 font-medium">Registro</th>
              <th class="px-2 py-3 font-medium">Último acceso</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users"
              :key="user.id"
              class="border-b border-border-default last:border-b-0"
            >
              <td class="px-2 py-3 text-text-primary">{{ user.email }}</td>
              <td class="px-2 py-3 text-text-secondary">{{ user.name || '—' }}</td>
              <td class="px-2 py-3">
                <select
                  :class="INPUT_CLASS"
                  class="min-h-10 py-2"
                  :value="user.role"
                  :disabled="user.id === authStore.user?.id || updatingUserId === user.id"
                  @change="handleRoleChange(user.id, ($event.target as HTMLSelectElement).value as UserRole)"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
              <td class="px-2 py-3 text-text-secondary">{{ user.workoutCount }}</td>
              <td class="px-2 py-3 text-text-muted">{{ formatWorkoutDate(user.createdAt) }}</td>
              <td class="px-2 py-3 text-text-muted">
                {{ user.lastLoginAt ? formatWorkoutDate(user.lastLoginAt) : '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          :class="BTN_SECONDARY_CLASS"
          :disabled="page <= 1 || loading"
          @click="goToPage(page - 1)"
        >
          Anterior
        </button>
        <span :class="TEXT_MUTED_CLASS">Página {{ page }} de {{ totalPages }}</span>
        <button
          type="button"
          :class="BTN_SECONDARY_CLASS"
          :disabled="page >= totalPages || loading"
          @click="goToPage(page + 1)"
        >
          Siguiente
        </button>
      </div>
    </section>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import PageContainer from '@/components/layout/PageContainer.vue'
import RoutePageHeader from '@/components/layout/RoutePageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import SkeletonCardGrid from '@/components/ui/SkeletonCardGrid.vue'
import {
  BTN_MOBILE_FULL_CLASS,
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
const { t } = useI18n()

const { metrics, users, page, totalPages, total, loading, updatingUserId } = storeToRefs(adminStore)

const metricCards = computed(() => [
  { key: 'totalUsers' as const, label: t('admin.metrics.totalUsers') },
  { key: 'verifiedUsers' as const, label: t('admin.metrics.verifiedUsers') },
  { key: 'adminUsers' as const, label: t('admin.metrics.adminUsers') },
  { key: 'totalWorkouts' as const, label: t('admin.metrics.totalWorkouts') },
  { key: 'totalExerciseTypes' as const, label: t('admin.metrics.totalExerciseTypes') },
  { key: 'totalCatalogExercises' as const, label: t('admin.metrics.totalCatalogExercises') },
  { key: 'totalWeightEntries' as const, label: t('admin.metrics.totalWeightEntries') },
])

onMounted(async () => {
  try {
    await adminStore.loadDashboard()
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('admin.loadError')))
  }
})

async function handleRoleChange(userId: number, role: UserRole) {
  try {
    await adminStore.changeUserRole(userId, role)
    toastStore.success(t('admin.roleUpdated'))
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('admin.roleUpdateError')))
  }
}

async function goToPage(nextPage: number) {
  if (nextPage < 1 || nextPage > totalPages.value) {
    return
  }

  try {
    await adminStore.fetchUsers(nextPage)
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('admin.pageLoadError')))
  }
}
</script>

<template>
  <PageContainer>
    <RoutePageHeader />

    <SkeletonCardGrid v-if="loading && !metrics" />

    <div v-else-if="metrics" class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="(card, index) in metricCards"
        :key="card.key"
        :class="[CARD_COMPACT_CLASS, 'stagger-item']"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <p :class="TEXT_MUTED_CLASS">{{ card.label }}</p>
        <p class="mt-1 text-2xl font-bold text-text-primary">{{ metrics[card.key] }}</p>
      </div>
    </div>

    <div class="mb-6">
      <RouterLink
        :to="{ name: 'admin-catalog' }"
        :class="[BTN_SECONDARY_CLASS, BTN_MOBILE_FULL_CLASS, 'inline-flex sm:w-auto']"
      >
        {{ t('admin.manageCatalog') }}
      </RouterLink>
    </div>

    <section :class="CARD_COMPACT_CLASS">
      <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-base font-semibold text-text-primary">
          {{ t('admin.users.title', { count: total }) }}
        </h2>
        <LoadingSpinner v-if="loading" size="sm" class="text-blue-600" />
      </div>

      <EmptyState
        v-if="users.length === 0 && !loading"
        variant="admin"
        :title="t('empty.admin.title')"
        :description="t('empty.admin.description')"
      />

      <div v-else-if="users.length > 0" class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead>
            <tr class="border-b border-border-default text-text-muted">
              <th class="px-2 py-3 font-medium">{{ t('admin.users.email') }}</th>
              <th class="px-2 py-3 font-medium">{{ t('admin.users.name') }}</th>
              <th class="px-2 py-3 font-medium">{{ t('admin.users.role') }}</th>
              <th class="px-2 py-3 font-medium">{{ t('admin.users.workouts') }}</th>
              <th class="px-2 py-3 font-medium">{{ t('admin.users.registered') }}</th>
              <th class="px-2 py-3 font-medium">{{ t('admin.users.lastLogin') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users"
              :key="user.id"
              class="border-b border-border-default last:border-b-0"
            >
              <td class="px-2 py-3 text-text-primary">{{ user.email }}</td>
              <td class="px-2 py-3 text-text-secondary">{{ user.name || t('common.noValue') }}</td>
              <td class="px-2 py-3">
                <select
                  :class="INPUT_CLASS"
                  class="min-h-10 py-2"
                  :value="user.role"
                  :disabled="user.id === authStore.user?.id || updatingUserId === user.id"
                  @change="
                    handleRoleChange(
                      user.id,
                      ($event.target as HTMLSelectElement).value as UserRole,
                    )
                  "
                >
                  <option value="USER">{{ t('common.user') }}</option>
                  <option value="ADMIN">{{ t('common.admin') }}</option>
                </select>
              </td>
              <td class="px-2 py-3 text-text-secondary">{{ user.workoutCount }}</td>
              <td class="px-2 py-3 text-text-muted">{{ formatWorkoutDate(user.createdAt) }}</td>
              <td class="px-2 py-3 text-text-muted">
                {{ user.lastLoginAt ? formatWorkoutDate(user.lastLoginAt) : t('common.noValue') }}
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
          {{ t('common.previous') }}
        </button>
        <span :class="TEXT_MUTED_CLASS">
          {{ t('admin.users.page', { page, total: totalPages }) }}
        </span>
        <button
          type="button"
          :class="BTN_SECONDARY_CLASS"
          :disabled="page >= totalPages || loading"
          @click="goToPage(page + 1)"
        >
          {{ t('common.next') }}
        </button>
      </div>
    </section>
  </PageContainer>
</template>

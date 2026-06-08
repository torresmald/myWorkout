<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import WorkoutDetailExercise from '@/components/workout/WorkoutDetailExercise.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import {
  BTN_MOBILE_FULL_CLASS,
  BTN_PRIMARY_CLASS,
  BTN_SECONDARY_CLASS,
  CARD_BODY_CLASS,
  SECTION_TITLE_CLASS,
  TEXT_MUTED_CLASS,
} from '@/constants/ui.constants'
import { useWorkoutSessionStore } from '@/stores/workout-session.store'
import { formatListDate } from '@/utils/date.util'
import { getErrorMessage } from '@/utils/error.util'
import { useToastStore } from '@/stores/toast.store'

const route = useRoute()
const router = useRouter()
const sessionStore = useWorkoutSessionStore()
const toastStore = useToastStore()
const { t } = useI18n()

const workoutId = computed(() => Number(route.params.id))
const { session, loading } = storeToRefs(sessionStore)

const canOpenSession = computed(
  () => session.value && session.value.status !== 'COMPLETED',
)

function statusLabel(status: NonNullable<typeof session.value>['status']) {
  if (status === 'IN_PROGRESS') {
    return t('session.status.inProgress')
  }

  if (status === 'COMPLETED') {
    return t('session.status.completed')
  }

  return t('session.status.planned')
}

async function loadDetail() {
  const id = workoutId.value

  if (!Number.isFinite(id)) {
    await router.replace({ name: 'workouts' })
    return
  }

  try {
    await sessionStore.load(id)
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('workouts.detail.loadError')))
    await router.replace({ name: 'workouts' })
  }
}

function handleEdit() {
  if (!session.value) {
    return
  }

  void router.push({ name: 'workouts', query: { edit: String(session.value.id) } })
}

function handleOpenSession() {
  if (!session.value) {
    return
  }

  void router.push({ name: 'workout-session', params: { id: String(session.value.id) } })
}

onMounted(() => {
  void loadDetail()
})

onUnmounted(() => {
  sessionStore.clear()
})
</script>

<template>
  <PageContainer>
    <div class="mb-4">
      <RouterLink
        to="/workouts"
        class="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        ← {{ t('workouts.detail.backToList') }}
      </RouterLink>

      <div v-if="session" class="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-text-primary sm:text-2xl">{{ session.name }}</h1>
          <time class="mt-1 block text-sm text-text-muted" :datetime="session.date">
            {{ formatListDate(session.date) }}
          </time>
          <p v-if="session.notes" class="mt-2 text-sm text-text-muted">{{ session.notes }}</p>
        </div>

        <span
          class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
          :class="{
            'bg-bg-muted text-text-secondary': session.status === 'PLANNED',
            'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200':
              session.status === 'IN_PROGRESS',
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200':
              session.status === 'COMPLETED',
          }"
        >
          {{ statusLabel(session.status) }}
        </span>
      </div>
    </div>

    <section v-if="loading" :class="[CARD_BODY_CLASS, 'flex items-center justify-center gap-3']">
      <LoadingSpinner />
      <p :class="TEXT_MUTED_CLASS">{{ t('workouts.detail.loading') }}</p>
    </section>

    <template v-else-if="session">
      <section :class="CARD_BODY_CLASS">
        <h2 :class="SECTION_TITLE_CLASS">{{ t('workouts.detail.exercisesTitle') }}</h2>

        <p v-if="session.exercises.length === 0" :class="['text-sm', TEXT_MUTED_CLASS]">
          {{ t('workouts.exercises.empty') }}
        </p>

        <div v-else class="space-y-4">
          <WorkoutDetailExercise
            v-for="exercise in session.exercises"
            :key="exercise.id"
            :exercise="exercise"
            :workout-status="session.status"
          />
        </div>
      </section>

      <section :class="[CARD_BODY_CLASS, 'mt-4 flex flex-col gap-2 sm:flex-row']">
        <button
          v-if="canOpenSession"
          type="button"
          :class="[BTN_PRIMARY_CLASS, BTN_MOBILE_FULL_CLASS, 'sm:w-auto']"
          @click="handleOpenSession"
        >
          {{
            session.status === 'IN_PROGRESS'
              ? t('workouts.list.resumeSession')
              : t('workouts.list.startSession')
          }}
        </button>
        <button
          type="button"
          :class="[BTN_SECONDARY_CLASS, BTN_MOBILE_FULL_CLASS, 'sm:w-auto']"
          @click="handleEdit"
        >
          {{ t('common.edit') }}
        </button>
      </section>
    </template>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import WorkoutSessionExercise from '@/components/workout/WorkoutSessionExercise.vue'
import SpotifyWorkoutButton from '@/components/workout/SpotifyWorkoutButton.vue'
import RestTimerModal from '@/components/workout/RestTimerModal.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { useRestTimer } from '@/composables/useRestTimer'
import {
  BTN_MOBILE_FULL_CLASS,
  BTN_PRIMARY_CLASS,
  BTN_SECONDARY_CLASS,
  CARD_BODY_CLASS,
  SECTION_TITLE_CLASS,
  TEXT_MUTED_CLASS,
} from '@/constants/ui.constants'
import { useModalStore } from '@/stores/modal.store'
import { useToastStore } from '@/stores/toast.store'
import { useWorkoutSessionStore } from '@/stores/workout-session.store'
import { useWorkoutStore } from '@/stores/workout.store'
import { getErrorMessage } from '@/utils/error.util'

const route = useRoute()
const router = useRouter()
const sessionStore = useWorkoutSessionStore()
const workoutStore = useWorkoutStore()
const modalStore = useModalStore()
const toastStore = useToastStore()
const { t } = useI18n()

const workoutId = computed(() => Number(route.params.id))

const {
  session,
  loading,
  starting,
  finishing,
  updatingSetKey,
  completedSetCount,
  totalSetCount,
} = storeToRefs(sessionStore)

const {
  isOpen: isRestTimerOpen,
  isPaused: isRestTimerPaused,
  isFinished: isRestTimerFinished,
  exerciseName: restTimerExerciseName,
  remainingSeconds: restTimerRemainingSeconds,
  totalSeconds: restTimerTotalSeconds,
  start: startRestTimer,
  togglePause: toggleRestTimerPause,
  cancel: cancelRestTimer,
  closeAfterFinish: closeRestTimerAfterFinish,
} = useRestTimer()

const isBusy = computed(() => loading.value || starting.value)
const isCompleted = computed(() => session.value?.status === 'COMPLETED')
const canFinish = computed(
  () => session.value?.status === 'IN_PROGRESS' && !finishing.value && !isBusy.value,
)

const personalRecordSetKeys = ref(new Set<string>())

async function initializeSession() {
  const id = workoutId.value

  if (!Number.isFinite(id)) {
    await router.replace({ name: 'workouts' })
    return
  }

  try {
    const current = await sessionStore.load(id)

    if (current.status === 'COMPLETED') {
      return
    }

    if (current.status === 'PLANNED') {
      await sessionStore.start(id)
    }
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('session.loadError')))
    await router.replace({ name: 'workouts' })
  }
}

async function handleToggleComplete(payload: {
  exerciseId: number
  setNumber: number
  reps: number
  weight: number | null
  completed: boolean
  restSeconds: number
  isLastSet: boolean
  exerciseName: string
}) {
  try {
    const result = await sessionStore.updateSet(workoutId.value, payload.exerciseId, payload.setNumber, {
      reps: payload.reps,
      weight: payload.weight,
      completed: payload.completed,
    })

    if (payload.completed && result.isPersonalRecord && payload.weight !== null) {
      personalRecordSetKeys.value.add(`${payload.exerciseId}-${payload.setNumber}`)

      toastStore.success(
        result.previousMaxWeight !== null
          ? t('personalRecords.newRecordWithPrevious', {
              weight: payload.weight,
              previous: result.previousMaxWeight,
            })
          : t('personalRecords.newRecord', { weight: payload.weight }),
      )
    }

    if (payload.completed && payload.restSeconds > 0 && !payload.isLastSet) {
      startRestTimer(payload.exerciseName, payload.restSeconds)
    }
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('session.updateSetError')))
  }
}

async function handleFinish() {
  if (!canFinish.value) {
    return
  }

  if (completedSetCount.value < totalSetCount.value) {
    const confirmed = await modalStore.confirm({
      title: t('session.incompleteFinishTitle'),
      message: t('session.incompleteFinishMessage'),
      confirmLabel: t('session.finishButton'),
    })

    if (!confirmed) {
      return
    }
  }

  try {
    await sessionStore.finish(workoutId.value)
    await workoutStore.fetchAll(true)
    toastStore.success(t('session.finishSuccess'))
    await router.push({ name: 'workouts' })
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('session.finishError')))
  }
}

onMounted(() => {
  void initializeSession()
})

onUnmounted(() => {
  sessionStore.clear()
})
</script>

<template>
  <PageContainer>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <RouterLink
          to="/workouts"
          class="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          ← {{ t('session.backToWorkouts') }}
        </RouterLink>
        <h1 class="mt-2 text-xl font-semibold text-text-primary sm:text-2xl">
          {{ session?.name ?? t('session.title') }}
        </h1>
        <p v-if="session && !isCompleted" :class="['mt-1', TEXT_MUTED_CLASS]">
          {{
            t('session.progress', {
              completed: completedSetCount,
              total: totalSetCount,
            })
          }}
        </p>
      </div>

      <span
        v-if="session"
        class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
        :class="{
          'bg-bg-muted text-text-secondary': session.status === 'PLANNED',
          'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200':
            session.status === 'IN_PROGRESS',
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200':
            session.status === 'COMPLETED',
        }"
      >
        {{
          session.status === 'PLANNED'
            ? t('session.status.planned')
            : session.status === 'IN_PROGRESS'
              ? t('session.status.inProgress')
              : t('session.status.completed')
        }}
      </span>

      <SpotifyWorkoutButton v-if="session && !isCompleted && !isBusy" />
    </div>

    <section v-if="isBusy" :class="[CARD_BODY_CLASS, 'flex items-center justify-center gap-3']">
      <LoadingSpinner />
      <p :class="TEXT_MUTED_CLASS">{{ t('session.loading') }}</p>
    </section>

    <section
      v-else-if="isCompleted"
      :class="[CARD_BODY_CLASS, 'space-y-4 text-center']"
    >
      <p class="text-text-primary">{{ t('session.alreadyCompleted') }}</p>
      <RouterLink :class="[BTN_SECONDARY_CLASS, BTN_MOBILE_FULL_CLASS, 'inline-flex']" to="/workouts">
        {{ t('session.backToWorkouts') }}
      </RouterLink>
    </section>

    <template v-else-if="session">
      <section :class="CARD_BODY_CLASS">
        <h2 :class="SECTION_TITLE_CLASS">{{ t('session.title') }}</h2>

        <div class="space-y-4">
          <WorkoutSessionExercise
            v-for="exercise in session.exercises"
            :key="exercise.id"
            :exercise="exercise"
            :updating-set-key="updatingSetKey"
            :personal-record-set-keys="personalRecordSetKeys"
            @toggle-complete="handleToggleComplete"
          />
        </div>
      </section>

      <section :class="[CARD_BODY_CLASS, 'mt-4']">
        <button
          type="button"
          :disabled="!canFinish"
          :class="[BTN_PRIMARY_CLASS, BTN_MOBILE_FULL_CLASS, 'w-full']"
          @click="handleFinish"
        >
          {{ finishing ? t('common.saving') : t('session.finishButton') }}
        </button>
      </section>
    </template>

    <RestTimerModal
      :open="isRestTimerOpen"
      :exercise-name="restTimerExerciseName"
      :remaining-seconds="restTimerRemainingSeconds"
      :total-seconds="restTimerTotalSeconds"
      :is-paused="isRestTimerPaused"
      :is-finished="isRestTimerFinished"
      @cancel="cancelRestTimer"
      @toggle-pause="toggleRestTimerPause"
      @close="closeRestTimerAfterFinish"
    />
  </PageContainer>
</template>

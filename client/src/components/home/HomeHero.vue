<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

import Skeleton from '@/components/ui/Skeleton.vue'
import type { WorkoutPublic } from '@/interfaces/workout.interface'
import { formatWorkoutDate } from '@/utils/date.util'

const props = defineProps<{
  loading: boolean
  streak: number
  lastWorkout: WorkoutPublic | null
}>()

const { t } = useI18n()

const streakLabel = computed(() =>
  props.streak === 1
    ? t('home.hero.streakWeekSingular', { count: props.streak })
    : t('home.hero.streakWeeks', { count: props.streak }),
)
</script>

<template>
  <section
    class="relative mb-6 overflow-hidden rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-lg shadow-blue-900/20 dark:border-blue-900/50"
  >
    <div
      class="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -bottom-10 left-8 h-32 w-32 rounded-full bg-sky-400/20 blur-2xl"
      aria-hidden="true"
    />

    <div v-if="loading" class="relative space-y-4">
      <Skeleton width="55%" height="1.75rem" rounded="lg" />
      <Skeleton width="80%" height="1rem" rounded="lg" />
      <div class="grid gap-3 sm:grid-cols-2">
        <Skeleton width="100%" height="4.5rem" rounded="lg" />
        <Skeleton width="100%" height="4.5rem" rounded="lg" />
      </div>
    </div>

    <div v-else class="relative">
      <p class="text-sm font-medium uppercase tracking-[0.18em] text-blue-100">
        {{ t('home.hero.eyebrow') }}
      </p>
      <h2 class="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
        {{ t('home.hero.title') }}
      </h2>
      <p class="mt-2 max-w-xl text-sm text-blue-100 sm:text-base">
        {{ t('home.hero.subtitle') }}
      </p>

      <div class="mt-5 grid gap-3 sm:grid-cols-2">
        <div class="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-blue-100">
            {{ t('home.hero.streakLabel') }}
          </p>
          <p class="mt-1 text-2xl font-bold">{{ streakLabel }}</p>
        </div>

        <div class="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-blue-100">
            {{ t('home.hero.lastWorkoutLabel') }}
          </p>
          <template v-if="lastWorkout">
            <p class="mt-1 truncate font-semibold">{{ lastWorkout.name }}</p>
            <time class="mt-1 block text-sm text-blue-100" :datetime="lastWorkout.date">
              {{ formatWorkoutDate(lastWorkout.date) }}
            </time>
          </template>
          <p v-else class="mt-2 text-sm text-blue-100">{{ t('home.hero.noWorkoutsYet') }}</p>
        </div>
      </div>

      <RouterLink
        v-if="!lastWorkout"
        to="/workouts"
        class="mt-5 inline-flex min-h-11 items-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
      >
        {{ t('home.hero.createFirstWorkout') }}
      </RouterLink>
    </div>
  </section>
</template>

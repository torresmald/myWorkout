<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import HomeHero from '@/components/home/HomeHero.vue'
import HomeQuickLinkIcon from '@/components/home/HomeQuickLinkIcon.vue'
import OnboardingModal from '@/components/onboarding/OnboardingModal.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import { useHomeQuickLinks } from '@/composables/useHomeQuickLinks'
import { CARD_INTERACTIVE_CLASS } from '@/constants/ui.constants'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { useWorkoutStore } from '@/stores/workout.store'
import { getErrorMessage } from '@/utils/error.util'
import { computeWeeklyStreak, getLatestWorkout } from '@/utils/workout-streak.util'

const authStore = useAuthStore()
const workoutStore = useWorkoutStore()
const toastStore = useToastStore()
const { user } = storeToRefs(authStore)
const { workouts, loading } = storeToRefs(workoutStore)
const { t } = useI18n()
const quickLinks = useHomeQuickLinks()

const greeting = computed(() =>
  t('home.greeting', { name: user.value?.name ?? user.value?.email ?? '' }),
)

const streak = computed(() => computeWeeklyStreak(workouts.value))
const lastWorkout = computed(() => getLatestWorkout(workouts.value))

onMounted(async () => {
  try {
    await workoutStore.fetchAll()
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('workouts.loadError')))
  }
})
</script>

<template>
  <PageContainer max-width="3xl">
    <header class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
        {{ greeting }}
      </h1>
      <p class="mt-1 text-sm text-text-secondary sm:text-base">{{ t('home.subtitle') }}</p>
    </header>

    <HomeHero :loading="loading" :streak="streak" :last-workout="lastWorkout" />

    <div class="grid gap-4 sm:grid-cols-2">
      <RouterLink
        v-for="(link, index) in quickLinks"
        :key="link.to"
        :to="link.to"
        :class="[CARD_INTERACTIVE_CLASS, 'stagger-item flex gap-4']"
        :style="{ animationDelay: `${index * 70}ms` }"
      >
        <HomeQuickLinkIcon :icon="link.icon" />
        <div class="min-w-0 flex-1">
          <h2 class="text-lg font-semibold text-text-primary">{{ link.label }}</h2>
          <p class="mt-1 text-sm text-text-secondary">{{ link.description }}</p>
          <span class="mt-3 inline-block text-sm font-medium text-blue-600 dark:text-blue-400">
            {{ t('common.goTo') }}
          </span>
        </div>
      </RouterLink>
    </div>

    <OnboardingModal />
  </PageContainer>
</template>

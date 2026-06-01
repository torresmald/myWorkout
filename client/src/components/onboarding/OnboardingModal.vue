<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AppModal from '@/components/ui/AppModal.vue'
import { ONBOARDING_STORAGE_KEY } from '@/constants/onboarding.constants'
import { BTN_PRIMARY_CLASS, BTN_SECONDARY_CLASS } from '@/constants/ui.constants'

const router = useRouter()
const { t } = useI18n()

const open = ref(localStorage.getItem(ONBOARDING_STORAGE_KEY) !== '1')
const step = ref(0)

const steps = computed(() => [
  {
    title: t('onboarding.steps.welcome.title'),
    description: t('onboarding.steps.welcome.description'),
  },
  {
    title: t('onboarding.steps.exercises.title'),
    description: t('onboarding.steps.exercises.description'),
  },
  {
    title: t('onboarding.steps.workout.title'),
    description: t('onboarding.steps.workout.description'),
  },
])

const currentStep = computed(() => steps.value[step.value])
const isLastStep = computed(() => step.value === steps.value.length - 1)

function closeOnboarding() {
  localStorage.setItem(ONBOARDING_STORAGE_KEY, '1')
  open.value = false
}

function handlePrimaryAction() {
  if (isLastStep.value) {
    closeOnboarding()
    router.push('/workouts')
    return
  }

  step.value += 1
}

function handleSkip() {
  closeOnboarding()
}
</script>

<template>
  <AppModal :open="open" :title="currentStep?.title ?? ''" @close="handleSkip">
    <p class="text-sm leading-relaxed text-text-secondary">
      {{ currentStep?.description }}
    </p>

    <div class="mt-5 flex items-center justify-center gap-2">
      <span
        v-for="(_, index) in steps"
        :key="index"
        class="h-2 w-2 rounded-full transition"
        :class="index === step ? 'bg-blue-600' : 'bg-bg-muted'"
        aria-hidden="true"
      />
    </div>

    <template #footer>
      <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="button" :class="BTN_SECONDARY_CLASS" @click="handleSkip">
          {{ t('onboarding.skip') }}
        </button>
        <button type="button" :class="BTN_PRIMARY_CLASS" @click="handlePrimaryAction">
          {{ isLastStep ? t('onboarding.start') : t('onboarding.next') }}
        </button>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import ProfileSettingsGeneral from '@/components/profile/ProfileSettingsGeneral.vue'
import ProfileSettingsWorkout from '@/components/profile/ProfileSettingsWorkout.vue'
import SpotifyWorkoutSettings from '@/components/profile/SpotifyWorkoutSettings.vue'
import WorkoutReminderSettings from '@/components/profile/WorkoutReminderSettings.vue'
import { CARD_BODY_CLASS, SECTION_TITLE_CLASS, TEXT_MUTED_CLASS } from '@/constants/ui.constants'

const { t } = useI18n()

const SETTINGS_SUBSECTION_CLASS = 'border-t border-border-default pt-6 mt-6'
</script>

<template>
  <section :class="CARD_BODY_CLASS">
    <h2 :class="SECTION_TITLE_CLASS">{{ t('profile.settings.title') }}</h2>
    <p :class="['mb-6 text-sm', TEXT_MUTED_CLASS]">{{ t('profile.settings.description') }}</p>

    <ProfileSettingsGeneral />

    <div :class="SETTINGS_SUBSECTION_CLASS">
      <ProfileSettingsWorkout />
    </div>

    <div :class="SETTINGS_SUBSECTION_CLASS">
      <WorkoutReminderSettings embedded />
    </div>

    <div :class="SETTINGS_SUBSECTION_CLASS">
      <SpotifyWorkoutSettings embedded />
    </div>
  </section>
</template>

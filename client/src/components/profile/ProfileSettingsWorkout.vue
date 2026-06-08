<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores/auth.store'
import { useProfileStore } from '@/stores/profile.store'
import { useToastStore } from '@/stores/toast.store'
import { TEXT_MUTED_CLASS } from '@/constants/ui.constants'
import { getErrorMessage } from '@/utils/error.util'

type WorkoutPreferenceKey =
  | 'restTimerSoundEnabled'
  | 'showPrToast'
  | 'confirmIncompleteFinish'
  | 'allowAutoPlaylist'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const toastStore = useToastStore()
const { user } = storeToRefs(authStore)
const { t } = useI18n()

async function handleToggle(key: WorkoutPreferenceKey, event: Event) {
  const input = event.target as HTMLInputElement
  const nextValue = input.checked

  try {
    await profileStore.savePreferences({ [key]: nextValue })
  } catch (error) {
    input.checked = !nextValue
    toastStore.error(getErrorMessage(error, t('profile.settings.workout.saveError')))
  }
}
</script>

<template>
  <div>
    <h3 class="mb-3 text-sm font-semibold text-text-primary sm:text-base">
      {{ t('profile.settings.workout.title') }}
    </h3>
    <p :class="['mb-4 text-sm', TEXT_MUTED_CLASS]">
      {{ t('profile.settings.workout.description') }}
    </p>

    <div class="space-y-4">
      <label for="allowAutoPlaylist" class="flex cursor-pointer items-start gap-3">
        <input
          id="allowAutoPlaylist"
          type="checkbox"
          class="mt-1 h-4 w-4 rounded border-border-default"
          :checked="user?.allowAutoPlaylist ?? false"
          @change="handleToggle('allowAutoPlaylist', $event)"
        />
        <span>
          <span class="block text-sm font-medium text-text-primary">
            {{ t('profile.settings.workout.allowAutoPlaylist') }}
          </span>
          <span :class="['mt-0.5 block text-xs', TEXT_MUTED_CLASS]">
            {{ t('profile.settings.workout.allowAutoPlaylistHint') }}
          </span>
        </span>
      </label>

      <label for="restTimerSoundEnabled" class="flex cursor-pointer items-start gap-3">
        <input
          id="restTimerSoundEnabled"
          type="checkbox"
          class="mt-1 h-4 w-4 rounded border-border-default"
          :checked="user?.restTimerSoundEnabled ?? true"
          @change="handleToggle('restTimerSoundEnabled', $event)"
        />
        <span>
          <span class="block text-sm font-medium text-text-primary">
            {{ t('profile.settings.workout.restTimerSound') }}
          </span>
          <span :class="['mt-0.5 block text-xs', TEXT_MUTED_CLASS]">
            {{ t('profile.settings.workout.restTimerSoundHint') }}
          </span>
        </span>
      </label>

      <label for="showPrToast" class="flex cursor-pointer items-start gap-3">
        <input
          id="showPrToast"
          type="checkbox"
          class="mt-1 h-4 w-4 rounded border-border-default"
          :checked="user?.showPrToast ?? true"
          @change="handleToggle('showPrToast', $event)"
        />
        <span>
          <span class="block text-sm font-medium text-text-primary">
            {{ t('profile.settings.workout.showPrToast') }}
          </span>
          <span :class="['mt-0.5 block text-xs', TEXT_MUTED_CLASS]">
            {{ t('profile.settings.workout.showPrToastHint') }}
          </span>
        </span>
      </label>

      <label for="confirmIncompleteFinish" class="flex cursor-pointer items-start gap-3">
        <input
          id="confirmIncompleteFinish"
          type="checkbox"
          class="mt-1 h-4 w-4 rounded border-border-default"
          :checked="user?.confirmIncompleteFinish ?? true"
          @change="handleToggle('confirmIncompleteFinish', $event)"
        />
        <span>
          <span class="block text-sm font-medium text-text-primary">
            {{ t('profile.settings.workout.confirmIncompleteFinish') }}
          </span>
          <span :class="['mt-0.5 block text-xs', TEXT_MUTED_CLASS]">
            {{ t('profile.settings.workout.confirmIncompleteFinishHint') }}
          </span>
        </span>
      </label>
    </div>
  </div>
</template>

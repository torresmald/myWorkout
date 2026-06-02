<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import LoadingButton from '@/components/ui/LoadingButton.vue'
import {
  BTN_MOBILE_FULL_CLASS,
  BTN_PRIMARY_CLASS,
  CARD_BODY_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  SECTION_TITLE_CLASS,
  TEXT_MUTED_CLASS,
} from '@/constants/ui.constants'
import { useReminderStore } from '@/stores/reminder.store'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/utils/error.util'
import {
  getBrowserTimezone,
  isNotificationSupported,
  requestNotificationPermission,
} from '@/utils/reminder.util'

const reminderStore = useReminderStore()
const toastStore = useToastStore()
const { t } = useI18n()

const { settings, loading, saving } = storeToRefs(reminderStore)

const pushReminderEnabled = ref(false)
const emailReminderEnabled = ref(false)
const reminderDays = ref<number[]>([])
const reminderTimeLocal = ref('18:00')
const reminderTimezone = ref(getBrowserTimezone())

const dayOptions = computed(() =>
  [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    value: day,
    label: t(`reminders.days.${day as 0 | 1 | 2 | 3 | 4 | 5 | 6}`),
  })),
)

const canSave = computed(
  () =>
    (!pushReminderEnabled.value && !emailReminderEnabled.value) || reminderDays.value.length > 0,
)

function syncFromSettings() {
  if (!settings.value) {
    return
  }

  pushReminderEnabled.value = settings.value.pushReminderEnabled
  emailReminderEnabled.value = settings.value.emailReminderEnabled
  reminderDays.value = [...settings.value.reminderDays]
  reminderTimeLocal.value = settings.value.reminderTimeLocal
  reminderTimezone.value = settings.value.reminderTimezone || getBrowserTimezone()
}

function toggleDay(day: number) {
  if (reminderDays.value.includes(day)) {
    reminderDays.value = reminderDays.value.filter((value) => value !== day)
    return
  }

  reminderDays.value = [...reminderDays.value, day].sort((a, b) => a - b)
}

async function handlePushToggle(enabled: boolean) {
  if (!enabled) {
    pushReminderEnabled.value = false
    return
  }

  if (!isNotificationSupported()) {
    toastStore.error(t('reminders.pushHint'))
    pushReminderEnabled.value = false
    return
  }

  const permission = await requestNotificationPermission()

  if (permission !== 'granted') {
    toastStore.error(t('reminders.permissionDenied'))
    pushReminderEnabled.value = false
    return
  }

  pushReminderEnabled.value = true
  toastStore.success(t('reminders.permissionGranted'))

  if (reminderDays.value.length === 0) {
    reminderDays.value = [1, 3, 5]
  }
}

async function handleSave() {
  if (!canSave.value) {
    toastStore.error(t('reminders.daysRequired'))
    return
  }

  try {
    await reminderStore.saveSettings({
      pushReminderEnabled: pushReminderEnabled.value,
      emailReminderEnabled: emailReminderEnabled.value,
      reminderDays: reminderDays.value,
      reminderTimeLocal: reminderTimeLocal.value,
      reminderTimezone: reminderTimezone.value,
    })
    toastStore.success(t('reminders.saveSuccess'))
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('reminders.saveError')))
  }
}

watch(settings, syncFromSettings, { immediate: true })

onMounted(async () => {
  try {
    await reminderStore.fetchSettings()
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('reminders.loadError')))
  }
})
</script>

<template>
  <section :class="CARD_BODY_CLASS">
    <h2 :class="SECTION_TITLE_CLASS">{{ t('reminders.title') }}</h2>
    <p :class="['mb-4', TEXT_MUTED_CLASS]">{{ t('reminders.description') }}</p>

    <p v-if="settings" :class="['mb-4 text-sm', TEXT_MUTED_CLASS]">
      {{ t('reminders.workoutsLast7Days', { count: settings.workoutsLast7Days }) }}
    </p>

    <div v-if="loading && !settings" :class="TEXT_MUTED_CLASS">{{ t('common.loading') }}</div>

    <form v-else class="space-y-5" @submit.prevent="handleSave">
      <label class="flex items-start gap-3">
        <input
          :checked="pushReminderEnabled"
          type="checkbox"
          class="mt-1 h-4 w-4 rounded border-border-default"
          @change="handlePushToggle(($event.target as HTMLInputElement).checked)"
        />
        <span>
          <span class="block font-medium text-text-primary">{{ t('reminders.pushEnabled') }}</span>
          <span class="mt-1 block text-sm text-text-muted">{{ t('reminders.pushHint') }}</span>
        </span>
      </label>

      <label class="flex items-start gap-3">
        <input
          v-model="emailReminderEnabled"
          type="checkbox"
          class="mt-1 h-4 w-4 rounded border-border-default"
        />
        <span>
          <span class="block font-medium text-text-primary">{{ t('reminders.emailEnabled') }}</span>
          <span class="mt-1 block text-sm text-text-muted">{{ t('reminders.emailHint') }}</span>
        </span>
      </label>

      <div>
        <p :class="LABEL_CLASS">{{ t('reminders.daysLabel') }}</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            v-for="day in dayOptions"
            :key="day.value"
            type="button"
            class="rounded-full border px-3 py-1.5 text-sm font-medium transition"
            :class="
              reminderDays.includes(day.value)
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-border-default text-text-secondary hover:bg-bg-muted'
            "
            @click="toggleDay(day.value)"
          >
            {{ day.label }}
          </button>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="reminder-time" :class="LABEL_CLASS">{{ t('reminders.timeLabel') }}</label>
          <input
            id="reminder-time"
            v-model="reminderTimeLocal"
            type="time"
            required
            :class="INPUT_CLASS"
          />
        </div>

        <div>
          <label for="reminder-timezone" :class="LABEL_CLASS">
            {{ t('reminders.timezoneLabel') }}
          </label>
          <input
            id="reminder-timezone"
            v-model="reminderTimezone"
            type="text"
            readonly
            :class="INPUT_CLASS"
          />
        </div>
      </div>

      <LoadingButton
        type="submit"
        :loading="saving"
        :disabled="!canSave"
        :class="[BTN_PRIMARY_CLASS, BTN_MOBILE_FULL_CLASS]"
      >
        {{ t('common.saveChanges') }}
      </LoadingButton>
    </form>
  </section>
</template>

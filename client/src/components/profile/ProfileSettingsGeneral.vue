<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import LoadingButton from '@/components/ui/LoadingButton.vue'
import PasswordInput from '@/components/ui/PasswordInput.vue'
import { useWeightDisplay } from '@/composables/useWeightDisplay'
import {
  BTN_MOBILE_FULL_CLASS,
  BTN_PRIMARY_CLASS,
  BTN_SECONDARY_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  TEXT_MUTED_CLASS,
} from '@/constants/ui.constants'
import { SUPPORTED_LOCALES, type AppLocale } from '@/constants/locale.constants'
import { THEME_MODES, type ThemeMode } from '@/constants/theme.constants'
import type { WeightUnit } from '@/constants/weight-unit.constants'
import * as profileApi from '@/api/profile.api'
import { useAuthStore } from '@/stores/auth.store'
import { useCookieConsentStore } from '@/stores/cookie-consent.store'
import { useLocaleStore } from '@/stores/locale.store'
import { useModalStore } from '@/stores/modal.store'
import { useProfileStore } from '@/stores/profile.store'
import { useThemeStore } from '@/stores/theme.store'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage, translateMessageCode } from '@/utils/error.util'

const router = useRouter()
const authStore = useAuthStore()
const modalStore = useModalStore()
const cookieStore = useCookieConsentStore()
const profileStore = useProfileStore()
const localeStore = useLocaleStore()
const themeStore = useThemeStore()
const toastStore = useToastStore()
const { locale } = storeToRefs(localeStore)
const { mode } = storeToRefs(themeStore)
const { unit, setUnit: setWeightUnit } = useWeightDisplay()
const { t } = useI18n()

const exporting = ref(false)
const deletingAccount = ref(false)
const deletePassword = ref('')

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const changingPassword = ref(false)

const draftLocale = ref<AppLocale>('es')
const draftTheme = ref<ThemeMode>('system')
const draftWeightUnit = ref<WeightUnit>('kg')
const saving = ref(false)

const themeOptionLabels: Record<
  ThemeMode,
  | 'profile.settings.general.themeLight'
  | 'profile.settings.general.themeDark'
  | 'profile.settings.general.themeSystem'
> = {
  light: 'profile.settings.general.themeLight',
  dark: 'profile.settings.general.themeDark',
  system: 'profile.settings.general.themeSystem',
}

const themeOptions = computed(() =>
  THEME_MODES.map((value) => ({
    value,
    label: t(themeOptionLabels[value]),
  })),
)

const localeOptions = computed(() =>
  SUPPORTED_LOCALES.map((value) => ({
    value,
    label: value === 'es' ? t('layout.languageEs') : t('layout.languageEn'),
  })),
)

const weightUnitOptions: {
  value: WeightUnit
  labelKey: 'profile.settings.general.weightUnitKg' | 'profile.settings.general.weightUnitLb'
}[] = [
  { value: 'kg', labelKey: 'profile.settings.general.weightUnitKg' },
  { value: 'lb', labelKey: 'profile.settings.general.weightUnitLb' },
]

const hasChanges = computed(
  () =>
    draftLocale.value !== locale.value ||
    draftTheme.value !== mode.value ||
    draftWeightUnit.value !== unit.value,
)

function syncDraftFromStores() {
  draftLocale.value = locale.value
  draftTheme.value = mode.value
  draftWeightUnit.value = unit.value
}

onMounted(() => {
  syncDraftFromStores()
})

async function handleSave() {
  if (!hasChanges.value) {
    toastStore.error(t('profile.settings.noChanges'))
    return
  }

  saving.value = true

  try {
    const prefs = await profileStore.savePreferences({
      locale: draftLocale.value,
      themeMode: draftTheme.value,
      weightUnit: draftWeightUnit.value,
    })
    themeStore.syncFromUser(prefs.themeMode)
    setWeightUnit(prefs.weightUnit)
    localeStore.syncFromUser(prefs.locale)
    toastStore.success(t('profile.settings.saveSuccess'))
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('profile.settings.saveError')))
  } finally {
    saving.value = false
  }
}

async function handleExportData() {
  exporting.value = true

  try {
    const data = await profileApi.exportUserData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `myworkout-export-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    toastStore.success(t('profile.settings.exportSuccess'))
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('profile.settings.exportError')))
  } finally {
    exporting.value = false
  }
}

async function handleChangePassword() {
  if (newPassword.value !== confirmPassword.value) {
    toastStore.error(t('profile.settings.security.passwordsMismatch'))
    return
  }

  changingPassword.value = true

  try {
    const result = await profileApi.changePassword({
      currentPassword: currentPassword.value.trim() || undefined,
      newPassword: newPassword.value,
    })
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    toastStore.success(translateMessageCode(result.messageCode))
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('profile.settings.security.changePasswordError')))
  } finally {
    changingPassword.value = false
  }
}

async function handleDeleteAccount() {
  const confirmed = await modalStore.confirm({
    title: t('profile.settings.privacy.deleteAccountTitle'),
    message: t('profile.settings.privacy.deleteAccountMessage'),
    confirmLabel: t('profile.settings.privacy.deleteAccountConfirm'),
    variant: 'danger',
  })

  if (!confirmed) {
    return
  }

  deletingAccount.value = true

  try {
    await profileApi.deleteAccount({
      password: deletePassword.value.trim() || undefined,
    })
    await authStore.logout()
    toastStore.success(t('profile.settings.privacy.deleteAccountSuccess'))
    await router.push({ name: 'login' })
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('profile.settings.privacy.deleteAccountError')))
  } finally {
    deletingAccount.value = false
  }
}
</script>

<template>
  <div>
    <h3 class="mb-3 text-sm font-semibold text-text-primary sm:text-base">
      {{ t('profile.settings.general.title') }}
    </h3>

    <form class="space-y-4" novalidate @submit.prevent="handleSave">
      <div>
        <label for="settings-locale" :class="LABEL_CLASS">
          {{ t('profile.settings.general.language') }}
        </label>
        <select id="settings-locale" v-model="draftLocale" :class="[INPUT_CLASS, 'mt-1']">
          <option v-for="option in localeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <p :class="['mt-1 text-xs', TEXT_MUTED_CLASS]">
          {{ t('profile.settings.general.headerHint') }}
        </p>
      </div>

      <div>
        <label for="settings-theme" :class="LABEL_CLASS">{{ t('profile.settings.general.theme') }}</label>
        <select id="settings-theme" v-model="draftTheme" :class="[INPUT_CLASS, 'mt-1']">
          <option v-for="option in themeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <p :class="['mt-1 text-xs', TEXT_MUTED_CLASS]">
          {{ t('profile.settings.general.themeHeaderHint') }}
        </p>
      </div>

      <div>
        <label for="settings-weight-unit" :class="LABEL_CLASS">
          {{ t('profile.settings.general.weightUnit') }}
        </label>
        <select id="settings-weight-unit" v-model="draftWeightUnit" :class="[INPUT_CLASS, 'mt-1']">
          <option v-for="option in weightUnitOptions" :key="option.value" :value="option.value">
            {{ t(option.labelKey) }}
          </option>
        </select>
        <p :class="['mt-1 text-xs', TEXT_MUTED_CLASS]">
          {{ t('profile.settings.general.weightUnitHint') }}
        </p>
      </div>

      <LoadingButton
        type="submit"
        :loading="saving"
        :disabled="!hasChanges"
        :class="[BTN_PRIMARY_CLASS, BTN_MOBILE_FULL_CLASS, 'sm:w-auto']"
      >
        {{ t('common.saveChanges') }}
      </LoadingButton>
    </form>

    <div class="mt-6 border-t border-border-default pt-6">
      <h3 class="mb-3 text-sm font-semibold text-text-primary sm:text-base">
        {{ t('profile.settings.security.title') }}
      </h3>
      <p :class="['mb-4 text-sm', TEXT_MUTED_CLASS]">
        {{ t('profile.settings.security.description') }}
      </p>

      <form class="space-y-4" novalidate @submit.prevent="handleChangePassword">
        <div>
          <label for="change-password-current" :class="LABEL_CLASS">
            {{ t('profile.settings.security.currentPassword') }}
          </label>
          <div class="mt-1">
            <PasswordInput
              id="change-password-current"
              v-model="currentPassword"
              autocomplete="current-password"
              :placeholder="t('profile.settings.security.currentPasswordPlaceholder')"
            />
          </div>
          <p :class="['mt-1 text-xs', TEXT_MUTED_CLASS]">
            {{ t('profile.settings.security.currentPasswordHint') }}
          </p>
        </div>

        <div>
          <label for="change-password-new" :class="LABEL_CLASS">
            {{ t('profile.settings.security.newPassword') }}
          </label>
          <div class="mt-1">
            <PasswordInput
              id="change-password-new"
              v-model="newPassword"
              autocomplete="new-password"
              :minlength="6"
              required
              :placeholder="t('profile.settings.security.newPasswordPlaceholder')"
            />
          </div>
        </div>

        <div>
          <label for="change-password-confirm" :class="LABEL_CLASS">
            {{ t('profile.settings.security.confirmPassword') }}
          </label>
          <div class="mt-1">
            <PasswordInput
              id="change-password-confirm"
              v-model="confirmPassword"
              autocomplete="new-password"
              :minlength="6"
              required
              :placeholder="t('profile.settings.security.confirmPasswordPlaceholder')"
            />
          </div>
        </div>

        <LoadingButton
          type="submit"
          :loading="changingPassword"
          :disabled="!newPassword || !confirmPassword"
          :class="[BTN_PRIMARY_CLASS, BTN_MOBILE_FULL_CLASS, 'sm:w-auto']"
        >
          {{ t('profile.settings.security.changePasswordButton') }}
        </LoadingButton>
      </form>
    </div>

    <div class="mt-6 border-t border-border-default pt-6">
      <h3 class="mb-3 text-sm font-semibold text-text-primary sm:text-base">
        {{ t('profile.settings.privacy.title') }}
      </h3>
      <p :class="['mb-4 text-sm', TEXT_MUTED_CLASS]">
        {{ t('profile.settings.privacy.description') }}
      </p>

      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <RouterLink to="/cookies" :class="BTN_SECONDARY_CLASS">
          {{ t('profile.settings.privacy.cookiesPolicy') }}
        </RouterLink>
        <button type="button" :class="BTN_SECONDARY_CLASS" @click="cookieStore.openPreferences()">
          {{ t('profile.settings.privacy.manageCookies') }}
        </button>
        <LoadingButton
          type="button"
          :loading="exporting"
          :class="BTN_SECONDARY_CLASS"
          @click="handleExportData"
        >
          {{ t('profile.settings.privacy.exportData') }}
        </LoadingButton>
      </div>

      <div class="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
        <h4 class="text-sm font-semibold text-red-900 dark:text-red-100">
          {{ t('profile.settings.privacy.deleteAccountTitle') }}
        </h4>
        <p class="mt-2 text-sm text-red-800 dark:text-red-200">
          {{ t('profile.settings.privacy.deleteAccountDescription') }}
        </p>
        <div class="mt-4">
          <label for="delete-account-password" :class="LABEL_CLASS">
            {{ t('profile.settings.privacy.deleteAccountPassword') }}
          </label>
          <input
            id="delete-account-password"
            v-model="deletePassword"
            type="password"
            autocomplete="current-password"
            :class="[INPUT_CLASS, 'mt-1']"
            :placeholder="t('profile.settings.privacy.deleteAccountPasswordPlaceholder')"
          />
          <p :class="['mt-1 text-xs', TEXT_MUTED_CLASS]">
            {{ t('profile.settings.privacy.deleteAccountPasswordHint') }}
          </p>
        </div>
        <LoadingButton
          type="button"
          :loading="deletingAccount"
          class="mt-4 inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          @click="handleDeleteAccount"
        >
          {{ t('profile.settings.privacy.deleteAccountButton') }}
        </LoadingButton>
      </div>
    </div>
  </div>
</template>
